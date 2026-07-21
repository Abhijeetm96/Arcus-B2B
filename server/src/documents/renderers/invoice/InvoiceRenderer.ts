import { DocumentRenderer } from '../DocumentRenderer';
import { DocumentLayout } from '../../shared/DocumentLayout';
import { Header } from '../../shared/Header';
import { SignatureBlock } from '../../shared/SignatureBlock';

export class InvoiceRenderer implements DocumentRenderer<any> {
  public async render(order: any): Promise<string> {
    const isBooking = !!(order.serviceName || order.service_name);
    
    const items = isBooking
      ? [{
          name: order.serviceName || order.service_name,
          quantity: 1,
          amount: 1499,
          rate: 1499,
          notes: order.notes
        }]
      : (order.items || []);

    const invoiceNumber = isBooking
      ? `INV-SRV-${order.id.slice(-6).toUpperCase()}`
      : `INV-${order.id.split('-').pop()?.toUpperCase() || 'INVOICE'}`;
      
    const invoiceDate = new Date(order.timestamp || order.date || Date.now()).toLocaleDateString('en-IN');

    // Parse state from shipping address
    let customerState = 'Karnataka';
    if (!isBooking && order.shippingAddress) {
      const states = ['Maharashtra', 'Tamil Nadu', 'Karnataka', 'Delhi', 'Telangana', 'Gujarat'];
      for (const state of states) {
        if (order.shippingAddress.toLowerCase().includes(state.toLowerCase())) {
          customerState = state;
          break;
        }
      }
    }
    const isInterstate = customerState.toLowerCase() !== 'karnataka';

    // GST computations (18% inclusive GST for B2B portal orders)
    const amountVal = isBooking ? 1499 : (order.amount || 0);
    const subtotal = amountVal / 1.18;
    const gstAmount = amountVal - subtotal;

    const itemsRowsHtml = items.map((it: any, idx: number) => {
      const qty = Number(it.quantity || it.qty || 1);
      const finalAmount = Number(it.amount || (qty * (it.rate || it.price || 0)));
      const rate = finalAmount / qty;
      const hsnSac = isBooking ? '9987' : '2523';

      return `
        <tr>
          <td style="text-align: center; font-family: monospace; border-right: 1px solid #e2e8f0;">${String(idx + 1).padStart(2, '0')}</td>
          <td style="border-right: 1px solid #e2e8f0;">
            <span class="item-desc">${it.name || it.productName || 'Building Material'}</span>
            ${it.notes ? `<span class="item-subdesc">Instructions: ${it.notes}</span>` : ''}
          </td>
          <td style="text-align: center; font-family: monospace; border-right: 1px solid #e2e8f0;">${hsnSac}</td>
          <td style="text-align: right; border-right: 1px solid #e2e8f0;">${qty.toFixed(2)} Nos</td>
          <td style="text-align: right; font-family: monospace; border-right: 1px solid #e2e8f0;">${(rate / 1.18).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="text-align: right; border-right: 1px solid #e2e8f0;">—</td>
          <td style="text-align: right; font-family: monospace; border-right: 1px solid #e2e8f0;">18%</td>
          <td style="text-align: right; font-weight: 600; font-family: monospace;">${finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    const headerHtml = Header({
      documentTitle: isBooking ? 'Service Invoice' : 'Tax Invoice',
      metaFields: [
        { label: 'Invoice Number', value: invoiceNumber },
        { label: 'Invoice Date', value: invoiceDate },
        { label: 'Place Of Supply', value: `${customerState} (${isInterstate ? '37' : '29'})` }
      ]
    });

    const billingAddressHtml = isBooking
      ? `<strong>${order.name}</strong><br/>Phone: ${order.phone}`
      : `<strong>Customer Client Entity</strong><br/>${order.billingAddress || order.shippingAddress || 'No Billing Address'}`;

    const shippingAddressHtml = isBooking
      ? `<strong>Service Appointment Date &amp; Time</strong><br/>${order.date}`
      : `<strong>Customer Client Entity</strong><br/>${order.shippingAddress || 'No Shipping Address'}`;

    const billLabel = 'Bill To';
    const shipLabel = isBooking ? 'Service Schedule' : 'Ship To';

    const contentHtml = `
      ${headerHtml}

      <!-- Billing Info -->
      <table class="party-section">
        <tr class="party-header">
          <th>${billLabel}</th>
          <th>${shipLabel}</th>
        </tr>
        <tr class="party-body">
          <td>
            <div class="party-name">${isBooking ? '' : 'Customer Client Entity'}</div>
            <div>${billingAddressHtml}</div>
            <div class="party-gst">${isBooking ? '' : 'GSTIN: Unregistered (URD)'}</div>
          </td>
          <td>
            <div class="party-name">${isBooking ? '' : 'Customer Client Entity'}</div>
            <div>${shippingAddressHtml}</div>
            <div class="party-gst">${isBooking ? '' : 'GSTIN: Unregistered (URD)'}</div>
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
                <td class="value" style="border: 0;">₹${amountVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </table>

            <!-- Authorized Signature Box -->
            <div style="margin-top: 20px;">
              ${SignatureBlock({
                companyName: isBooking ? 'Arcus Services' : 'Arcus Groups'
              })}
            </div>
          </td>
        </tr>
      </table>
    `;

    return DocumentLayout({
      title: isBooking ? `Service Invoice - ${invoiceNumber}` : `Tax Invoice - ${invoiceNumber}`,
      contentHtml
    });
  }
}
export default InvoiceRenderer;
