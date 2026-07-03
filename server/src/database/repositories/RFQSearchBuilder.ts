import { SearchBuilder } from './SearchBuilder';

export class RFQSearchBuilder extends SearchBuilder<any> {
  constructor() {
    super();
    this.baseQuery = `
      SELECT r.*, 
        u_creator.name as creator_name,
        u_assigned.name as assigned_name,
        u_archived.name as archived_name
      FROM rfqs r
      LEFT JOIN users u_creator ON r.created_by_id = u_creator.id
      LEFT JOIN users u_assigned ON r.assigned_to_id = u_assigned.id
      LEFT JOIN users u_archived ON r.archived_by_id = u_archived.id
    `;
    this.conditions.push("r.deleted_at IS NULL"); 
  }

  public withStatus(status?: string): this {
    if (status && status.toLowerCase() !== 'all') {
      this.params.push(status.toUpperCase());
      this.conditions.push(`r.status = $${this.params.length}`);
    }
    return this;
  }

  public withPriority(priority?: string): this {
    if (priority && priority.toLowerCase() !== 'all') {
      this.params.push(priority.toUpperCase());
      this.conditions.push(`r.priority = $${this.params.length}`);
    }
    return this;
  }

  public withAssignedToId(assignedToId?: string): this {
    if (assignedToId && assignedToId.toLowerCase() !== 'all') {
      this.params.push(assignedToId);
      this.conditions.push(`r.assigned_to_id = $${this.params.length}`);
    }
    return this;
  }

  public withCategory(category?: string): this {
    if (category && category.toLowerCase() !== 'all') {
      this.params.push(`%${category}%`);
      this.conditions.push(`r.category ILIKE $${this.params.length}`);
    }
    return this;
  }

  public withCompany(companyName?: string): this {
    if (companyName && companyName.toLowerCase() !== 'all') {
      this.params.push(`%${companyName}%`);
      this.conditions.push(`r.customer_json->>'companyName' ILIKE $${this.params.length}`);
    }
    return this;
  }

  public withLocation(location?: string): this {
    if (location && location.toLowerCase() !== 'all') {
      this.params.push(`%${location}%`);
      this.conditions.push(`r.location ILIKE $${this.params.length}`);
    }
    return this;
  }

  public withSearch(search?: string): this {
    if (search) {
      this.params.push(`%${search}%`);
      const searchParamIdx = this.params.length;
      this.conditions.push(`(
        r.rfq_number ILIKE $${searchParamIdx} OR
        r.name ILIKE $${searchParamIdx} OR
        r.customer_json->>'companyName' ILIKE $${searchParamIdx} OR
        r.category ILIKE $${searchParamIdx}
      )`);
    }
    return this;
  }

  public withOverdue(isOverdue?: boolean): this {
    if (isOverdue) {
      this.conditions.push(`
        r.due_date < CURRENT_TIMESTAMP AND 
        r.status NOT IN ('APPROVED', 'CONVERTED', 'REJECTED', 'EXPIRED')
      `);
    }
    return this;
  }

  public withHasAttachments(hasAttachments?: boolean): this {
    if (hasAttachments !== undefined) {
      if (hasAttachments) {
        this.conditions.push(`
          EXISTS (
            SELECT 1 FROM attachments a 
            WHERE a.entity_type = 'RFQ' AND a.entity_id = r.id
          )
        `);
      } else {
        this.conditions.push(`
          NOT EXISTS (
            SELECT 1 FROM attachments a 
            WHERE a.entity_type = 'RFQ' AND a.entity_id = r.id
          )
        `);
      }
    }
    return this;
  }

  public withIsArchived(isArchived?: boolean): this {
    if (isArchived !== undefined) {
      this.conditions.push(`r.is_archived = ${isArchived ? 'TRUE' : 'FALSE'}`);
    }
    return this;
  }

  public withPagination(page: number = 1, pageSize: number = 25): this {
    this.pageNum = page;
    this.sizeNum = pageSize;
    return this;
  }

  public withSorting(sort: string = 'timestamp', direction: 'ASC' | 'DESC' = 'DESC'): this {
    const allowedSortColumns: Record<string, string> = {
      'rfqNumber': 'r.rfq_number',
      'status': 'r.status',
      'priority': 'r.priority',
      'dueDate': 'r.due_date',
      'value': 'r.value',
      'timestamp': 'r.timestamp',
      'updatedAt': 'r.updated_at'
    };
    this.sortColumn = allowedSortColumns[sort] || 'r.timestamp';
    this.sortDirection = direction === 'ASC' ? 'ASC' : 'DESC';
    return this;
  }

  public build(): { query: string; params: any[] } {
    let query = this.baseQuery;
    if (this.conditions.length > 0) {
      query += ` WHERE ` + this.conditions.join(' AND ');
    }

    query += ` ORDER BY ${this.sortColumn} ${this.sortDirection}`;

    const offset = (this.pageNum - 1) * this.sizeNum;
    const finalParams = [...this.params];
    finalParams.push(this.sizeNum);
    query += ` LIMIT $${finalParams.length}`;
    
    finalParams.push(offset);
    query += ` OFFSET $${finalParams.length}`;

    return {
      query,
      params: finalParams
    };
  }

  public buildCountQuery(): { query: string; params: any[] } {
    let query = `
      SELECT COUNT(*) as total 
      FROM rfqs r
    `;
    const countParams = [...this.params];
    const countConditions = [...this.conditions];

    if (countConditions.length > 0) {
      query += ` WHERE ` + countConditions.join(' AND ');
    }

    return {
      query,
      params: countParams
    };
  }
}
