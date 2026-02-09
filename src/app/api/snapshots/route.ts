import { NextRequest, NextResponse } from 'next/server'
import { fetchSnapshots } from '@/lib/wayback'

// Allow up to 30s on Vercel Pro, 10s on free tier
export const maxDuration = 30

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')
  
  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    )
  }
  
  try {
    const snapshots = await fetchSnapshots(url, 30)
    
    return NextResponse.json({ 
      snapshots,
      count: snapshots.length,
      url
    })
  } catch (error) {
    console.error('Error fetching snapshots:', error)
    
    const message = error instanceof Error ? error.message : 'Failed to fetch snapshots'
    
    // Provide helpful error messages
    if (message.includes('timed out') || message.includes('abort') || message.includes('fetch failed')) {
      return NextResponse.json(
        { error: 'The Wayback Machine is responding slowly right now. Please try again in a moment.' },
        { status: 504 }
      )
    }
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
