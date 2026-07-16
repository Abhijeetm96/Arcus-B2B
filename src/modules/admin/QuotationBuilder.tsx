import React, { useState, useEffect } from 'react';
import { clientQuotationService } from './quotations/services/quotation.service';
import { CustomerPanel } from './quotations/components/CustomerPanel';
import { ItemsGrid } from './quotations/components/ItemsGrid';
import type { QuotationItem } from './quotations/components/ItemsGrid';
import { PricingSummary } from './quotations/components/PricingSummary';
import { TermsPanel } from './quotations/components/TermsPanel';
import { InternalNotes } from './quotations/components/InternalNotes';
import { CustomerNotes } from './quotations/components/CustomerNotes';
import { VersionHistory } from './quotations/components/VersionHistory';
import { ApprovalTimeline } from './quotations/components/ApprovalTimeline';
import { ActionToolbar } from './quotations/components/ActionToolbar';
import { DocumentStatusBadge } from '../../components/shared/DocumentStatusBadge';
import { QuotationVersionCompare } from './quotations/components/QuotationVersionCompare';
import { apiFetch } from '../../lib/api';

export const QuotationBuilder: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Router properties
  const hash = window.location.hash;
  const cleanHash = hash.replace(/^#\/?/, '').split('?')[0];
  const hashQuery = hash.split('?')[1] || '';
  const queryParams = new URLSearchParams(hashQuery);
  
  const segments = cleanHash.split('/');
  const isNew = segments[3] === 'new';
  const quotationId = isNew ? null : segments[3];
  const queryRfqId = queryParams.get('rfqId');

  // Document states
  const [quoteId, _setQuoteId] = useState<string | null>(quotationId);
  const [rfqId, setRfqId] = useState<string>(queryRfqId || '');
  const [_rfqDetails, setRfqDetails] = useState<any>(null);
  const [quotationNumber, setQuotationNumber] = useState('');
  const [version, setVersion] = useState(1);
  const [status, setStatus] = useState('DRAFT');
  const [customer, setCustomer] = useState<any>({
    company: '',
    GSTIN: '',
    billing_address: '',
    shipping_address: '',
    contact_person: '',
    phone: '',
    email: '',
    state: 'Karnataka',
    country: 'India'
  });

  // Items
  const [items, setItems] = useState<QuotationItem[]>([
    {
      product_snapshot: { name: '', brand: '', sku: '', unit: 'Nos', hsn_code: '2523', gst: 18 },
      quantity: 1,
      rate: 0,
      discount_percent: 0,
      tax_percent: 18,
      final_amount: 0
    }
  ]);

  // Financial metadata
  const [globalDiscountType, setGlobalDiscountType] = useState<'FLAT' | 'PERCENT' | 'NONE'>('NONE');
  const [globalDiscountValue, setGlobalDiscountValue] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState(1.0);
  const [isInterstate, setIsInterstate] = useState(false);

  // Notes
  const [internalNotes, setInternalNotes] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Commercial terms
  const [deliveryTerms, setDeliveryTerms] = useState('F.O.R Site Delivery');
  const [paymentTerms, setPaymentTerms] = useState('Net 30 standard credit');
  const [validityDate, setValidityDate] = useState('');

  // Timeline / Revision logs
  const [versions, setVersions] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [_shareLogs, setShareLogs] = useState<any[]>([]);
  const [requiredRole] = useState<string | null>('SALES_MANAGER');
  const [requiredLevels] = useState(1);

  // Version Comparison
  const [compareV1, setCompareV1] = useState<any>(null);
  const [compareV2, setCompareV2] = useState<any>(null);
  const [showCompare, setShowCompare] = useState(false);

  // Dialog overlays
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [signatureHash, setSignatureHash] = useState('');
  
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');

  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareChannel, setShareChannel] = useState<'EMAIL' | 'SMS' | 'WHATSAPP'>('EMAIL');
  const [shareRecipient, setShareRecipient] = useState('');

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isNew && queryRfqId) {
          // Fetch RFQ context to pre-populate customer snapshot and items
          const res = await apiFetch(`/admin/rfqs/${queryRfqId}`);
          const json = await res.json();
          const rfq = json.rfq || json.data;
          if (rfq) {
            setRfqDetails(rfq);
            
            // Map customer snapshot
            const custJson = rfq.customer_json || {};
            setCustomer({
              company: custJson.companyName || rfq.name || '',
              GSTIN: custJson.gstNumber || '',
              billing_address: custJson.billingAddress || rfq.location || '',
              shipping_address: custJson.deliveryAddress || rfq.location || '',
              contact_person: rfq.name || '',
              phone: rfq.phone || '',
              email: custJson.email || '',
              state: custJson.state || 'Karnataka',
              country: 'India'
            });

            // Map items if exists
            const rfqItems = rfq.items || json.items || [];
            if (rfqItems && rfqItems.length > 0) {
              const mapped = rfqItems.map((it: any) => ({
                product_id: it.product_id || null,
                product_snapshot: {
                  name: it.item_name || it.itemName,
                  brand: it.brand || '',
                  sku: it.sku || '',
                  unit: it.unit || 'Nos',
                  hsn_code: '2523',
                  gst: 18
                },
                quantity: Number(it.quantity) || 1,
                rate: 0,
                discount_percent: 0,
                tax_percent: 18,
                final_amount: 0
              }));
              setItems(mapped);
            }
          }
          setLoading(false);
        } else if (quotationId) {
          // Fetch existing quotation
          const quote = await clientQuotationService.getQuotationDetail(quotationId);
          if (quote) {
            setRfqId(quote.rfq_id);
            setQuotationNumber(quote.quotation_number);
            setVersion(quote.version);
            setStatus(quote.status);
            setCustomer(quote.customer_snapshot);
            setInternalNotes(quote.internal_notes || '');
            setCustomerNotes(quote.customer_notes || '');
            
            // Financials
            setCurrencyCode(quote.currency_code || 'INR');
            setExchangeRate(Number(quote.exchange_rate) || 1.0);
            setShipping(Number(quote.shipping) || 0);
            setOtherCharges(Number(quote.other_charges) || 0);
            
            // Map items
            if (quote.items) {
              setItems(quote.items);
            }
            
            // Set summaries
            setVersions(quote.versions || []);
            setApprovals(quote.approvals || []);
            setShareLogs(quote.shareLogs || []);

            // Set tax strategy interstate flag
            const audit = quote.calculation_audit || {};
            setIsInterstate(audit.igstTotal > 0);
          }
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error loading quotation builder context:', err);
        setError('Failed to load quotation context. Please verify the URL or database connection.');
        setLoading(false);
      }
    };
    init();
  }, [quotationId, isNew, queryRfqId]);

  // Recalculate financial summary fields in real-time
  const subtotal = items.reduce((sum, it) => sum + (it.quantity * it.rate), 0);
  const itemDiscounts = items.reduce((sum, it) => sum + (it.quantity * it.rate * (it.discount_percent / 100)), 0);
  
  const subtotalAfterItemDiscounts = subtotal - itemDiscounts;
  let globalDiscountAmount = 0;
  if (globalDiscountType === 'FLAT') {
    globalDiscountAmount = globalDiscountValue;
  } else if (globalDiscountType === 'PERCENT') {
    globalDiscountAmount = subtotalAfterItemDiscounts * (globalDiscountValue / 100);
  }

  const taxableAmount = Math.max(0, subtotalAfterItemDiscounts - globalDiscountAmount);

  // Compute GST based on strategy
  const gstAmount = items.reduce((sum, it) => {
    const itemSub = it.quantity * it.rate;
    const itemDisc = itemSub * (it.discount_percent / 100);
    const itemTaxable = itemSub - itemDisc;
    // Pro-rate global discount
    const proRatedTaxable = subtotalAfterItemDiscounts > 0 
      ? itemTaxable * (taxableAmount / subtotalAfterItemDiscounts)
      : 0;
    return sum + (proRatedTaxable * (it.tax_percent / 100));
  }, 0);

  const rawGrandTotal = taxableAmount + gstAmount + shipping + otherCharges;
  const grandTotal = Math.round(rawGrandTotal);
  const roundOff = grandTotal - rawGrandTotal;

  // Local user approval eligibility (mock checks based on system admin roles)
  const canApprove = status === 'PENDING_APPROVAL';

  // Handlers
  const handleSaveDraft = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const quoteData = {
        status: 'DRAFT',
        customer_snapshot: customer,
        customer_notes: customerNotes,
        internal_notes: internalNotes,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days validity
      };

      const totalsData = {
        currency_code: currencyCode,
        exchange_rate: exchangeRate,
        base_currency: 'INR',
        subtotal,
        discount: itemDiscounts + globalDiscountAmount,
        taxable_amount: taxableAmount,
        gst_amount: gstAmount,
        shipping,
        other_charges: otherCharges,
        grand_total: grandTotal,
        calculation_audit: {
          cgstTotal: isInterstate ? 0 : gstAmount / 2,
          sgstTotal: isInterstate ? 0 : gstAmount / 2,
          igstTotal: isInterstate ? gstAmount : 0,
          exemptTotal: 0,
          rawGrandTotal
        }
      };

      if (isNew) {
        const saved = await clientQuotationService.createQuotation(rfqId, quoteData, totalsData, items);
        window.location.hash = `#/portal/admin/quotations/${saved.id}`;
      } else if (quoteId) {
        const saved = await clientQuotationService.updateQuotation(quoteId, quoteData, totalsData, items);
        setStatus(saved.status);
        setVersion(saved.version);
      }
      setSubmitting(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save quotation draft.');
      setSubmitting(false);
    }
  };

  const handleRequestApproval = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Save draft first
      const quoteData = {
        status: 'PENDING_APPROVAL',
        customer_snapshot: customer,
        customer_notes: customerNotes,
        internal_notes: internalNotes
      };

      const totalsData = {
        currency_code: currencyCode,
        exchange_rate: exchangeRate,
        base_currency: 'INR',
        subtotal,
        discount: itemDiscounts + globalDiscountAmount,
        taxable_amount: taxableAmount,
        gst_amount: gstAmount,
        shipping,
        other_charges: otherCharges,
        grand_total: grandTotal,
        calculation_audit: {
          cgstTotal: isInterstate ? 0 : gstAmount / 2,
          sgstTotal: isInterstate ? 0 : gstAmount / 2,
          igstTotal: isInterstate ? gstAmount : 0,
          exemptTotal: 0,
          rawGrandTotal
        }
      };

      if (isNew) {
        const saved = await clientQuotationService.createQuotation(rfqId, quoteData, totalsData, items);
        window.location.hash = `#/portal/admin/quotations/${saved.id}`;
      } else if (quoteId) {
        const saved = await clientQuotationService.updateQuotation(quoteId, quoteData, totalsData, items);
        setStatus(saved.status);
        setVersion(saved.version);
      }
      setSubmitting(false);
    } catch (err: any) {
      setError(err.message || 'Failed to submit proposal for approval.');
      setSubmitting(false);
    }
  };

  const handleApproveAndSign = async () => {
    if (!quoteId) return;
    try {
      setSubmitting(true);
      const sigData = {
        signature_hash: signatureHash || 'sig_hash_mock_4c59a0f7e1b9',
        signed_document_hash: 'doc_hash_mock_3f890ad25b098',
        certificate_id: 'CERT-2026-94301'
      };
      const updated = await clientQuotationService.approveQuotation(quoteId, approvalNotes, sigData);
      setStatus(updated.status);
      setApprovals(updated.approvals || []);
      setShowApprovalDialog(false);
      setSubmitting(false);
    } catch (err: any) {
      setError(err.message || 'Failed to approve proposal.');
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!quoteId) return;
    try {
      setSubmitting(true);
      const updated = await clientQuotationService.rejectQuotation(quoteId, rejectNotes);
      setStatus(updated.status);
      setShowRejectDialog(false);
      setSubmitting(false);
    } catch (err: any) {
      setError(err.message || 'Failed to reject proposal.');
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (!quoteId) return;
    try {
      setSubmitting(true);
      const updated = await clientQuotationService.sendQuotation(quoteId, shareChannel, shareRecipient);
      setStatus(updated.status);
      setShareLogs(updated.shareLogs || []);
      setShowShareDialog(false);
      setSubmitting(false);
    } catch (err: any) {
      setError(err.message || 'Failed to share quotation.');
      setSubmitting(false);
    }
  };

  const handleConvertToOrder = async () => {
    if (!quoteId) return;
    try {
      setSubmitting(true);
      const updated = await clientQuotationService.convertToOrder(quoteId);
      setStatus(updated.status);
      setSubmitting(false);
    } catch (err: any) {
      setError(err.message || 'Failed to convert quotation to order contract.');
      setSubmitting(false);
    }
  };

  const handleCreateRevision = async () => {
    if (!quoteId) return;
    const reason = prompt('Please enter the reason for creating this revision (e.g. Rate revision or quantity change):');
    if (reason === null) return;
    try {
      setSubmitting(true);
      const quoteData = {
        customer_snapshot: customer,
        customer_notes: customerNotes,
        internal_notes: internalNotes
      };
      const totalsData = {
        currency_code: currencyCode,
        exchange_rate: exchangeRate,
        base_currency: 'INR',
        subtotal,
        discount: itemDiscounts + globalDiscountAmount,
        taxable_amount: taxableAmount,
        gst_amount: gstAmount,
        shipping,
        other_charges: otherCharges,
        grand_total: grandTotal,
        calculation_audit: {
          cgstTotal: isInterstate ? 0 : gstAmount / 2,
          sgstTotal: isInterstate ? 0 : gstAmount / 2,
          igstTotal: isInterstate ? gstAmount : 0,
          exemptTotal: 0,
          rawGrandTotal
        }
      };
      const revised = await clientQuotationService.createRevision(quoteId, quoteData, totalsData, items, reason);
      window.location.hash = `#/portal/admin/quotations/${revised.id}`;
    } catch (err: any) {
      setError(err.message || 'Failed to create new revision.');
      setSubmitting(false);
    }
  };

  const handlePrintPdf = async () => {
    if (!quoteId) return;
    try {
      const response = await apiFetch(`/api/documents/${quoteId}?format=pdf&download=true`);
      if (!response.ok) throw new Error('Failed to fetch quotation');
      const blob = await response.blob();
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
      setTimeout(() => {
        URL.revokeObjectURL(fileURL);
      }, 10000);
    } catch (err) {
      console.error('Quotation download failed:', err);
      alert('Failed to download quotation PDF.');
    }
  };

  const handleCompareVersions = async (v1Num: number, v2Num: number) => {
    try {
      setSubmitting(true);
      setError(null);
      
      const ver1Obj = versions.find(v => v.version === v1Num);
      const ver2Obj = versions.find(v => v.version === v2Num);

      if (!ver1Obj || !ver2Obj) {
        throw new Error('Version records could not be resolved from history.');
      }

      const detail1 = await clientQuotationService.getQuotationDetail(ver1Obj.id);
      const detail2 = await clientQuotationService.getQuotationDetail(ver2Obj.id);

      setCompareV1(detail1);
      setCompareV2(detail2);
      setShowCompare(true);
      setSubmitting(false);
    } catch (err: any) {
      setError(err.message || 'Failed to compare versions.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-400">
        <span>Portal</span>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <span>Admin</span>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <a href="#/portal/admin" className="hover:text-slate-650 transition-colors">RFQ Workspace</a>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <span className="text-slate-600">Quotation Builder</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-black text-slate-800 tracking-tight">
              {isNew ? 'New Quotation Draft' : `Proposal ${quotationNumber}`}
            </h1>
            {!isNew && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                Rev {version}
              </span>
            )}
            <DocumentStatusBadge status={status} />
          </div>
          <p className="text-[10px] text-slate-400">
            Linked RFQ ID: <strong className="font-mono text-slate-600">{rfqId}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {status !== 'DRAFT' && status !== 'PENDING_APPROVAL' && (
            <button
              type="button"
              onClick={handleCreateRevision}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2 rounded text-[10px] uppercase border-0 transition-colors"
            >
              <span className="material-symbols-outlined text-[13px]">add_moderator</span> Revise (Create V{version + 1})
            </button>
          )}
          <a
            href="#/portal/admin"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase rounded text-[10px] border border-slate-200/60 transition-colors"
          >
            Back to RFQs
          </a>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-xs rounded-lg shadow-sm font-semibold">
          {error}
        </div>
      )}

      {/* Main Notion-Style Stack */}
      <div className="space-y-6">
        {showCompare && compareV1 && compareV2 && (
          <QuotationVersionCompare
            v1={compareV1}
            v2={compareV2}
            onClose={() => {
              setShowCompare(false);
              setCompareV1(null);
              setCompareV2(null);
            }}
          />
        )}

        <CustomerPanel
          customer={customer}
          onChange={setCustomer}
          isReadOnly={status !== 'DRAFT' && status !== 'PENDING_APPROVAL'}
        />

        <ItemsGrid
          items={items}
          onChange={setItems}
          isReadOnly={status !== 'DRAFT' && status !== 'PENDING_APPROVAL'}
        />

        <PricingSummary
          subtotal={subtotal}
          itemDiscounts={itemDiscounts}
          globalDiscountType={globalDiscountType}
          globalDiscountValue={globalDiscountValue}
          shipping={shipping}
          otherCharges={otherCharges}
          gstAmount={gstAmount}
          grandTotal={grandTotal}
          roundOff={roundOff}
          isInterstate={isInterstate}
          onShippingChange={setShipping}
          onOtherChargesChange={setOtherCharges}
          onGlobalDiscountTypeChange={setGlobalDiscountType}
          onGlobalDiscountValueChange={setGlobalDiscountValue}
          onInterstateToggle={setIsInterstate}
          isReadOnly={status !== 'DRAFT' && status !== 'PENDING_APPROVAL'}
          auditTrail={{
            cgstTotal: isInterstate ? 0 : gstAmount / 2,
            sgstTotal: isInterstate ? 0 : gstAmount / 2,
            igstTotal: isInterstate ? gstAmount : 0,
            exemptTotal: 0,
            rawGrandTotal
          }}
        />

        <TermsPanel
          deliveryTerms={deliveryTerms || 'F.O.R Site Delivery'}
          paymentTerms={paymentTerms || 'Net 30 standard credit'}
          validityDate={validityDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          currencyCode={currencyCode}
          exchangeRate={exchangeRate}
          onDeliveryTermsChange={setDeliveryTerms}
          onPaymentTermsChange={setPaymentTerms}
          onValidityDateChange={setValidityDate}
          onCurrencyCodeChange={setCurrencyCode}
          onExchangeRateChange={setExchangeRate}
          isReadOnly={status !== 'DRAFT' && status !== 'PENDING_APPROVAL'}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomerNotes
            notes={customerNotes}
            onChange={setCustomerNotes}
            isReadOnly={status !== 'DRAFT' && status !== 'PENDING_APPROVAL'}
          />
          <InternalNotes
            notes={internalNotes}
            onChange={setInternalNotes}
            isReadOnly={status !== 'DRAFT' && status !== 'PENDING_APPROVAL'}
          />
        </div>

        {!isNew && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ApprovalTimeline
              approvals={approvals}
              status={status}
              requiredRole={requiredRole}
              requiredLevels={requiredLevels}
            />
            <VersionHistory
              versions={versions}
              activeVersion={version}
              onSelectVersion={async (ver: any) => {
                window.location.hash = `#/portal/admin/quotations/${ver.id}`;
              }}
              onCompareVersions={handleCompareVersions}
            />
          </div>
        )}
      </div>

      {/* Floating Action Toolbar */}
      <div className="fixed bottom-6 left-6 right-6 max-w-7xl mx-auto z-45">
        <ActionToolbar
          status={status}
          isSaving={submitting}
          onSave={handleSaveDraft}
          onSubmitApproval={handleRequestApproval}
          onApprove={() => setShowApprovalDialog(true)}
          onDecline={() => setShowRejectDialog(true)}
          onShare={() => setShowShareDialog(true)}
          onDownloadPDF={isNew ? undefined : handlePrintPdf}
          onConvertToOrder={handleConvertToOrder}
          canApprove={canApprove}
        />
      </div>

      {/* Modals Overlay */}
      {showApprovalDialog && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4 text-xs">
            <h3 className="font-bold text-slate-800 text-sm uppercase">Sign &amp; Approve Proposal</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[9px]">Approval Comments</label>
                <textarea
                  rows={3}
                  value={approvalNotes}
                  onChange={e => setApprovalNotes(e.target.value)}
                  className="w-full border rounded p-2.5 resize-none bg-slate-50/50"
                  placeholder="Approve with Net-30 credit release..."
                />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[9px]">Private Signature Hash (Mock Verification)</label>
                <input
                  type="text"
                  value={signatureHash}
                  onChange={e => setSignatureHash(e.target.value)}
                  className="w-full border h-8 px-2 font-mono"
                  placeholder="sig_hash_4f7e..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowApprovalDialog(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded uppercase text-[10px] border-0"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveAndSign}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded uppercase text-[10px] border-0 shadow"
              >
                Sign Off
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectDialog && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4 text-xs">
            <h3 className="font-bold text-slate-800 text-sm uppercase">Decline Proposal</h3>
            <div>
              <label className="block font-bold text-slate-500 mb-1 uppercase text-[9px]">Rejection Reason *</label>
              <textarea
                rows={3}
                value={rejectNotes}
                onChange={e => setRejectNotes(e.target.value)}
                className="w-full border rounded p-2.5 resize-none bg-slate-50/50"
                placeholder="Rate is too low or client profile is high risk..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectDialog(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded uppercase text-[10px] border-0"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectNotes.trim()}
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded uppercase text-[10px] border-0 shadow disabled:opacity-40"
              >
                Reject Document
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareDialog && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4 text-xs">
            <h3 className="font-bold text-slate-800 text-sm uppercase">Dispatch Proposal to Buyer</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[9px]">Channel</label>
                <select
                  value={shareChannel}
                  onChange={e => setShareChannel(e.target.value as any)}
                  className="w-full border h-8 px-2 bg-white"
                >
                  <option value="EMAIL">EMAIL</option>
                  <option value="SMS">SMS / TEXT MESSAGE</option>
                  <option value="WHATSAPP">WHATSAPP DIRECT</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[9px]">Recipient Detail (Email or Phone)</label>
                <input
                  type="text"
                  value={shareRecipient}
                  onChange={e => setShareRecipient(e.target.value)}
                  className="w-full border h-8 px-2"
                  placeholder="e.g. buyer@client.com or +91 99000 12345"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowShareDialog(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded uppercase text-[10px] border-0"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!shareRecipient.trim()}
                onClick={handleShare}
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white font-bold rounded uppercase text-[10px] border-0 shadow disabled:opacity-40"
              >
                Send Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default QuotationBuilder;
