import { DocumentRenderer } from '../DocumentRenderer';
import { corporateTheme } from '../../shared/styles/corporate-theme';

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

    const itemsRowsHtml = items.map((it: any, idx: number) => {
      const prod = it.product_snapshot || {};
      const discountText = it.discount_percent > 0 ? `${Number(it.discount_percent).toFixed(2)}%` : '0.00';
      const halfTaxRate = (it.tax_percent || 18) / 2;
      const cgstAmt = it.tax_amount ? it.tax_amount / 2 : 0;
      
      return `
        <tr style="border-bottom: 1px solid #cbd5e1; font-size: 11px;">
          <td style="padding: 8px; text-align: center; border-right: 1px solid #cbd5e1;">${idx + 1}</td>
          <td style="padding: 8px; border-right: 1px solid #cbd5e1; text-align: left;">
            <div style="font-weight: bold; color: #1e293b;">${prod.name || it.product_name}</div>
          </td>
          <td style="padding: 8px; text-align: center; border-right: 1px solid #cbd5e1; font-family: monospace;">${prod.hsn_code || prod.hsn || '3917'}</td>
          <td style="padding: 8px; text-align: center; border-right: 1px solid #cbd5e1;">
            <div>${Number(it.quantity).toFixed(2)}</div>
            <div style="font-size: 9px; color: #64748b; margin-top: 2px;">${prod.unit || 'pcs'}</div>
          </td>
          <td style="padding: 8px; text-align: right; border-right: 1px solid #cbd5e1; font-family: monospace;">${Number(it.rate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="padding: 8px; text-align: right; border-right: 1px solid #cbd5e1; font-family: monospace;">${discountText}</td>
          
          <!-- CGST Column -->
          <td style="padding: 8px; text-align: center; border-right: 1px solid #cbd5e1; font-family: monospace;">${halfTaxRate}%</td>
          <td style="padding: 8px; text-align: right; border-right: 1px solid #cbd5e1; font-family: monospace;">${cgstAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          
          <!-- SGST Column -->
          <td style="padding: 8px; text-align: center; border-right: 1px solid #cbd5e1; font-family: monospace;">${halfTaxRate}%</td>
          <td style="padding: 8px; text-align: right; border-right: 1px solid #cbd5e1; font-family: monospace;">${cgstAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          
          <td style="padding: 8px; text-align: right; font-weight: bold; font-family: monospace;">${Number(it.final_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    const formattedGrandTotal = Number(totals.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formattedSubtotal = Number(totals.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    // Split GST details
    const halfGst = totals.gst_amount ? totals.gst_amount / 2 : 0;
    const formattedCgst = halfGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formattedSgst = halfGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    const formattedRoundoff = Number(totals.round_off).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalInWords = numberToIndianWords(Number(totals.grand_total));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Quotation ${quote.quotation_number}</title>
        <style>
          ${corporateTheme}
        </style>
      </head>
      <body>
        <div class="container">
          
          <!-- Top Header Table -->
          <table class="header-table">
            <tr>
              <td class="logo-cell">
                <div class="logo-box">
                  <div style="font-size: 26px; font-weight: 900; color: #1e3a8a; letter-spacing: -1px; display: flex; align-items: center; gap: 6px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-weight: bold; font-size: 32px; border: 2.5px solid #1e3a8a; padding: 2px 8px; border-radius: 4px;">AG</span>
                    <div style="text-align: left; line-height: 1;">
                      <span style="font-size: 16px; font-weight: 900; text-transform: uppercase;">Arcus</span><br>
                      <span style="font-size: 9px; font-weight: bold; color: #64748b; tracking: 1px;">GROUPS</span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="address-cell">
                <div style="font-weight: 900; font-size: 12px; color: #1e293b; margin-bottom: 2px;">ARCUS INFRASTRUCTURE PRIVATE LIMITED</div>
                <div>Regd Office: Ground Floor, Block A, Prestige Tech Park,</div>
                <div>Outer Ring Road, Kadubeesanahalli, Bengaluru, Karnataka - 560103</div>
                <div>GSTIN: 29AAICA2940J1ZX | Phone: +91 80 4910 2000</div>
              </td>
              <td class="title-cell">
                <h1 class="doc-title">QUOTATION</h1>
              </td>
            </tr>
          </table>

          <!-- Metadata Ribbon Table -->
          <div class="metadata-bar">
            <table class="metadata-table">
              <tr>
                <td style="width: 15%; color: #64748b; font-weight: bold;">Quotation #</td>
                <td style="width: 35%; font-weight: bold; color: #1e3a8a;">${quote.quotation_number}</td>
                <td style="width: 15%; color: #64748b; font-weight: bold;">Quote Date</td>
                <td style="width: 35%; font-family: monospace;">${new Date(quote.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="color: #64748b; font-weight: bold;">RFQ Reference</td>
                <td style="font-family: monospace;">${quote.rfq_number || 'RFQ-2026-001'}</td>
                <td style="color: #64748b; font-weight: bold;">Valid Until</td>
                <td style="font-family: monospace;">${new Date(quote.expires_at || (Date.now() + 7 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="color: #64748b; font-weight: bold;">Place Of Supply</td>
                <td colspan="3" style="font-weight: bold;">${placeOfSupply}</td>
              </tr>
            </table>
          </div>

          <!-- Billing & Shipping side-by-side -->
          <table class="address-grid">
            <tr class="address-header">
              <td style="border-right: 1px solid #e2e8f0;">Bill To</td>
              <td>Ship To</td>
            </tr>
            <tr class="address-body">
              <td style="border-right: 1px solid #e2e8f0;">
                <div style="font-weight: bold; color: #1e293b; font-size: 12px; margin-bottom: 4px;">${customer.company || 'Customer Entity'}</div>
                <div style="white-space: pre-wrap; font-size: 11px; color: #475569;">${customer.billing_address || 'No Billing Address'}</div>
                <div style="margin-top: 6px; font-size: 10px;">
                  <strong>GSTIN:</strong> <span style="font-family: monospace;">${customer.GSTIN || 'URD (Unregistered)'}</span>
                </div>
                <div style="font-size: 10px;">
                  <strong>Contact Person:</strong> ${customer.contact_person || 'N/A'} | <strong>Phone:</strong> ${customer.phone || 'N/A'}
                </div>
              </td>
              <td>
                <div style="font-weight: bold; color: #1e293b; font-size: 12px; margin-bottom: 4px;">${customer.company || 'Customer Entity'}</div>
                <div style="white-space: pre-wrap; font-size: 11px; color: #475569;">${customer.shipping_address || 'No Shipping Address'}</div>
                <div style="margin-top: 6px; font-size: 10px;">
                  <strong>GSTIN:</strong> <span style="font-family: monospace;">${customer.GSTIN || 'URD (Unregistered)'}</span>
                </div>
                <div style="font-size: 10px;">
                  <strong>Contact Person:</strong> ${customer.contact_person || 'N/A'} | <strong>Phone:</strong> ${customer.phone || 'N/A'}
                </div>
              </td>
            </tr>
          </table>

          <!-- Items polymorphic table with nested CGST/SGST columns -->
          <table class="items-table">
            <thead>
              <tr>
                <th rowspan="2" style="width: 4%;">#</th>
                <th rowspan="2" style="width: 32%; text-align: left;">Product / Service Description</th>
                <th rowspan="2" style="width: 10%;">HSN/SAC</th>
                <th rowspan="2" style="width: 10%;">Qty</th>
                <th rowspan="2" style="width: 12%;">Rate</th>
                <th rowspan="2" style="width: 8%;">Disc</th>
                <th colspan="2" style="width: 12%; border-bottom: 1px solid #cbd5e1;">CGST</th>
                <th colspan="2" style="width: 12%; border-bottom: 1px solid #cbd5e1;">SGST</th>
                <th rowspan="2" style="width: 12%;">Amount</th>
              </tr>
              <tr>
                <th style="font-size: 8px; padding: 3px; border-right: 1px solid #cbd5e1;">Rate</th>
                <th style="font-size: 8px; padding: 3px; border-right: 1px solid #cbd5e1;">Amt</th>
                <th style="font-size: 8px; padding: 3px; border-right: 1px solid #cbd5e1;">Rate</th>
                <th style="font-size: 8px; padding: 3px; border-right: 1px solid #cbd5e1;">Amt</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>

          <!-- Footer Summary calculations and T&C -->
          <div class="footer-section">
            <table class="footer-table">
              <tr>
                <!-- Left footer: Bank Details & Commercial Terms -->
                <td class="left-footer">
                  <div style="font-weight: bold; color: #475569; font-size: 10px; margin-bottom: 4px; text-transform: uppercase;">Bank Account Details (For Payments)</div>
                  <table style="width: 100%; border-collapse: collapse; font-size: 10px; color: #334155; line-height: 1.5; margin-bottom: 15px;">
                    <tr>
                      <td style="width: 30%; font-weight: bold;">Account Name</td>
                      <td>ARCUS INFRASTRUCTURE PRIVATE LIMITED</td>
                    </tr>
                    <tr>
                      <td style="font-weight: bold;">Bank Name</td>
                      <td>HDFC Bank Limited</td>
                    </tr>
                    <tr>
                      <td style="font-weight: bold;">Account Number</td>
                      <td style="font-family: monospace; font-weight: bold; color: #1e3a8a;">50200067394012</td>
                    </tr>
                    <tr>
                      <td style="font-weight: bold;">IFSC Code</td>
                      <td style="font-family: monospace; font-weight: bold; color: #1e3a8a;">HDFC0000094</td>
                    </tr>
                    <tr>
                      <td style="font-weight: bold;">Branch Details</td>
                      <td>Prestige Tech Park Branch, Bangalore</td>
                    </tr>
                  </table>

                  <div style="font-weight: bold; color: #475569; font-size: 10px; margin-bottom: 4px; text-transform: uppercase;">Terms & Conditions</div>
                  <ul style="margin: 0; padding-left: 15px; font-size: 10px; color: #475569; line-height: 1.5;">
                    <li><strong>Delivery terms:</strong> F.O.R Site Delivery as specified in project order.</li>
                    <li><strong>Payment terms:</strong> Net 30 standard commercial credit limit.</li>
                    <li>Interest @ 18% per annum will be charged for payments delayed beyond due date.</li>
                    <li>Goods once dispatched cannot be returned or cancelled.</li>
                  </ul>
                </td>

                <!-- Right footer: Price totals split & signature box -->
                <td class="right-footer">
                  <table class="totals-table">
                    <tr>
                      <td style="width: 55%; color: #475569; text-align: right;">Subtotal</td>
                      <td style="font-family: monospace; text-align: right; width: 45%;">${formattedSubtotal}</td>
                    </tr>
                    <tr>
                      <td style="color: #475569; text-align: right;">Discount</td>
                      <td style="font-family: monospace; text-align: right; color: #dc2626;">-${Number(totals.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td style="color: #475569; text-align: right; font-weight: bold;">Taxable Amount</td>
                      <td style="font-family: monospace; text-align: right; font-weight: bold;">${Number(totals.taxable_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td style="color: #475569; text-align: right;">CGST Total</td>
                      <td style="font-family: monospace; text-align: right;">${formattedCgst}</td>
                    </tr>
                    <tr>
                      <td style="color: #475569; text-align: right;">SGST Total</td>
                      <td style="font-family: monospace; text-align: right;">${formattedSgst}</td>
                    </tr>
                    <tr>
                      <td style="color: #475569; text-align: right;">Rounding</td>
                      <td style="font-family: monospace; text-align: right; font-weight: bold;">${formattedRoundoff}</td>
                    </tr>
                    <tr class="grand-total">
                      <td style="text-align: right;">Total</td>
                      <td style="font-family: monospace; text-align: right; font-size: 14px; font-weight: 900; color: #1e3a8a;">₹${formattedGrandTotal}</td>
                    </tr>
                  </table>
                  
                  <div style="font-size: 10px; font-weight: bold; color: #334155; margin-top: 10px; line-height: 1.4; text-align: right; text-transform: uppercase;">
                    Amount in words:<br>
                    <span style="font-size: 9px; color: #4b5563; font-style: italic; text-transform: none;">${totalInWords}</span>
                  </div>

                  <div class="sig-box">
                    <div class="sig-label">Authorized Signature</div>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <!-- Bottom Branding Footer -->
          <div class="branding-footer">
            <div style="display: flex; align-items: center; gap: 4px;">
              <span>POWERED BY</span>
              <span style="font-weight: 900; color: #1e3a8a; letter-spacing: -0.5px;">ARCUS</span>
            </div>
            <div>1</div>
          </div>

        </div>
      </body>
      </html>
    `;
  }
}
