import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { url, date1, date2, archiveUrl1, archiveUrl2 } = await request.json()
    
    if (!url || !date1 || !date2) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }
    
    // Use GPT-4 to analyze the changes
    const prompt = `You are analyzing the evolution of a website over time. 

Website: ${url}
Comparing two snapshots:
- Earlier version: ${date1}
- Later version: ${date2}

Archive URLs for reference:
- Earlier: ${archiveUrl1}
- Later: ${archiveUrl2}

Based on typical website evolution patterns and the time gap between these dates, provide a detailed analysis:

1. **Summary**: A 2-3 sentence overview of likely changes between these dates
2. **Key Changes**: 3-5 bullet points of the most significant likely changes
3. **Design Evolution**: Any likely visual/UX changes (layout, colors, typography)
4. **Content Shifts**: How the messaging or content likely evolved
5. **Business Insights**: What these changes might indicate about the company's strategy

Format your response as JSON with this structure:
{
  "summary": "string",
  "keyChanges": ["string", "string", ...],
  "designChanges": ["string", ...],
  "contentChanges": ["string", ...],
  "businessInsights": ["string", ...]
}

Be specific and insightful. Consider industry context and typical patterns of website evolution.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1000
    })
    
    const analysis = JSON.parse(completion.choices[0].message.content || '{}')
    
    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Error analyzing:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze' },
      { status: 500 }
    )
  }
}
