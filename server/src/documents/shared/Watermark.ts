export function Watermark(text: string): string {
  if (!text) return '';
  return `
    <div class="watermark-container">
      ${text}
    </div>
  `;
}
