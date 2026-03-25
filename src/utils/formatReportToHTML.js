import { marked } from 'marked'

export function formatReportToHTML(reportText) {
  const html = marked.parse(reportText)

  // Optional: wrap with styling (important for emails)
  return `
    <div style="
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      padding: 16px;
    ">
      ${html}
    </div>
  `
}