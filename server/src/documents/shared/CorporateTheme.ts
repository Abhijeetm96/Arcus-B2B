export const CorporateTheme = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');

  @page {
    size: A4;
    margin: 20mm 15mm 20mm 15mm;
  }

  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background-color: #ffffff !important;
    }
    .no-print {
      display: none !important;
    }
    .page-break {
      page-break-before: always;
    }
  }

  * {
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', sans-serif;
    color: #1e293b;
    margin: 0;
    padding: 0;
    font-size: 11px;
    line-height: 1.5;
    background-color: #ffffff;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Poppins', sans-serif;
    margin: 0;
    color: #0f172a;
  }

  .container {
    width: 100%;
    position: relative;
    background-color: #ffffff;
  }

  /* Document Header */
  .header-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 25px;
  }

  .logo-cell {
    width: 40%;
    vertical-align: top;
  }

  .company-details {
    font-size: 11px;
    color: #475569;
    line-height: 1.4;
    margin-top: 8px;
  }

  .company-name {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .title-cell {
    width: 60%;
    vertical-align: top;
    text-align: right;
  }

  .document-title {
    font-size: 36px;
    font-weight: 300;
    color: #334155;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
  }

  .meta-grid {
    display: inline-table;
    border-collapse: collapse;
    text-align: left;
  }

  .meta-grid td {
    padding: 2px 8px;
    font-size: 11px;
  }

  .meta-label {
    color: #64748b;
    font-weight: 500;
    text-align: right;
    padding-right: 15px !important;
  }

  .meta-value {
    color: #0f172a;
    font-weight: 600;
    font-family: monospace;
  }

  /* Bill To / Ship To */
  .party-section {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 25px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
  }

  .party-header {
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .party-header th {
    padding: 6px 12px;
    font-size: 10px;
    text-transform: uppercase;
    color: #475569;
    font-weight: 700;
    text-align: left;
    width: 50%;
  }

  .party-body td {
    padding: 12px;
    vertical-align: top;
    width: 50%;
    font-size: 11px;
    line-height: 1.5;
  }

  .party-name {
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .party-gst {
    margin-top: 6px;
    font-weight: 600;
    color: #334155;
  }

  /* Items Table */
  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }

  .items-table th {
    background-color: #f1f5f9;
    color: #334155;
    font-weight: 700;
    font-size: 10px;
    padding: 8px 10px;
    border-top: 1px solid #cbd5e1;
    border-bottom: 1px solid #cbd5e1;
    text-transform: uppercase;
  }

  .items-table td {
    padding: 10px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: top;
    font-size: 11px;
  }

  .items-table tr {
    page-break-inside: avoid;
  }

  .item-desc {
    font-weight: 600;
    color: #0f172a;
    display: block;
  }

  .item-subdesc {
    color: #64748b;
    font-size: 9.5px;
    display: block;
    margin-top: 2px;
  }

  /* Summary Section */
  .summary-section {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
  }

  .summary-left {
    width: 55%;
    vertical-align: top;
    padding-right: 25px;
  }

  .summary-right {
    width: 45%;
    vertical-align: top;
  }

  .amount-words {
    font-style: italic;
    color: #475569;
    margin-bottom: 15px;
    font-size: 10.5px;
  }

  .bank-details {
    border: 1px solid #e2e8f0;
    background-color: #f8fafc;
    border-radius: 4px;
    padding: 10px;
    font-size: 10px;
    line-height: 1.4;
  }

  .bank-title {
    font-weight: 700;
    color: #334155;
    text-transform: uppercase;
    font-size: 9px;
    margin-bottom: 6px;
    letter-spacing: 0.5px;
  }

  .totals-table {
    width: 100%;
    border-collapse: collapse;
  }

  .totals-table td {
    padding: 6px 12px;
    font-size: 11px;
  }

  .totals-table td.label {
    color: #64748b;
    text-align: right;
  }

  .totals-table td.value {
    color: #0f172a;
    font-weight: 600;
    text-align: right;
    font-family: monospace;
    width: 120px;
  }

  .totals-table tr.grand-total td {
    font-weight: bold;
    font-size: 14px;
    border-top: 2px solid #0f172a;
    border-bottom: 2px solid #0f172a;
    background-color: #f8fafc;
    padding: 8px 12px;
  }

  .totals-table tr.grand-total td.value {
    color: #0f172a;
    font-size: 14px;
  }

  /* Terms and Signatures */
  .terms-section {
    margin-top: 20px;
    font-size: 10px;
    color: #64748b;
    line-height: 1.4;
  }

  .terms-title {
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    font-size: 9px;
    margin-bottom: 4px;
  }

  .signature-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 25px;
  }

  .signature-box {
    border: 1px solid #cbd5e1;
    height: 90px;
    border-radius: 4px;
    position: relative;
    text-align: center;
    background-color: #ffffff;
  }

  .signature-label {
    position: absolute;
    bottom: 8px;
    left: 0;
    right: 0;
    font-size: 9.5px;
    color: #64748b;
    font-weight: 600;
  }

  /* Watermark */
  .watermark-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 90px;
    font-weight: 900;
    color: rgba(226, 232, 240, 0.45);
    z-index: -100;
    text-transform: uppercase;
    letter-spacing: 4px;
    pointer-events: none;
    white-space: nowrap;
  }

  /* Page Footer branding */
  .branding-footer {
    position: fixed;
    bottom: -10mm;
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

  .branding-powered {
    font-weight: 600;
  }
`;
