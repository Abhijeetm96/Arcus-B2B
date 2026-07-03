import { DocumentRenderer } from '../DocumentRenderer';
import { Order } from '../../../modules/orders/Order';

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

export class InvoiceRenderer implements DocumentRenderer<Order> {
  public async render(order: Order): Promise<string> {
    const items = order.items || [];
    const invoiceNumber = `INV-${order.id.split('-').pop()?.toUpperCase()}`;
    const invoiceDate = new Date(order.timestamp || order.date || Date.now()).toLocaleDateString('en-IN');

    // Parse state from shipping address
    let customerState = 'Karnataka';
    for (const state of Object.keys(stateCodes)) {
      if (order.shippingAddress?.toLowerCase().includes(state.toLowerCase())) {
        customerState = state;
        break;
      }
    }
    const customerStateCode = stateCodes[customerState] || '29';
    const placeOfSupply = `${customerState} (${customerStateCode})`;
    const isInterstate = customerState.toLowerCase() !== 'karnataka';

    // GST computations (18% inclusive GST for B2B portal orders)
    const subtotal = order.amount / 1.18;
    const gstAmount = order.amount - subtotal;
    const halfGst = gstAmount / 2;

    const itemsRowsHtml = items.map((it: any, idx: number) => {
      const lineTotal = it.price * it.qty;
      const itemSubtotal = lineTotal / 1.18;
      const itemGst = lineTotal - itemSubtotal;
      
      let taxText = '9% + 9%';
      if (isInterstate) {
        taxText = '18% IGST';
      }

      return `
        <tr class="hover:bg-slate-50/50">
          <td class="text-gray-400 text-center font-mono">${String(idx + 1).padStart(2, '0')}</td>
          <td>
            <span class="font-semibold block text-gray-900">${it.productName || it.name || 'Product'}</span>
          </td>
          <td class="text-center text-gray-400 font-mono">3917</td>
          <td class="text-right font-medium">${Number(it.qty).toFixed(2)} <span class="text-xxs text-gray-400">pcs</span></td>
          <td class="text-right font-mono">${Number(it.price / 1.18).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td class="text-right font-medium">—</td>
          <td class="text-right font-medium">${taxText}</td>
          <td class="text-right font-semibold text-gray-900 font-mono">${Number(lineTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    const formattedGrandTotal = Number(order.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formattedSubtotal = subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalInWords = numberToIndianWords(Number(order.amount));

    // Dynamic tax layout for totals block
    let taxRowsHtml = '';
    if (isInterstate) {
      taxRowsHtml = `
        <div class="flex justify-between text-gray-500">
          <span>IGST (18%)</span>
          <span class="font-medium text-gray-900 font-mono">${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      `;
    } else {
      taxRowsHtml = `
        <div class="flex justify-between text-gray-500">
          <span>CGST (9%)</span>
          <span class="font-medium text-gray-900 font-mono">${halfGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div class="flex justify-between text-gray-500">
          <span>SGST (9%)</span>
          <span class="font-medium text-gray-900 font-mono">${halfGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
        <title>Arcus Groups Tax Invoice - ${invoiceNumber}</title>
        <!-- Tailwind CSS CDN with forms and container-queries -->
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <style data-purpose="typography">
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            color: #1f2937;
            background-color: #f9fafb;
          }
          .text-xxs {
            font-size: 0.7rem;
          }
        </style>
        <style data-purpose="layout">
          @media print {
            body {
              background-color: white;
              padding: 0 !important;
              margin: 0 !important;
            }
            main {
              box-shadow: none !important;
              max-width: 100% !important;
              width: 100% !important;
              border-radius: 0 !important;
              padding: 0 !important;
            }
          }
          /* Modern minimalist table styles */
          .invoice-table th {
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.025em;
            color: #6b7280;
            border-bottom: 1px solid #f3f4f6;
            padding: 12px 8px;
          }
          .invoice-table td {
            padding: 12px 8px;
            border-bottom: 1px solid #f9fafb;
            line-height: 1.5;
          }
          .invoice-table tr:last-child td {
            border-bottom: none;
          }
        </style>
      </head>
      <body class="p-4 md:p-12 flex justify-center">
        <!-- BEGIN: Main Container -->
        <main class="bg-white w-full max-w-[850px] shadow-sm print-shadow rounded-lg overflow-hidden" data-purpose="invoice-document">
          
          <!-- BEGIN: Header Section -->
          <header class="p-8 md:p-12 pb-6">
            <div class="flex justify-between items-start">
              <div class="flex flex-col gap-6">
                <!-- Logo -->
                <img alt="Arcus Groups Logo" class="h-12 w-auto object-contain self-start" data-purpose="company-logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3bMPtG0F6yJpAIWao2hoWPuYYOKBPUHS8xoO4OwJcZ-AEdCwk-kJjmI-4HqmFnm68z4z4CzAg81W_UnwHpI2xOvG-CSNHQ3OPIMsww3h67V_Hlct6MDYQzuOumOAYpvahQSCGqzRvsWQBkAnzBZ75wAgfV9BnCtZNrn7Qi7UsVKx4J8Xbof1caADe4vwMTAO6oTCuYHZAzozkVUcZUzURdxbLElvA-h_8XKLbHlj1tRQpsZyL05EDGCgo1ZEj2TDAdxdps5fm71pS"/>
                <div data-purpose="company-address">
                  <h1 class="font-bold text-2xl tracking-tight text-gray-900">Arcus Groups</h1>
                  <address class="not-italic text-sm mt-3 text-gray-500 leading-relaxed max-w-xs">
                    2ND FLOOR, 204/93, RISHIKA, 7th Main Road,<br/>
                    Benelli Showroom Whitefield,<br/>
                    B Narayanapura, Bengaluru Urban<br/>
                    Karnataka 560016, India<br/>
                    <span class="font-medium text-gray-700 block mt-2">GSTIN: 29CBWPR3706D1Z7</span>
                    <span class="block">arcusgroups.blr@gmail.com</span>
                  </address>
                </div>
              </div>
              <div class="text-right">
                <h2 class="text-5xl font-extralight mb-8 text-gray-800">Tax Invoice</h2>
                <div class="space-y-1 text-sm">
                  <p class="text-gray-400">Invoice Number</p>
                  <p class="font-semibold text-gray-900 font-mono">${invoiceNumber}</p>
                  <p class="text-gray-400 mt-4">Date</p>
                  <p class="font-semibold text-gray-900 font-mono">${invoiceDate}</p>
                </div>
              </div>
            </div>
          </header>
          <!-- END: Header Section -->

          <!-- BEGIN: Place of Supply Ribbon -->
          <section class="px-8 md:px-12 py-6 border-y border-gray-50 flex justify-between items-center text-sm" data-purpose="document-info">
            <div class="flex gap-2">
              <span class="text-gray-400 uppercase tracking-wider text-xs font-semibold">Place Of Supply:</span>
              <span class="font-medium">${placeOfSupply}</span>
            </div>
            <div class="flex gap-2">
              <span class="text-gray-400 uppercase tracking-wider text-xs font-semibold">Order ID:</span>
              <span class="font-medium font-mono">${order.id}</span>
            </div>
          </section>

          <!-- BEGIN: Billing and Shipping -->
          <section class="grid grid-cols-2 gap-12 p-8 md:p-12 text-sm" data-purpose="billing-shipping">
            <div class="space-y-4">
              <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Bill To</h3>
              <div class="text-gray-600 leading-relaxed font-sans">
                <p class="whitespace-pre-line">${order.billingAddress || 'No Billing Address'}</p>
                <p class="font-semibold text-gray-800 mt-2">GSTIN: <span class="font-mono">${order.gstNumber || 'URD (Unregistered)'}</span></p>
              </div>
            </div>
            <div class="space-y-4">
              <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Ship To</h3>
              <div class="text-gray-600 leading-relaxed font-sans">
                <p class="whitespace-pre-line">${order.shippingAddress || 'No Shipping Address'}</p>
                <p class="font-semibold text-gray-800 mt-2">GSTIN: <span class="font-mono">${order.gstNumber || 'URD (Unregistered)'}</span></p>
              </div>
            </div>
          </section>
          <!-- END: Billing and Shipping -->

          <!-- BEGIN: Items Table -->
          <section class="px-8 md:px-12 pb-12" data-purpose="items-table">
            <table class="w-full text-xs invoice-table">
              <thead>
                <tr class="text-left">
                  <th class="w-8 text-center">#</th>
                  <th class="w-48 text-left">Item &amp; Description</th>
                  <th class="text-center">HSN</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Rate (excl. tax)</th>
                  <th class="text-right">Disc</th>
                  <th class="text-right">Tax Rate</th>
                  <th class="text-right">Amount (incl. tax)</th>
                </tr>
              </thead>
              <tbody class="text-gray-700">
                ${itemsRowsHtml}
              </tbody>
            </table>
          </section>
          <!-- END: Items Table -->

          <!-- BEGIN: Totals and Notes -->
          <section class="grid grid-cols-12 gap-8 px-8 md:px-12 py-12 bg-gray-50/50" data-purpose="totals-section">
            <!-- Left Column: Words and Bank Details -->
            <div class="col-span-7 space-y-8">
              <div>
                <p class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Total In Words</p>
                <p class="text-sm font-medium text-gray-800 italic">${totalInWords}</p>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Bank Details</p>
                  <div class="text-[11px] space-y-1 text-gray-600">
                    <p><span class="text-gray-400 uppercase mr-1">Name:</span> ARCUS INFRASTRUCTURE PRIVATE LIMITED</p>
                    <p><span class="text-gray-400 uppercase mr-1">Bank:</span> HDFC Bank</p>
                    <p><span class="text-gray-400 uppercase mr-1">A/c:</span> <span class="font-mono font-bold text-gray-800">50200067394012</span></p>
                    <p><span class="text-gray-400 uppercase mr-1">IFSC:</span> <span class="font-mono font-bold text-gray-800">HDFC0000094</span></p>
                  </div>
                </div>
                <div>
                  <p class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Terms &amp; Notes</p>
                  <div class="text-[11px] text-gray-600 leading-relaxed font-sans">
                    <p>• Payment Method: ${order.paymentMethod || 'COD'}</p>
                    <p>• Delivery: F.O.R Site Delivery</p>
                    <p class="mt-1 italic">Looking forward to your business.</p>
                  </div>
                </div>
              </div>
            </div>
            <!-- Right Column: Calculation Summary -->
            <div class="col-span-5">
              <div class="space-y-3 text-sm">
                <div class="flex justify-between text-gray-500">
                  <span>Sub Total (excl. tax)</span>
                  <span class="font-medium text-gray-900 font-mono">${formattedSubtotal}</span>
                </div>
                ${taxRowsHtml}
                <div class="flex justify-between items-baseline pt-4 border-t border-gray-200" style="border-top-color: #1e3a8a; border-top-width: 2px;">
                  <span class="text-xs font-bold uppercase tracking-widest text-gray-900">Total</span>
                  <span class="text-2xl font-bold text-gray-900 font-mono">₹${formattedGrandTotal}</span>
                </div>
              </div>
              
              <!-- Authorized Signature -->
              <div class="mt-16 text-center">
                <div class="h-12 flex items-end justify-center mb-2">
                  <!-- Signature space -->
                </div>
                <div class="border-t border-gray-200 pt-3">
                  <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Authorized Signature</p>
                </div>
              </div>
            </div>
          </section>
          <!-- END: Totals and Notes -->
          
          <!-- Footer extra space -->
          <div class="h-16"></div>
        </main>
        <!-- END: Main Container -->
      </body>
      </html>
    `;
  }
}
