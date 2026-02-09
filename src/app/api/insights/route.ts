import { NextRequest, NextResponse } from 'next/server';
import { analysisCache } from '@/lib/cache';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { url, snapshotCount, dateRange } = await request.json();
    
    // Check cache
    const cacheKey = `insights:${url}:${dateRange.oldest}:${dateRange.newest}`;
    const cached = analysisCache.get<string>(cacheKey);
    if (cached) {
      return NextResponse.json({
        insights: cached,
        cached: true,
      });
    }
    
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      // Return demo insights if no API key
      return NextResponse.json({
        insights: generateDemoInsights(url, snapshotCount, dateRange),
        cached: false,
      });
    }
    
    const oldestDate = new Date(dateRange.oldest).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const newestDate = new Date(dateRange.newest).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const yearSpan = new Date(dateRange.newest).getFullYear() - new Date(dateRange.oldest).getFullYear();
    
    const prompt = `You are a web design historian and digital strategist analyzing the evolution of ${url}.

DATA:
- Archived snapshots: ${snapshotCount}
- Timeline: ${oldestDate} to ${newestDate} (${yearSpan} years)

Based on this website's history and typical evolution patterns, provide ACTIONABLE insights:

1. **Major Redesign Eras** (estimate 2-4 major redesigns based on the timeline and industry norms)
2. **Design Trend Adoption** (what web design trends this site likely adopted and when)
3. **Business Evolution** (what the design changes reveal about company strategy)
4. **Industry Context** (how this site compares to competitors' evolution)
5. **Key Takeaway** (one actionable insight someone could learn from this evolution)

Format with markdown headers and bullet points. Be specific — reference actual design trends by era:
- Pre-2000: Table layouts, under construction GIFs
- 2000-2006: Flash, gradients, glossy buttons
- 2007-2012: Web 2.0 glossy design, rounded corners
- 2012-2016: Flat design, minimalism, mobile-first
- 2016-2020: Material design, subtle gradients return
- 2020+: Dark mode, glassmorphism, micro-interactions, AI integration

Keep response under 250 words. Focus on insights that are useful, not just descriptive.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a web design historian and digital trends analyst. Provide concise, actionable insights about website evolution. Use markdown formatting for headers and bullets.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });
    
    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      throw new Error('OpenAI API error');
    }
    
    const data = await response.json();
    const insights = data.choices[0]?.message?.content || 'Unable to generate insights.';
    
    // Cache the result
    analysisCache.set(cacheKey, insights);
    
    return NextResponse.json({ 
      insights,
      cached: false,
    });
    
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
  
  return `## 📊 ${url} Evolution Analysis

Based on **${snapshotCount} snapshots** spanning **${years} years**:

### Likely Design Eras
- **Early snapshots**: Classic web 1.0/2.0 design patterns
- **Mid-period**: Mobile-responsive redesign era
- **Recent versions**: Modern minimalist trends

### Key Observations
- ${snapshotCount} archived versions suggest active development
- Multi-year presence indicates established brand
- Frequent updates show commitment to UX

### Web Design Trends Likely Adopted
- Table-based → CSS layouts (early 2000s)
- Responsive design (post-2012)
- Flat design → subtle gradients (2016+)
- Dark mode & accessibility (2020+)

### 💡 Takeaway
Compare oldest vs. newest snapshots in the Compare view to see the full transformation!

---
*Configure OPENAI_API_KEY for detailed AI-powered analysis.*`;
}
