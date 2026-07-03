export interface HeaderProps {
  documentTitle: string;
  metaFields: Array<{ label: string; value: string }>;
}

export function Header(props: HeaderProps): string {
  const metaRowsHtml = props.metaFields
    .map(
      (f) => `
      <tr>
        <td class="meta-label">${f.label}</td>
        <td class="meta-value">${f.value}</td>
      </tr>
    `
    )
    .join('');

  return `
    <table class="header-table">
      <tr>
        <td class="logo-cell">
          <div class="logo-container">
            <svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 5L10 85H90L50 5Z" fill="#1e3a8a"/>
              <path d="M50 25L25 75H75L50 25Z" fill="#ffffff"/>
              <path d="M50 40L35 70H65L50 40Z" fill="#1e3a8a"/>
            </svg>
            <div class="company-details">
              <div class="company-name">Arcus Groups</div>
              <div>2ND FLOOR, 204/93, RISHIKA, 7th Main Road,</div>
              <div>Benelli Showroom Whitefield, B Narayanapura,</div>
              <div>Bengaluru Urban, Karnataka - 560016</div>
              <div><strong>GSTIN: 29CBWPR3706D1Z7</strong></div>
              <div>Email: arcusgroups.blr@gmail.com</div>
            </div>
          </div>
        </td>
        <td class="title-cell">
          <h1 class="document-title">${props.documentTitle}</h1>
          <table class="meta-grid" align="right">
            ${metaRowsHtml}
          </table>
        </td>
      </tr>
    </table>
  `;
}
