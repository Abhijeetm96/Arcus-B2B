import { DocumentRenderer } from '../DocumentRenderer';
import { DocumentLayout } from '../../shared/DocumentLayout';
import { Header } from '../../shared/Header';
import { SignatureBlock } from '../../shared/SignatureBlock';

export class PurchaseOrderRenderer implements DocumentRenderer<any> {
  public async render(po: any): Promise<string> {
    const items = po.items || [];
    const customer = po.customer || {};

    const itemsRowsHtml = items.map((it: any, idx: number) => {
      const qty = Number(it.quantity || 1);
      const amount = qty * Number(it.rate || 0);

      return `
        <tr>
          <td style="text-align: center; border-right: 1px solid #e2e8f0;">${String(idx + 1).padStart(2, '0')}</td>
          <td style="border-right: 1px solid #e2e8f0;">
            <span class="item-desc">${it.itemName || 'Material Item'}</span>
            ${it.description ? `<span class="item-subdesc">${it.description}</span>` : ''}
          </td>
          <td style="text-align: center; font-family: monospace; border-right: 1px solid #e2e8f0;">2523</td>
          <td style="text-align: right; border-right: 1px solid #e2e8f0;">${qty.toFixed(2)} ${it.unit || 'pcs'}</td>
          <td style="text-align: right; font-family: monospace; border-right: 1px solid #e2e8f0;">₹${Number(it.rate || 0).toLocaleString('en-IN')}</td>
          <td style="text-align: right; font-weight: 600; font-family: monospace;">₹${amount.toLocaleString('en-IN')}</td>
        </tr>
      `;
    }).join('');

    const headerHtml = Header({
      documentTitle: 'Purchase Order',
      metaFields: [
        { label: 'PO Number', value: po.poNumber || po.id },
        { label: 'Order Date', value: new Date(po.createdAt || Date.now()).toLocaleDateString('en-IN') }
      ]
    });

    const contentHtml = `
      ${headerHtml}

      <!-- Partner Info -->
      <table class="party-section">
        <tr class="party-header">
          <th>Vendor Proposal Partner</th>
          <th>Shipment Delivery Location</th>
        </tr>
        <tr class="party-body">
          <td>
            <div class="party-name">${po.vendorName || 'Selected Vendor Supplier'}</div>
            <div>GSTIN: ${po.vendorGst || 'URD'}</div>
            <div>Email: ${po.vendorEmail || 'N/A'}</div>
          </td>
          <td>
            <div class="party-name">Target Site Delivery</div>
            <div>${po.shippingAddress || 'No Shipping Address'}</div>
          </td>
        </tr>
      </table>

      <!-- Items Grid -->
      <table class="items-table" style="border: 1px solid #cbd5e1;">
        <thead>
          <tr>
            <th style="width: 5%; border-right: 1px solid #cbd5e1;">#</th>
            <th style="width: 45%; border-right: 1px solid #cbd5e1; text-align: left;">Item &amp; Specifications</th>
            <th style="width: 10%; border-right: 1px solid #cbd5e1; text-align: center;">HSN/SAC</th>
            <th style="width: 10%; border-right: 1px solid #cbd5e1; text-align: right;">Qty</th>
            <th style="width: 15%; border-right: 1px solid #cbd5e1; text-align: right;">Unit Rate</th>
            <th style="width: 15%; text-align: right;">Sub Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRowsHtml}
        </tbody>
      </table>

      <!-- Totals Section -->
      <table class="summary-section">
        <tr>
          <td class="summary-left">
            <div class="bank-details">
              <div class="bank-title">Billing &amp; Audit Conditions</div>
              <div>PO generated from validated quote revision reference.</div>
            </div>
          </td>
          <td class="summary-right">
            <table class="totals-table">
              <tr class="grand-total">
                <td class="label" style="text-align: right; border: 0;">Total Amount</td>
                <td class="value" style="border: 0;">₹${Number(po.totalAmount || 0).toLocaleString('en-IN')}</td>
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
      title: `Purchase Order - ${po.poNumber || po.id}`,
      contentHtml
    });
  }
}
export default PurchaseOrderRenderer;
