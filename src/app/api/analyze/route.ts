import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url, date1, date2, archiveUrl1, archiveUrl2 } = await request.json()
    
    if (!url || !date1 || !date2) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }
    
    const openaiKey = process.env.OPENAI_API_KEY
    
    if (!openaiKey) {
      // Return demo analysis if no API key
      return NextResponse.json({
        analysis: {
          summary: `Comparing ${url} between ${date1} and ${date2}. AI-powered analysis requires an OpenAI API key.`,
          keyChanges: [
            'Configure OPENAI_API_KEY environment variable for detailed AI analysis',
            'Visual comparison is available in the Compare view above',
            'Use side-by-side, slider, or overlay modes to spot differences'
          ],
          designChanges: ['Visual comparison available without API key'],
          contentChanges: ['Check the archived snapshots directly for content differences'],
          businessInsights: ['Add OPENAI_API_KEY for AI-powered business insights']
        }
      })
    }
    
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      throw new Error('OpenAI API error')
    }

    const data = await response.json()
    const analysis = JSON.parse(data.choices[0]?.message?.content || '{}')
    
    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Error analyzing:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze' },
      { status: 500 }
    )
  }
}
