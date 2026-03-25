const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

// Generate an AI report from parsed CSV/Excel data
export async function generateWasteReport(parsedData) {
  const headers = Object.keys(parsedData[0])
  const csvSample = [
    headers.join(','),
    ...parsedData.slice(0, 50).map(row => headers.map(h => row[h]).join(',')),
  ].join('\n')

  const prompt = `You are a senior waste management operations analyst for a Calgary metro waste company.

Analyze this operational data and produce a concise executive intelligence report:

DATA SAMPLE (${parsedData.length} total records):
\`\`\`
${csvSample}
\`\`\`

Structure your report as:
1. EXECUTIVE SUMMARY — 2 sentences max
2. KEY METRICS — 3-4 most important numbers with context
3. OPERATIONAL INSIGHTS — specific findings using actual values
4. RISK FLAGS — patterns needing attention
5. RECOMMENDED ACTIONS — 2-3 concrete next steps for a Calgary ops manager

Be specific, use actual numbers, write for someone who needs to act on this today.`

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.content[0].text
}