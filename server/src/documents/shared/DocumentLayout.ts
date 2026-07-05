import { CorporateTheme } from './CorporateTheme';
import { Watermark } from './Watermark';
import { Footer } from './Footer';

export interface DocumentLayoutProps {
  title: string;
  watermarkText?: string;
  contentHtml: string;
}

export function DocumentLayout(props: DocumentLayoutProps): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${props.title}</title>
      <style>
        ${CorporateTheme}
      </style>
    </head>
    <body>
      <div class="container">
        ${Watermark(props.watermarkText || '')}
        ${props.contentHtml}
        ${Footer()}
      </div>
    </body>
    </html>
  `;
}
