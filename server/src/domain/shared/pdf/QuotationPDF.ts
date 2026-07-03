import { DocumentGenerator, GeneratedDocument } from './DocumentGenerator';

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

export class QuotationPDF implements DocumentGenerator {
  public async generate(data: any): Promise<GeneratedDocument> {
    const quote = data.quotation;
    const totals = data.totals;
    const items = data.items || [];
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

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Quotation ${quote.quotation_number}</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 0;
            font-size: 11px;
            line-height: 1.4;
            background-color: #ffffff;
          }
          .container {
            width: 100%;
            position: relative;
            background-color: #ffffff;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .logo-cell {
            width: 35%;
            vertical-align: top;
          }
          .address-cell {
            width: 40%;
            vertical-align: top;
            font-size: 11px;
            color: #334155;
            line-height: 1.4;
          }
          .title-cell {
            width: 25%;
            vertical-align: bottom;
            text-align: right;
          }
          .quote-title {
            font-size: 32px;
            font-weight: 300;
            color: #1e293b;
            margin: 0;
            letter-spacing: 0.5px;
          }
          .logo-box {
            display: inline-block;
            text-align: center;
          }
          .logo-icon {
            width: 50px;
            height: 50px;
            border: 3px solid #1e3a8a;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 900;
            color: #1e3a8a;
            margin-bottom: 4px;
            line-height: 44px;
            text-align: center;
          }
          .logo-text {
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 1px;
            color: #1e293b;
            text-transform: uppercase;
          }
          .metadata-bar {
            width: 100%;
            border-top: 1px solid #cbd5e1;
            border-bottom: 1px solid #cbd5e1;
            background-color: #f8fafc;
            padding: 8px 10px;
            margin-bottom: 20px;
            font-size: 11px;
          }
          .metadata-table {
            width: 100%;
            border-collapse: collapse;
          }
          .metadata-table td {
            padding: 3px 0;
          }
          .address-grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border: 1px solid #e2e8f0;
          }
          .address-header {
            background-color: #f1f5f9;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 10px;
            color: #475569;
            border-bottom: 1px solid #e2e8f0;
          }
          .address-header td {
            padding: 6px 10px;
          }
          .address-body td {
            padding: 10px;
            width: 50%;
            vertical-align: top;
            line-height: 1.5;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border: 1px solid #cbd5e1;
          }
          .items-table th {
            background-color: #f1f5f9;
            color: #1e293b;
            font-weight: bold;
            font-size: 10px;
            padding: 6px;
            border-bottom: 1px solid #cbd5e1;
            border-right: 1px solid #cbd5e1;
            text-align: center;
            text-transform: uppercase;
          }
          .items-table th:last-child {
            border-right: 0;
          }
          .footer-section {
            width: 100%;
            margin-top: 10px;
          }
          .footer-table {
            width: 100%;
            border-collapse: collapse;
          }
          .left-footer {
            width: 55%;
            vertical-align: top;
            padding-right: 20px;
          }
          .right-footer {
            width: 45%;
            vertical-align: top;
          }
          .totals-table {
            width: 100%;
            border-collapse: collapse;
          }
          .totals-table td {
            padding: 5px 8px;
            font-size: 11px;
          }
          .totals-table tr.grand-total {
            font-weight: bold;
            font-size: 13px;
            border-top: 1.5px solid #1e293b;
            border-bottom: 1.5px solid #1e293b;
            background-color: #f8fafc;
          }
          .sig-box {
            border: 1px solid #cbd5e1;
            height: 80px;
            margin-top: 15px;
            border-radius: 4px;
            position: relative;
          }
          .sig-label {
            position: absolute;
            bottom: 6px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 10px;
            color: #64748b;
          }
          .branding-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
            font-size: 8px;
            color: #94a3b8;
          }
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
                <strong>Arcus Groups</strong><br>
                2ND FLOOR, 204/93, RISHIKA, 7th Main Road, Benelli<br>
                Showroom Whitefield<br>
                B Narayanapura<br>
                Bengaluru Urban Karnataka 560016<br>
                India<br>
                GSTIN 29CBWPR3706D1Z7<br>
                arcusgroups.blr@gmail.com
              </td>
              <td class="title-cell">
                <h1 class="quote-title">Quote</h1>
              </td>
            </tr>
          </table>

          <!-- Metadata Bar -->
          <div class="metadata-bar">
            <table class="metadata-table">
              <tr>
                <td style="width: 15%; font-weight: bold; color: #475569;">#</td>
                <td style="width: 35%; font-weight: bold;">: ${quote.quotation_number}</td>
                <td style="width: 20%; font-weight: bold; color: #475569; text-align: right;">Place Of Supply</td>
                <td style="width: 30%; font-weight: bold; text-align: right;">: ${placeOfSupply}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #475569;">Quote Date</td>
                <td style="font-weight: bold;">: ${new Date(quote.created_at).toLocaleDateString('en-GB')}</td>
                <td></td>
                <td></td>
              </tr>
            </table>
          </div>

          <!-- Bill To / Ship To Grid -->
          <table class="address-grid">
            <tr class="address-header">
              <td style="border-right: 1px solid #e2e8f0; width: 50%;">Bill To</td>
              <td style="width: 50%;">Ship To</td>
            </tr>
            <tr class="address-body">
              <td style="border-right: 1px solid #e2e8f0;">
                <strong>${customer.company || 'N/A'}</strong><br>
                ${customer.billing_address || 'N/A'}<br>
                GSTIN ${customer.GSTIN || 'Unregistered'}
              </td>
              <td>
                <strong>${customer.company || 'N/A'}</strong><br>
                ${customer.shipping_address || 'N/A'}<br>
                GSTIN ${customer.GSTIN || 'Unregistered'}
              </td>
            </tr>
          </table>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th rowspan="2" style="width: 4%;">#</th>
                <th rowspan="2" style="width: 32%; text-align: left;">Item & Description</th>
                <th rowspan="2" style="width: 8%;">HSN<br>/SAC</th>
                <th rowspan="2" style="width: 8%;">Qty</th>
                <th rowspan="2" style="width: 10%; text-align: right;">Rate</th>
                <th rowspan="2" style="width: 8%; text-align: right;">Discount</th>
                <th colspan="2" style="width: 12%; border-bottom: 1px solid #cbd5e1;">CGST</th>
                <th colspan="2" style="width: 12%; border-bottom: 1px solid #cbd5e1;">SGST</th>
                <th rowspan="2" style="width: 12%; text-align: right;">Amount</th>
              </tr>
              <tr>
                <th style="font-size: 8px; padding: 3px; border-right: 1px solid #cbd5e1;">%</th>
                <th style="font-size: 8px; padding: 3px; border-right: 1px solid #cbd5e1;">Amt</th>
                <th style="font-size: 8px; padding: 3px; border-right: 1px solid #cbd5e1;">%</th>
                <th style="font-size: 8px; padding: 3px; border-right: 1px solid #cbd5e1;">Amt</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>

          <!-- Footer Summary -->
          <div class="footer-section">
            <table class="footer-table">
              <tr>
                <td class="left-footer">
                  <div style="margin-bottom: 12px;">
                    <div style="font-weight: bold; color: #475569; margin-bottom: 3px;">Total In Words</div>
                    <div style="font-style: italic; font-weight: bold; color: #1e293b;">${totalInWords}</div>
                  </div>
                  
                  <div style="margin-bottom: 12px;">
                    <div style="font-weight: bold; color: #475569; margin-bottom: 3px;">Notes</div>
                    <div style="color: #334155;">Looking forward for your business.</div>
                  </div>

                  <div>
                    <strong>A/c Name:</strong> Arcus Groups<br>
                    <strong>Bank Name:</strong> HDFC Bank<br>
                    <strong>A/c No:</strong> 50200086161342<br>
                    <strong>IFSC:</strong> HDFC0004210
                  </div>
                </td>
                
                <td class="right-footer">
                  <table class="totals-table">
                    <tr>
                      <td style="color: #475569; text-align: right; width: 60%;">Sub Total</td>
                      <td style="font-family: monospace; text-align: right; width: 40%; font-weight: bold;">${formattedSubtotal}</td>
                    </tr>
                    <tr>
                      <td style="color: #475569; text-align: right;">CGST (${(quote.items?.[0]?.tax_percent || 18) / 2}%)</td>
                      <td style="font-family: monospace; text-align: right; font-weight: bold;">${formattedCgst}</td>
                    </tr>
                    <tr>
                      <td style="color: #475569; text-align: right;">SGST (${(quote.items?.[0]?.tax_percent || 18) / 2}%)</td>
                      <td style="font-family: monospace; text-align: right; font-weight: bold;">${formattedSgst}</td>
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

    return {
      filename: `${quote.quotation_number}_v${quote.version}.html`,
      mimeType: 'text/html',
      content: htmlContent
    };
  }
}
