import { NextRequest, NextResponse } from 'next/server'
import { analysisCache } from '@/lib/cache'

export interface AnalysisResult {
  summary: string;
  keyChanges: string[];
  designChanges: string[];
  contentChanges: string[];
  businessInsights: string[];
  sentiment: {
    earlier: 'professional' | 'playful' | 'minimal' | 'aggressive' | 'corporate' | 'startup';
    later: 'professional' | 'playful' | 'minimal' | 'aggressive' | 'corporate' | 'startup';
    trend: 'more_corporate' | 'more_casual' | 'more_minimal' | 'no_change' | 'complete_rebrand';
  };
  actionableInsights: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { url, date1, date2, archiveUrl1, archiveUrl2 } = await request.json()
    
    if (!url || !date1 || !date2) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Check cache first
    const cacheKey = analysisCache.generateKey(url, date1, date2);
    const cached = analysisCache.get<AnalysisResult>(cacheKey);
    if (cached) {
      console.log('Returning cached analysis for:', cacheKey);
      return NextResponse.json({ 
        analysis: cached,
        cached: true 
      });
    }
    
    const openaiKey = process.env.OPENAI_API_KEY
    
    if (!openaiKey) {
      // Return demo analysis if no API key
      const demoAnalysis = generateDemoAnalysis(url, date1, date2);
      return NextResponse.json({
        analysis: demoAnalysis,
        cached: false
      })
    }
    
    const prompt = `You are a senior UX researcher and web design historian analyzing the evolution of a website.

Website: ${url}
Comparing two archived snapshots:
- Earlier version: ${date1}
- Later version: ${date2}

Archive URLs:
- Earlier: ${archiveUrl1}
- Later: ${archiveUrl2}

Provide a comprehensive, ACTIONABLE analysis. Don't just describe what might have changed — explain WHY these changes matter and what they reveal about the company's strategy.

Return JSON with this exact structure:
{
  "summary": "2-3 sentence executive summary of the most significant evolution",
  
  "keyChanges": [
    "Most impactful change #1 with specific details",
    "Most impactful change #2 with specific details",
    "Most impactful change #3 with specific details",
    "Most impactful change #4 if significant",
    "Most impactful change #5 if significant"
  ],
  
  "designChanges": [
    "Specific visual/UX change and what design trend it follows",
    "Layout change and its likely impact on user behavior",
    "Typography/color changes and what they signal about brand positioning"
  ],
  
  "contentChanges": [
    "How the messaging strategy shifted",
    "Changes in target audience or value proposition",
    "Any notable additions/removals of content types"
  ],
  
  "businessInsights": [
    "What this evolution reveals about company strategy",
    "Market positioning changes indicated by the redesign",
    "What competitors likely influenced these changes"
  ],
  
  "sentiment": {
    "earlier": "one of: professional, playful, minimal, aggressive, corporate, startup",
    "later": "one of: professional, playful, minimal, aggressive, corporate, startup",
    "trend": "one of: more_corporate, more_casual, more_minimal, no_change, complete_rebrand"
  },
  
  "actionableInsights": [
    "Specific lesson other companies could learn from this evolution",
    "Warning sign or success pattern visible in the changes",
    "Prediction about where this brand might go next"
  ]
}

Be specific and insightful. Reference real industry trends and competitor patterns. 
For older dates, consider the web design era (table-based layouts, Flash, Web 2.0 gradients, flat design, etc.).
For the sentiment field, analyze the overall tone and style of each version.`;

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
            content: 'You are a senior UX researcher and web design historian. You provide actionable, specific insights about website evolution. Always return valid JSON.'
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('OpenAI API error')
    }

    const data = await response.json()
    const analysis: AnalysisResult = JSON.parse(data.choices[0]?.message?.content || '{}')
    
    // Cache the result
    analysisCache.set(cacheKey, analysis);
    
    return NextResponse.json({ 
      analysis,
      cached: false
    })
  } catch (error) {
    console.error('Error analyzing:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze' },
      { status: 500 }
    )
  }
}

function generateDemoAnalysis(url: string, date1: string, date2: string): AnalysisResult {
  const years = Math.abs(new Date(date2).getFullYear() - new Date(date1).getFullYear());
  
  return {
    summary: `Comparing ${url} across ${years || 'a few'} years reveals typical web evolution patterns. Visual comparison is available in the Compare view above — for AI-powered deep analysis, configure your OpenAI API key.`,
    keyChanges: [
      'Configure OPENAI_API_KEY environment variable for AI-powered analysis',
      `${years || 'Multiple'} years of design evolution captured in snapshots`,
      'Visual comparison modes available: side-by-side, slider, overlay, and diff',
      'Use the timeline to explore specific time periods'
    ],
    designChanges: [
      'Visual comparison available without API key — try the Slider mode',
      'Look for layout, color, and typography changes across snapshots'
    ],
    contentChanges: [
      'Review archived snapshots directly for content differences',
      'Open snapshots in Wayback Machine for full-page content analysis'
    ],
    businessInsights: [
      'Add OPENAI_API_KEY for AI-powered business and strategy insights',
      'The visual timeline helps spot major redesign milestones'
    ],
    sentiment: {
      earlier: 'professional',
      later: 'professional',
      trend: 'no_change'
    },
    actionableInsights: [
      'Use the Export feature to save your comparison findings',
      'Try comparing oldest vs newest for maximum contrast',
      'Year-over-year comparisons reveal gradual evolution patterns'
    ]
  };
}
