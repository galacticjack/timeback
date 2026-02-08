import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, snapshotCount, dateRange } = await request.json();
    
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      // Return demo insights if no API key
      return NextResponse.json({
        insights: generateDemoInsights(url, snapshotCount, dateRange),
      });
    }
    
    const prompt = `Analyze the evolution of ${url} based on this data:
- Number of archived snapshots: ${snapshotCount}
- Date range: ${new Date(dateRange.oldest).toLocaleDateString()} to ${new Date(dateRange.newest).toLocaleDateString()}

Provide insights about:
1. Likely major redesigns based on the timeline
2. Industry trends this site probably adopted
3. What these changes tell us about the company/product evolution
4. Notable web design patterns from different eras

Keep it concise, insightful, and engaging. Use bullet points where helpful. Maximum 200 words.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a web design historian and digital trends analyst. Provide concise, insightful analysis of website evolution.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });
    
    if (!response.ok) {
      throw new Error('OpenAI API error');
    }
    
    const data = await response.json();
    const insights = data.choices[0]?.message?.content || 'Unable to generate insights.';
    
    return NextResponse.json({ insights });
    
  } catch (error) {
    console.error('Insights API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

function generateDemoInsights(url: string, snapshotCount: number, dateRange: { oldest: string; newest: string }): string {
  const years = Math.round((new Date(dateRange.newest).getTime() - new Date(dateRange.oldest).getTime()) / (365 * 24 * 60 * 60 * 1000));
  
  return `📊 **${url} Evolution Analysis**

Based on ${snapshotCount} snapshots spanning ${years} years:

**Design Eras Detected:**
• Early snapshots likely show classic web 1.0/2.0 design patterns
• Mid-period probably features mobile-responsive redesign
• Recent versions show modern minimalist trends

**Key Observations:**
• ${snapshotCount} archived versions suggest active development
• Multi-year presence indicates established brand
• Frequent updates show commitment to user experience

**Web Design Trends Reflected:**
• Transition from table-based to CSS layouts
• Adoption of responsive design (post-2012)
• Move toward flat design, then subtle gradients
• Recent focus on accessibility and performance

*Note: For detailed AI analysis, configure OpenAI API key.*`;
}
