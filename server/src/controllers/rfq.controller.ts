import { Request, Response } from 'express';
import { pgPool } from '../database/db';
import { RFQRepository } from '../database/repositories/rfq.repository';
import { CommentRepository } from '../database/repositories/comment.repository';
import { AttachmentRepository } from '../database/repositories/attachment.repository';
import { ActivityRepository } from '../database/repositories/activity.repository';
import { RFQSearchBuilder } from '../database/repositories/RFQSearchBuilder';
import { RFQStateMachine } from '../domain/rfq/RFQStateMachine';
import { PermissionEngine } from '../domain/shared/PermissionEngine';
import { EventBus } from '../domain/shared/EventBus';
import { RFQStatus, Priority } from '../domain/rfq/RFQConstants';

const pool = pgPool!;
const rfqRepo = new RFQRepository(pool);
const commentRepo = new CommentRepository(pool);
const attachmentRepo = new AttachmentRepository(pool);
const activityRepo = new ActivityRepository(pool);

export class RFQController {
  
  public async searchRfqs(req: any, res: Response) {
    try {
      const builder = new RFQSearchBuilder();
      const {
        status, priority, assignedToId, category, company, location,
        search, overdue, hasAttachments, isArchived, page, pageSize, sort, direction
      } = req.query;

      builder
        .withStatus(status)
        .withPriority(priority)
        .withAssignedToId(assignedToId)
        .withCategory(category)
        .withCompany(company)
        .withLocation(location)
        .withSearch(search)
        .withOverdue(overdue === 'true')
        .withIsArchived(isArchived === 'true')
        .withPagination(Number(page) || 1, Number(pageSize) || 25)
        .withSorting(sort || 'timestamp', direction || 'DESC');

      if (hasAttachments !== undefined) {
        builder.withHasAttachments(hasAttachments === 'true');
      }

      const result = await rfqRepo.findPaginated(builder);
      res.json({
        success: true,
        rows: result.rows,
        total: result.total,
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 25
      });
    } catch (err: any) {
      console.error('[RFQController] searchRfqs error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async getRfqById(req: any, res: Response) {
    try {
      const { id } = req.params;
      const rfq = await rfqRepo.findById(id);
      if (!rfq) {
        return res.status(404).json({ error: 'RFQ not found' });
      }

      const [items, watchers, assignment, assignmentHistory, comments, attachments] = await Promise.all([
        rfqRepo.findItemsByRfqId(id),
        rfqRepo.findWatchersByRfqId(id),
        rfqRepo.findAssignmentsByRfqId(id),
        rfqRepo.findAssignmentHistoryByRfqId(id),
        commentRepo.findByRfqId(id),
        attachmentRepo.findByEntity('RFQ', id)
      ]);

      res.json({
        success: true,
        rfq,
        items,
        watchers,
        assignment,
        assignmentHistory,
        comments,
        attachments
      });
    } catch (err: any) {
      console.error('[RFQController] getRfqById error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async updateStatus(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const performer = req.user;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const rfq = await rfqRepo.findById(id);
      if (!rfq) {
        return res.status(404).json({ error: 'RFQ not found' });
      }

      const currentStatus = rfq.status as RFQStatus;
      const targetStatus = status.toUpperCase() as RFQStatus;

      if (!RFQStateMachine.canTransition(currentStatus, targetStatus)) {
        return res.status(400).json({
          error: `Illegal state transition: Cannot change status from ${currentStatus} to ${targetStatus}`
        });
      }

      const updated = await rfqRepo.executeTransaction(async (client) => {
        const currentRfqState = { ...rfq, status: targetStatus, updated_by_id: performer.id };
        const saved = await rfqRepo.save(client, currentRfqState);

        await activityRepo.save(client, {
          entity_type: 'RFQ',
          entity_id: id,
          action: 'STATUS_CHANGED',
          title: `Status changed to ${targetStatus}`,
          description: `RFQ status transition executed from ${currentStatus} to ${targetStatus}`,
          performed_by_id: performer.id,
          prev_value: currentStatus,
          new_value: targetStatus
        });

        return saved;
      });

      EventBus.getInstance().publish('RFQ_UPDATED', {
        rfqId: id,
        rfqNumber: rfq.rfq_number,
        status: targetStatus,
        performedBy: performer.name
      });

      res.json({ success: true, rfq: updated });
    } catch (err: any) {
      console.error('[RFQController] updateStatus error:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public async updateAssignment(req: any, res: Response) {
    try {
      const { id } = req.params;
      const primaryOwnerId = req.body.primaryOwnerId || req.body.owner;
      const { secondaryOwnerId, notes, reason } = req.body;
      const performer = req.user;

      if (!PermissionEngine.canAssign(performer.role, performer.adminRole)) {
        return res.status(403).json({ error: 'Access denied: Insufficient permissions to assign RFQs' });
      }

      if (!primaryOwnerId) {
        return res.status(400).json({ error: 'Primary owner ID is required' });
      }

      const rfq = await rfqRepo.findById(id);
      if (!rfq) {
        return res.status(404).json({ error: 'RFQ not found' });
      }

      await rfqRepo.executeTransaction(async (client) => {
        await rfqRepo.updateAssignment(
          client,
          id,
          primaryOwnerId,
          secondaryOwnerId || null,
          performer.id,
          notes,
          reason
        );

        await activityRepo.save(client, {
          entity_type: 'RFQ',
          entity_id: id,
          action: 'ASSIGNMENT_UPDATED',
          title: 'Ownership Assignment Updated',
          description: `Assigned primary owner ${primaryOwnerId}${secondaryOwnerId ? ` and secondary owner ${secondaryOwnerId}` : ''}`,
          performed_by_id: performer.id,
          prev_value: rfq.assigned_to_id,
          new_value: primaryOwnerId
        });
      });

      EventBus.getInstance().publish('RFQ_ASSIGNMENT_CHANGED', {
        rfqId: id,
        rfqNumber: rfq.rfq_number,
        primaryOwnerId,
        secondaryOwnerId,
        assignedById: performer.id,
        notes
      });

      res.json({ success: true, message: 'Ownership assignment updated successfully' });
    } catch (err: any) {
      console.error('[RFQController] updateAssignment error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async addComment(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { text, isInternal, parentCommentId } = req.body;
      const performer = req.user;

      if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Comment text is required' });
      }

      const rfq = await rfqRepo.findById(id);
      if (!rfq) {
        return res.status(404).json({ error: 'RFQ not found' });
      }

      const savedComment = await rfqRepo.executeTransaction(async (client) => {
        const c = await commentRepo.save(client, {
          rfq_id: id,
          author_id: performer.id,
          author_name: performer.name,
          author_role: performer.role,
          text,
          is_internal: isInternal !== undefined ? isInternal : true,
          parent_comment_id: parentCommentId
        });

        await activityRepo.save(client, {
          entity_type: 'RFQ',
          entity_id: id,
          action: 'COMMENT_ADDED',
          title: `Comment added by ${performer.name}`,
          description: text.substring(0, 100),
          performed_by_id: performer.id
        });

        return c;
      });

      const watchersRes = await rfqRepo.findWatchersByRfqId(id);
      const watchers = watchersRes.map(w => w.user_id);

      EventBus.getInstance().publish('COMMENT_ADDED', {
        rfqId: id,
        rfqNumber: rfq.rfq_number,
        commentId: savedComment.id,
        authorName: performer.name,
        text,
        watchers
      });

      res.status(201).json({ success: true, comment: savedComment });
    } catch (err: any) {
      console.error('[RFQController] addComment error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async uploadAttachment(req: any, res: Response) {
    try {
      const { id } = req.params;
      const performer = req.user;

      const filename = req.file?.originalname || req.body.filename;
      const mimeType = req.file?.mimetype || req.body.mimeType || req.body.fileType || 'application/octet-stream';
      const size = req.file?.size || Number(req.body.size) || 0;

      if (!filename) {
        return res.status(400).json({ error: 'Filename or file payload is required' });
      }

      const rfq = await rfqRepo.findById(id);
      if (!rfq) {
        return res.status(404).json({ error: 'RFQ not found' });
      }

      const storageKey = `uploads/rfq/${id}/${filename}`;
      const publicUrl = `/api/attachments/download/${filename}`;
      const checksum = Math.random().toString(36).substring(7);

      const savedAttachment = await rfqRepo.executeTransaction(async (client) => {
        const att = await attachmentRepo.save(client, {
          entity_type: 'RFQ',
          entity_id: id,
          filename,
          storage_provider: 'local',
          storage_key: storageKey,
          public_url: publicUrl,
          mime_type: mimeType,
          size,
          uploaded_by_id: performer.id,
          version: 'v1.0',
          checksum
        });

        await activityRepo.save(client, {
          entity_type: 'RFQ',
          entity_id: id,
          action: 'ATTACHMENT_ADDED',
          title: `Attachment added: ${filename}`,
          description: `Uploaded file size: ${(size / 1024).toFixed(2)} KB`,
          performed_by_id: performer.id
        });

        return att;
      });

      res.status(201).json({ success: true, attachment: savedAttachment });
    } catch (err: any) {
      console.error('[RFQController] uploadAttachment error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async addWatcher(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      await rfqRepo.executeTransaction(async (client) => {
        await rfqRepo.addWatcher(client, id, userId);
      });

      res.json({ success: true, message: 'Watcher added successfully' });
    } catch (err: any) {
      console.error('[RFQController] addWatcher error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async removeWatcher(req: any, res: Response) {
    try {
      const { id, userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      await rfqRepo.executeTransaction(async (client) => {
        await rfqRepo.removeWatcher(client, id, userId);
      });

      res.json({ success: true, message: 'Watcher removed successfully' });
    } catch (err: any) {
      console.error('[RFQController] removeWatcher error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async deleteRfq(req: any, res: Response) {
    try {
      const { id } = req.params;
      const performer = req.user;

      if (!PermissionEngine.canDelete(performer.role, performer.adminRole)) {
        return res.status(403).json({ error: 'Access denied: Only admins can delete RFQs' });
      }

      await rfqRepo.executeTransaction(async (client) => {
        await rfqRepo.softDelete(client, id, performer.id);
      });

      EventBus.getInstance().publish('RFQ_DELETED', { rfqId: id, performedBy: performer.name });

      res.json({ success: true, message: 'RFQ deleted successfully' });
    } catch (err: any) {
      console.error('[RFQController] deleteRfq error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async archiveRfq(req: any, res: Response) {
    try {
      const { id } = req.params;
      const performer = req.user;

      if (!PermissionEngine.canArchive(performer.role, performer.adminRole)) {
        return res.status(403).json({ error: 'Access denied: Insufficient permissions to archive RFQs' });
      }

      await rfqRepo.executeTransaction(async (client) => {
        await rfqRepo.archive(client, id, performer.id);
        
        await activityRepo.save(client, {
          entity_type: 'RFQ',
          entity_id: id,
          action: 'RFQ_ARCHIVED',
          title: 'RFQ Archived',
          description: `Archived by admin operator ${performer.name}`,
          performed_by_id: performer.id
        });
      });

      res.json({ success: true, message: 'RFQ archived successfully' });
    } catch (err: any) {
      console.error('[RFQController] archiveRfq error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async deleteAttachment(req: any, res: Response) {
    try {
      const { attachmentId } = req.params;
      await rfqRepo.executeTransaction(async (client) => {
        await attachmentRepo.delete(client, attachmentId);
      });
      res.json({ success: true, message: 'Attachment deleted successfully' });
    } catch (err: any) {
      console.error('[RFQController] deleteAttachment error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
