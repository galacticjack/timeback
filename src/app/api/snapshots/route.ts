import { NextRequest, NextResponse } from 'next/server'
import { fetchSnapshots } from '@/lib/wayback'

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
    const snapshots = await fetchSnapshots(url, 50)
    
    return NextResponse.json({ 
      snapshots,
      count: snapshots.length,
      url
    })
  } catch (error) {
    console.error('Error fetching snapshots:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch snapshots' },
      { status: 500 }
    )
  }
}
