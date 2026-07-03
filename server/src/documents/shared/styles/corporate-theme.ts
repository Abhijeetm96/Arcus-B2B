export const corporateTheme = `
  @page {
    size: A4;
    margin: 15mm;
  }
  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
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
  .doc-title {
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
`;
