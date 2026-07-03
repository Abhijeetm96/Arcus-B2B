export const PageNumberCSS = `
  @page {
    @bottom-right {
      content: "Page " counter(page) " of " counter(pages);
      font-family: 'Inter', sans-serif;
      font-size: 8px;
      color: #94a3b8;
    }
  }
`;
