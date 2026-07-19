/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Printer, Download, Mail, MessageSquare, History, FileText, Loader2, AlertCircle } from 'lucide-react';
import { ResendService } from './resendService';
import { apiFetch } from '../../lib/api';

interface DocumentVersion {
  version: string;
  timestamp: string;
  createdByName: string;
  changeReason: string;
}

interface AuditRecord {
  action: string;
  performedBy: string;
  timestamp: string;
}

interface DocumentEngineProps {
  documentId: string;
  documentType: 'invoice' | 'booking' | 'quotation' | 'purchase_order';
  title: string;
  previewUrl: string;
  downloadUrl: string;
  versions?: DocumentVersion[];
  initialAuditTrail?: AuditRecord[];
  onAuditAction?: (action: string) => void;
}

export const DocumentEngine: React.FC<DocumentEngineProps> = ({
  documentId,
  documentType,
  title,
  previewUrl,
  downloadUrl,
  versions = [],
  initialAuditTrail = [],
  onAuditAction,
}) => {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [shareStatus, setShareStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Local audit trail tracking
  const [auditTrail, setAuditTrail] = useState<AuditRecord[]>(initialAuditTrail);

  const logAudit = (action: string) => {
    const newRecord: AuditRecord = {
      action,
      performedBy: 'Current User', // Resolved by session
      timestamp: new Date().toISOString(),
    };
    setAuditTrail((prev) => [newRecord, ...prev]);
    onAuditAction?.(action);
  };

  const handlePrint = () => {
    logAudit('Printed Document');
    const printWindow = window.open(previewUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleDownload = async () => {
    try {
      logAudit('Downloaded Document');
      const token = localStorage.getItem('arcus_token');
      const res = await apiFetch(downloadUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentType}_${documentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setShareStatus(null);
    try {
      const res = await ResendService.sendEmail({
        to: recipientEmail,
        subject: `ARCUS Document Delivery: ${title} (${documentId})`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>ARCUS Platform Document Delivery</h2>
            <p>You have received a document from ARCUS Construction Commerce.</p>
            <p><strong>Document Title:</strong> ${title}</p>
            <p><strong>Reference ID:</strong> ${documentId}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">This is an automated notification from the ARCUS Compliance Platform.</p>
          </div>
        `
      });

      if (res.success) {
        logAudit(`Shared via Email to ${recipientEmail}`);
        setShareStatus({ type: 'success', message: 'Email sent successfully!' });
        setRecipientEmail('');
        setTimeout(() => setEmailModalOpen(false), 1500);
      } else {
        throw new Error(res.error || 'Failed to dispatch email.');
      }
    } catch (err: any) {
      setShareStatus({ type: 'error', message: err.message || 'Failed to send email.' });
    } finally {
      setSending(false);
    }
  };

  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setShareStatus(null);
    try {
      const res = await ResendService.sendWhatsApp({
        phone: recipientPhone,
        message: `Hello, here is your ARCUS Document reference: *${title}* (${documentId}). View online or track via portal.`
      });

      if (res.success) {
        logAudit(`Shared via WhatsApp to ${recipientPhone}`);
        setShareStatus({ type: 'success', message: 'WhatsApp message sent successfully!' });
        setRecipientPhone('');
        setTimeout(() => setWhatsappModalOpen(false), 1500);
      } else {
        throw new Error(res.error || 'Failed to send message.');
      }
    } catch (err: any) {
      setShareStatus({ type: 'error', message: err.message || 'Failed to send message.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Control Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="text-primary" size={20} />
          <h2 className="font-semibold text-slate-800 text-sm">{title}</h2>
          <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full font-mono">
            {documentId}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrint}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-2xs"
            title="Print Document"
          >
            <Printer size={16} />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-2xs"
            title="Download PDF"
          >
            <Download size={16} />
          </button>
          <button
            onClick={() => setEmailModalOpen(true)}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-2xs"
            title="Share via Email"
          >
            <Mail size={16} />
          </button>
          <button
            onClick={() => setWhatsappModalOpen(true)}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-2xs"
            title="Share via WhatsApp"
          >
            <MessageSquare size={16} />
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Preview Frame */}
        <div className="flex-1 bg-slate-300 relative">
          <iframe
            src={`${previewUrl}#toolbar=0&navpanes=0`}
            className="w-full h-full border-0"
            title="PDF Document Preview"
          />
        </div>

        {/* Audit & Versions Pane */}
        <div className="w-72 bg-white border-l border-slate-200 flex flex-col overflow-y-auto">
          {/* Versions */}
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-3">
              <History size={12} /> Document Versions
            </h3>
            {versions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No historical versions available.</p>
            ) : (
              <div className="space-y-2">
                {versions.map((ver, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">Version {ver.version}</span>
                      <span className="text-2xs text-slate-400">{new Date(ver.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-2xs text-slate-500 mb-1">{ver.changeReason}</p>
                    <span className="text-2xs font-medium text-slate-400">By {ver.createdByName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Trail */}
          <div className="p-4 flex-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-3">
              <FileText size={12} /> Compliance Audit Trail
            </h3>
            {auditTrail.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No events logged.</p>
            ) : (
              <div className="relative border-l border-slate-200 ml-1.5 pl-4 space-y-4">
                {auditTrail.map((record, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white" />
                    <div className="text-xs font-medium text-slate-800">{record.action}</div>
                    <div className="text-2xs text-slate-400">{new Date(record.timestamp).toLocaleString()}</div>
                    <div className="text-2xs text-slate-400 font-semibold">User: {record.performedBy}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modals */}
      {emailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 px-4">
          <form onSubmit={handleSendEmail} className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 max-w-sm w-full">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
              <Mail size={16} className="text-primary" />
              Share via Email
            </h3>
            <input
              type="email"
              required
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full border-slate-200 rounded-lg py-2 px-3 text-xs focus:ring-primary focus:border-primary mb-3 focus:outline-hidden"
            />
            {shareStatus && (
              <div className={`p-2.5 rounded-lg flex items-center gap-2 mb-3 text-xs ${
                shareStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <AlertCircle size={14} />
                <span>{shareStatus.message}</span>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setEmailModalOpen(false); setShareStatus(null); }}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 rounded-md border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary-hover text-white rounded-md shadow-xs flex items-center gap-1"
              >
                {sending && <Loader2 size={12} className="animate-spin" />}
                Send Invoice
              </button>
            </div>
          </form>
        </div>
      )}

      {whatsappModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 px-4">
          <form onSubmit={handleSendWhatsApp} className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 max-w-sm w-full">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
              <MessageSquare size={16} className="text-primary" />
              Share via WhatsApp
            </h3>
            <input
              type="text"
              required
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="e.g. +91 9876543210"
              className="w-full border-slate-200 rounded-lg py-2 px-3 text-xs focus:ring-primary focus:border-primary mb-3 focus:outline-hidden"
            />
            {shareStatus && (
              <div className={`p-2.5 rounded-lg flex items-center gap-2 mb-3 text-xs ${
                shareStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <AlertCircle size={14} />
                <span>{shareStatus.message}</span>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setWhatsappModalOpen(false); setShareStatus(null); }}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 rounded-md border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary-hover text-white rounded-md shadow-xs flex items-center gap-1"
              >
                {sending && <Loader2 size={12} className="animate-spin" />}
                Send WhatsApp
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
