export interface SignatureBlockProps {
  companyName: string;
  signatureImage?: string;
  signerName?: string;
  signerRole?: string;
}

export function SignatureBlock(props: SignatureBlockProps): string {
  return `
    <div class="signature-box">
      ${
        props.signatureImage
          ? `<img src="${props.signatureImage}" style="max-height: 50px; max-width: 150px; margin-top: 10px;" alt="Signature" />`
          : ''
      }
      ${
        props.signerName
          ? `<div style="font-weight: bold; margin-top: 5px; color: #0f172a;">${props.signerName}</div>`
          : ''
      }
      ${
        props.signerRole
          ? `<div style="font-size: 8.5px; color: #64748b;">${props.signerRole}</div>`
          : ''
      }
      <div class="signature-label">Authorized Signatory for ${props.companyName}</div>
    </div>
  `;
}
