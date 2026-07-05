import { DocumentRenderer } from '../DocumentRenderer';
import { DocumentLayout } from '../../shared/DocumentLayout';
import { Header } from '../../shared/Header';
import { SignatureBlock } from '../../shared/SignatureBlock';

export interface QuotationModel {
  quotation: any;
  totals: any;
  items: any[];
}

function numberToIndianWords(num: number): string {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertLessThanOneThousand = (n: number): string => {
    if (n === 0) return '';
    let temp = '';
    if (n >= 100) {
      temp += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      temp += b[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      temp += a[n] + ' ';
    }
    return temp.trim();
  };

  const convert = (n: number): string => {
    if (n === 0) return 'Zero';
    let word = '';
    
    const crore = Math.floor(n / 10000000);
    n %= 10000000;
    if (crore > 0) {
      word += convertLessThanOneThousand(crore) + ' Crore ';
    }

    const lakh = Math.floor(n / 100000);
    n %= 100000;
    if (lakh > 0) {
      word += convertLessThanOneThousand(lakh) + ' Lakh ';
    }

    const thousand = Math.floor(n / 1000);
    n %= 1000;
    if (thousand > 0) {
      word += convertLessThanOneThousand(thousand) + ' Thousand ';
    }

    const remaining = convertLessThanOneThousand(n);
    if (remaining) {
      word += remaining + ' ';
    }

    return word.trim();
  };

  const mainPart = Math.floor(num);
  const paisaPart = Math.round((num - mainPart) * 100);

  let result = 'Indian Rupee ' + convert(mainPart);
  if (paisaPart > 0) {
    result += ' and ' + convert(paisaPart) + ' Paisa';
  }
  result += ' Only';
  return result;
}

const stateCodes: Record<string, string> = {
  'Andhra Pradesh': '37', 'Arunachal Pradesh': '12', 'Assam': '18', 'Bihar': '10',
  'Chhattisgarh': '22', 'Goa': '30', 'Gujarat': '24', 'Haryana': '06',
  'Himachal Pradesh': '02', 'Jharkhand': '20', 'Karnataka': '29', 'Kerala': '32',
  'Madhya Pradesh': '23', 'Maharashtra': '27', 'Manipur': '14', 'Meghalaya': '17',
  'Mizoram': '15', 'Nagaland': '13', 'Odisha': '21', 'Punjab': '03',
  'Rajasthan': '08', 'Tamil Nadu': '33', 'Telangana': '36', 'Tripura': '16',
  'Uttar Pradesh': '09', 'Uttarakhand': '05', 'West Bengal': '19', 'Delhi': '07',
  'Jammu & Kashmir': '01', 'Ladakh': '38'
};

export class QuotationRenderer implements DocumentRenderer<QuotationModel> {
  public async render(model: QuotationModel): Promise<string> {
    const quote = model.quotation;
    const totals = model.totals;
    const items = model.items || [];
    const customer = quote.customer_snapshot || {};
    const audit = totals.calculation_audit || {};

    const customerState = customer.state || 'Karnataka';
    const customerStateCode = stateCodes[customerState] || '29';
    const placeOfSupply = `${customerState} (${customerStateCode})`;
    const isInterstate = customerState.toLowerCase() !== 'karnataka';

    // Build the dynamic Zoho items table columns header
    const taxHeaderHtml = isInterstate
      ? `<th colspan="2" style="text-align: center; border-right: 1px solid #cbd5e1;">IGST</th>`
      : `<th colspan="2" style="text-align: center; border-right: 1px solid #cbd5e1;">CGST</th>
         <th colspan="2" style="text-align: center; border-right: 1px solid #cbd5e1;">SGST</th>`;

    const subTaxHeaderHtml = isInterstate
      ? `<th style="text-align: center; font-size: 8px; border-right: 1px solid #cbd5e1; padding: 4px;">%</th>
         <th style="text-align: center; font-size: 8px; border-right: 1px solid #cbd5e1; padding: 4px;">Amt</th>`
      : `<th style="text-align: center; font-size: 8px; border-right: 1px solid #cbd5e1; padding: 4px;">%</th>
         <th style="text-align: center; font-size: 8px; border-right: 1px solid #cbd5e1; padding: 4px;">Amt</th>
         <th style="text-align: center; font-size: 8px; border-right: 1px solid #cbd5e1; padding: 4px;">%</th>
         <th style="text-align: center; font-size: 8px; border-right: 1px solid #cbd5e1; padding: 4px;">Amt</th>`;

    // Map table row items
    const itemsRowsHtml = items.map((it: any, idx: number) => {
      const prod = it.product_snapshot || {};
      const discountText = it.discount_percent > 0 ? `${Number(it.discount_percent).toFixed(1)}%` : '—';
      
      const qty = Number(it.quantity);
      const rate = Number(it.rate);
      const discountPercent = Number(it.discount_percent || 0);
      const taxPercent = Number(it.tax_percent || 18);

      const baseAmount = qty * rate * (1 - discountPercent / 100);
      const taxAmount = baseAmount * (taxPercent / 100);

      let taxCellsHtml = '';
      if (isInterstate) {
        taxCellsHtml = `
          <td style="text-align: center; font-family: monospace; border-right: 1px solid #e2e8f0;">${taxPercent}%</td>
          <td style="text-align: right; font-family: monospace; border-right: 1px solid #e2e8f0;">${taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        `;
      } else {
        const halfRate = taxPercent / 2;
        const halfAmount = taxAmount / 2;
        taxCellsHtml = `
          <td style="text-align: center; font-family: monospace; border-right: 1px solid #e2e8f0;">${halfRate}%</td>
          <td style="text-align: right; font-family: monospace; border-right: 1px solid #e2e8f0;">${halfAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="text-align: center; font-family: monospace; border-right: 1px solid #e2e8f0;">${halfRate}%</td>
          <td style="text-align: right; font-family: monospace; border-right: 1px solid #e2e8f0;">${halfAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        `;
      }

      return `
        <tr>
          <td style="text-align: center; font-family: monospace; border-right: 1px solid #e2e8f0;">${String(idx + 1).padStart(2, '0')}</td>
          <td style="border-right: 1px solid #e2e8f0;">
            <span class="item-desc">${prod.name || it.product_name || 'Item'}</span>
            ${prod.brand ? `<span class="item-subdesc">Brand: ${prod.brand} ${prod.sku ? `| SKU: ${prod.sku}` : ''}</span>` : ''}
          </td>
          <td style="text-align: center; font-family: monospace; border-right: 1px solid #e2e8f0;">${prod.hsn_code || prod.hsn || '—'}</td>
          <td style="text-align: right; border-right: 1px solid #e2e8f0;">${qty.toFixed(2)} <span style="font-size: 8.5px; color: #64748b;">${prod.unit || 'pcs'}</span></td>
          <td style="text-align: right; font-family: monospace; border-right: 1px solid #e2e8f0;">${rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td style="text-align: right; border-right: 1px solid #e2e8f0;">${discountText}</td>
          ${taxCellsHtml}
          <td style="text-align: right; font-weight: 600; font-family: monospace;">${Number(it.final_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    // Dynamic tax totals rows
    let taxTotalsRowsHtml = '';
    if (isInterstate) {
      taxTotalsRowsHtml = `
        <tr>
          <td class="label">IGST (${Number(items[0]?.tax_percent || 18).toFixed(0)}%)</td>
          <td class="value">${Number(totals.gst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `;
    } else {
      const halfGst = (totals.gst_amount || 0) / 2;
      const halfRate = (items[0]?.tax_percent || 18) / 2;
      taxTotalsRowsHtml = `
        <tr>
          <td class="label">CGST (${halfRate.toFixed(0)}%)</td>
          <td class="value">${halfGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td class="label">SGST (${halfRate.toFixed(0)}%)</td>
          <td class="value">${halfGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `;
    }

    const headerHtml = Header({
      documentTitle: 'Quote',
      metaFields: [
        { label: 'Quote Number', value: quote.quotation_number },
        { label: 'Quote Date', value: new Date(quote.created_at || Date.now()).toLocaleDateString('en-IN') },
        { label: 'Place Of Supply', value: placeOfSupply },
        { label: 'RFQ Ref', value: quote.rfq_number || 'N/A' }
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
            <div class="party-name">${customer.company || 'Customer Entity'}</div>
            <div>${customer.billing_address || 'No Billing Address'}</div>
            <div class="party-gst">GSTIN: ${customer.GSTIN || 'URD'}</div>
          </td>
          <td>
            <div class="party-name">${customer.company || 'Customer Entity'}</div>
            <div>${customer.shipping_address || 'No Shipping Address'}</div>
            <div class="party-gst">GSTIN: ${customer.GSTIN || 'URD'}</div>
          </td>
        </tr>
      </table>

      <!-- Items Grid -->
      <table class="items-table" style="border: 1px solid #cbd5e1;">
        <thead>
          <tr>
            <th rowspan="2" style="width: 5%; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">#</th>
            <th rowspan="2" style="width: 35%; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; text-align: left;">Item &amp; Description</th>
            <th rowspan="2" style="width: 10%; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; text-align: center;">HSN/SAC</th>
            <th rowspan="2" style="width: 8%; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; text-align: right;">Qty</th>
            <th rowspan="2" style="width: 10%; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; text-align: right;">Rate</th>
            <th rowspan="2" style="width: 8%; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; text-align: right;">Discount</th>
            ${taxHeaderHtml}
            <th rowspan="2" style="width: 12%; border-bottom: 1px solid #cbd5e1; text-align: right;">Amount</th>
          </tr>
          <tr>
            ${subTaxHeaderHtml}
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
            <div class="amount-words">
              <strong>Total In Words:</strong><br/>
              ${numberToIndianWords(Number(totals.grand_total))}
            </div>

            <div class="bank-details">
              <div class="bank-title">Bank Details for Wire Transfer</div>
              <div>A/c Name: <strong>Arcus Groups</strong></div>
              <div>Bank Name: <strong>HDFC Bank</strong></div>
              <div>A/c No: <strong>50200086161342</strong></div>
              <div>IFSC: <strong>HDFC0004210</strong></div>
            </div>

            ${quote.customer_notes ? `
              <div style="margin-top: 15px; font-size: 10px; color: #475569;">
                <strong>Notes:</strong><br/>
                ${quote.customer_notes}
              </div>
            ` : ''}
          </td>
          <td class="summary-right">
            <table class="totals-table">
              <tr>
                <td class="label">Sub Total</td>
                <td class="value">${Number(totals.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              ${taxTotalsRowsHtml}
              ${Number(totals.shipping) > 0 ? `
                <tr>
                  <td class="label">Shipping Charges</td>
                  <td class="value">${Number(totals.shipping).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ` : ''}
              ${Number(totals.other_charges) > 0 ? `
                <tr>
                  <td class="label">Other Charges</td>
                  <td class="value">${Number(totals.other_charges).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ` : ''}
              <tr>
                <td class="label">Rounding</td>
                <td class="value">${Number(totals.round_off || 0).toFixed(2)}</td>
              </tr>
              <tr class="grand-total">
                <td class="label" style="text-align: right; border: 0;">Total</td>
                <td class="value" style="border: 0;">₹${Number(totals.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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

      <!-- Terms and Conditions -->
      <div class="terms-section">
        <div class="terms-title">Terms &amp; Conditions</div>
        <div style="margin-bottom: 2px;">1. Validity: Subject proposal is valid until <strong>${new Date(quote.validity_date || Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}</strong>.</div>
        <div style="margin-bottom: 2px;">2. Payment: Terms of payment are configured as <strong>${quote.payment_terms || 'Net 30 standard credit'}</strong>.</div>
        <div>3. Supply and delivery location conditions are agreed under: <strong>${quote.delivery_terms || 'F.O.R Site Delivery'}</strong>.</div>
      </div>
    `;

    // Determine watermark based on status
    let watermarkText = '';
    if (quote.status === 'DRAFT') {
      watermarkText = 'DRAFT';
    } else if (quote.status === 'REJECTED') {
      watermarkText = 'CANCELLED';
    }

    return DocumentLayout({
      title: `Arcus Groups Quote - ${quote.quotation_number}`,
      watermarkText,
      contentHtml
    });
  }
}
export default QuotationRenderer;
