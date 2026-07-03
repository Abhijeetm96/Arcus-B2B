import { DocumentRenderer } from '../DocumentRenderer';
import { DocumentLayout } from '../../shared/DocumentLayout';
import { Header } from '../../shared/Header';

export class RFQRenderer implements DocumentRenderer<any> {
  public async render(rfq: any): Promise<string> {
    const items = rfq.items || [];
    const customer = rfq.customer || {};

    const itemsRowsHtml = items.map((it: any, idx: number) => {
      const qty = Number(it.quantity || 1);
      return `
        <tr>
          <td style="text-align: center; border-right: 1px solid #e2e8f0;">${String(idx + 1).padStart(2, '0')}</td>
          <td style="border-right: 1px solid #e2e8f0;">
            <span class="item-desc">${it.itemName || 'Material Item'}</span>
            ${it.description ? `<span class="item-subdesc">${it.description}</span>` : ''}
          </td>
          <td style="text-align: right; border-right: 1px solid #e2e8f0;">${qty.toFixed(2)} ${it.unit || 'pcs'}</td>
          <td style="text-align: right; font-family: monospace;">${it.targetPrice ? `₹${Number(it.targetPrice).toLocaleString('en-IN')}` : '—'}</td>
        </tr>
      `;
    }).join('');

    const headerHtml = Header({
      documentTitle: 'Procurement Brief (RFQ)',
      metaFields: [
        { label: 'RFQ Number', value: rfq.rfqNumber || rfq.id },
        { label: 'Created Date', value: new Date(rfq.lastUpdated || Date.now()).toLocaleDateString('en-IN') },
        { label: 'Due Date', value: new Date(rfq.dueDate || Date.now()).toLocaleDateString('en-IN') }
      ]
    });

    const contentHtml = `
      ${headerHtml}

      <!-- Client Details -->
      <table class="party-section">
        <tr class="party-header">
          <th>Procurement Coordinator</th>
          <th>Delivery Location</th>
        </tr>
        <tr class="party-body">
          <td>
            <div class="party-name">${customer.name || rfq.contactName || 'Buyer Contact'}</div>
            <div>Company: ${customer.companyName || rfq.companyName || 'Generic Corporation'}</div>
            <div>Email: ${customer.email || 'N/A'}</div>
          </td>
          <td>
            <div class="party-name">Target Site Address</div>
            <div>${customer.location || rfq.location || 'Site Location Address'}</div>
          </td>
        </tr>
      </table>

      <!-- Items Grid -->
      <table class="items-table" style="border: 1px solid #cbd5e1;">
        <thead>
          <tr>
            <th style="width: 5%; border-right: 1px solid #cbd5e1;">#</th>
            <th style="width: 55%; border-right: 1px solid #cbd5e1; text-align: left;">Item &amp; Requirements Description</th>
            <th style="width: 20%; border-right: 1px solid #cbd5e1; text-align: right;">Quantity Required</th>
            <th style="width: 20%; text-align: right;">Target Price Budget</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRowsHtml}
        </tbody>
      </table>

      ${rfq.description ? `
        <div style="margin-top: 20px; font-size: 11px; color: #475569; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; background-color: #f8fafc;">
          <strong>Detailed Briefing Requirements:</strong><br/>
          ${rfq.description}
        </div>
      ` : ''}
    `;

    return DocumentLayout({
      title: `RFQ Brief - ${rfq.rfqNumber || rfq.id}`,
      contentHtml
    });
  }
}
export default RFQRenderer;
