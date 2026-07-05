import { DocumentRenderer } from '../DocumentRenderer';
import { DocumentLayout } from '../../shared/DocumentLayout';
import { Header } from '../../shared/Header';
import { SignatureBlock } from '../../shared/SignatureBlock';

export class InvoiceRenderer implements DocumentRenderer<any> {
  public async render(order: any): Promise<string> {
    const items = order.items || [];
    const invoiceNumber = `INV-${order.id.split('-').pop()?.toUpperCase() || 'INVOICE'}`;
    const invoiceDate = new Date(order.timestamp || order.date || Date.now()).toLocaleDateString('en-IN');

    // Parse state from shipping address
    let customerState = 'Karnataka';
    const states = ['Maharashtra', 'Tamil Nadu', 'Karnataka', 'Delhi', 'Telangana', 'Gujarat'];
    for (const state of states) {
      if (order.shippingAddress?.toLowerCase().includes(state.toLowerCase())) {
        customerState = state;
        break;
      }
    }
    const isInterstate = customerState.toLowerCase() !== 'karnataka';

    // GST computations (18% inclusive GST for B2B portal orders)
    const subtotal = order.amount / 1.18;
    const gstAmount = order.amount - subtotal;

    const itemsRowsHtml = items.map((it: any, idx: number) => {
      const qty = Number(it.quantity || it.qty || 1);
      const finalAmount = Number(it.amount || (qty * (it.rate || it.price || 0)));
      const rate = finalAmount / qty;

      return `
        <tr>
          <td style="text-align: center; font-family: monospace; border-right: 1px solid #e2e8f0;">${String(idx + 1).padStart(2, '0')}</td>
          <td style="border-right: 1px solid #e2e8f0;">
            <span class="item-desc">${it.name || it.productName || 'Building Material'}</span>
          </td>
          <td style="text-align: center; font-family: monospace; border-right: 1px solid #e2e8f0;">2523</td>
          <td style="text-align: right; border-right: 1px solid #e2e8f0;">${qty.toFixed(2)} Nos</td>
          <td style="text-align: right; font-family: monospace; border-right: 1px solid #e2e8f0;">${(rate / 1.18).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="text-align: right; border-right: 1px solid #e2e8f0;">—</td>
          <td style="text-align: right; font-family: monospace; border-right: 1px solid #e2e8f0;">18%</td>
          <td style="text-align: right; font-weight: 600; font-family: monospace;">${finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    const headerHtml = Header({
      documentTitle: 'Tax Invoice',
      metaFields: [
        { label: 'Invoice Number', value: invoiceNumber },
        { label: 'Invoice Date', value: invoiceDate },
        { label: 'Place Of Supply', value: `${customerState} (${isInterstate ? '37' : '29'})` }
      ]
    });

    const contentHtml = `
      ${headerHtml}

      <!-- Billing Info -->
      <table class="party-section">
        <tr class="party-header">
          <th>Bill To</th>
          <th>Ship To</th>
        </tr>
        <tr class="party-body">
          <td>
            <div class="party-name">Customer Client Entity</div>
            <div>${order.billingAddress || order.shippingAddress || 'No Billing Address'}</div>
            <div class="party-gst">GSTIN: Unregistered (URD)</div>
          </td>
          <td>
            <div class="party-name">Customer Client Entity</div>
            <div>${order.shippingAddress || 'No Shipping Address'}</div>
            <div class="party-gst">GSTIN: Unregistered (URD)</div>
          </td>
        </tr>
      </table>

      <!-- Items Grid -->
      <table class="items-table" style="border: 1px solid #cbd5e1;">
        <thead>
          <tr>
            <th style="width: 5%; border-right: 1px solid #cbd5e1;">#</th>
            <th style="width: 40%; border-right: 1px solid #cbd5e1; text-align: left;">Item &amp; Description</th>
            <th style="width: 10%; border-right: 1px solid #cbd5e1; text-align: center;">HSN/SAC</th>
            <th style="width: 8%; border-right: 1px solid #cbd5e1; text-align: right;">Qty</th>
            <th style="width: 12%; border-right: 1px solid #cbd5e1; text-align: right;">Excl. Rate</th>
            <th style="width: 8%; border-right: 1px solid #cbd5e1; text-align: right;">Discount</th>
            <th style="width: 10%; border-right: 1px solid #cbd5e1; text-align: right;">Tax Rate</th>
            <th style="width: 12%; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRowsHtml}
        </tbody>
      </table>

      <!-- Financial Totals -->
      <table class="summary-section">
        <tr>
          <td class="summary-left">
            <div class="bank-details">
              <div class="bank-title">Bank Details for Wire Transfer</div>
              <div>A/c Name: <strong>Arcus Groups</strong></div>
              <div>Bank Name: <strong>HDFC Bank</strong></div>
              <div>A/c No: <strong>50200086161342</strong></div>
              <div>IFSC: <strong>HDFC0004210</strong></div>
            </div>
          </td>
          <td class="summary-right">
            <table class="totals-table">
              <tr>
                <td class="label">Sub Total</td>
                <td class="value">${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              ${
                isInterstate
                  ? `
                <tr>
                  <td class="label">IGST (18%)</td>
                  <td class="value">${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              `
                  : `
                <tr>
                  <td class="label">CGST (9%)</td>
                  <td class="value">${(gstAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td class="label">SGST (9%)</td>
                  <td class="value">${(gstAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              `
              }
              <tr class="grand-total">
                <td class="label" style="text-align: right; border: 0;">Total</td>
                <td class="value" style="border: 0;">₹${order.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </table>

            <!-- Authorized Signature Box -->
            <div style="margin-top: 20px;">
              ${SignatureBlock({
                companyName: 'Arcus Groups'
              })}
            </div>
          </td>
        </tr>
      </table>
    `;

    return DocumentLayout({
      title: `Tax Invoice - ${invoiceNumber}`,
      contentHtml
    });
  }
}
export default InvoiceRenderer;
