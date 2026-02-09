// Client-side Wayback Machine CDX API fetch
// Bypasses Vercel's serverless function timeout by fetching directly from browser

import { Snapshot } from './types'

export function normalizeUrl(url: string): string {
  let normalized = url.trim().toLowerCase()
  normalized = normalized.replace(/^https?:\/\//, '')
  normalized = normalized.replace(/^www\./, '')
  normalized = normalized.replace(/\/$/, '')
  return normalized
}

export function formatTimestamp(timestamp: string): string {
  const year = timestamp.substring(0, 4)
  const month = timestamp.substring(4, 6)
  const day = timestamp.substring(6, 8)
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function getArchiveUrl(timestamp: string, originalUrl: string): string {
  return `https://web.archive.org/web/${timestamp}/${originalUrl}`
}

export function getScreenshotUrl(timestamp: string, originalUrl: string): string {
  return `https://web.archive.org/web/${timestamp}if_/${originalUrl}`
}

export async function fetchSnapshotsClient(url: string, limit: number = 30): Promise<Snapshot[]> {
  const normalized = normalizeUrl(url)
  
  // Use our Next.js rewrite proxy to avoid CORS issues
  // /api/cdx/ proxies to web.archive.org/cdx/search/
  const cdxUrl = new URL('/api/cdx/cdx', window.location.origin)
  cdxUrl.searchParams.set('url', normalized)
  cdxUrl.searchParams.set('output', 'json')
  cdxUrl.searchParams.set('limit', limit.toString())
  cdxUrl.searchParams.set('filter', 'statuscode:200')
  cdxUrl.searchParams.set('collapse', 'timestamp:6')
  cdxUrl.searchParams.set('fl', 'timestamp,original,mimetype,statuscode')
  
  const controller = new AbortController()
  // 45s timeout for client-side (no serverless limit)
  const timeoutId = setTimeout(() => controller.abort(), 45000)
  
  try {
    const response = await fetch(cdxUrl.toString(), {
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('The Wayback Machine is rate-limiting requests. Please wait a moment and try again.')
      }
      throw new Error(`Wayback Machine API error: ${response.status}`)
    }
    
    const data = await response.json() as string[][]
    
    if (data.length <= 1) {
      return []
    }
    
    const snapshots: Snapshot[] = data.slice(1).map((row) => {
      const [timestamp, original] = row
      
      return {
        timestamp,
        date: formatTimestamp(timestamp),
        year: parseInt(timestamp.substring(0, 4)),
        month: parseInt(timestamp.substring(4, 6)),
        day: parseInt(timestamp.substring(6, 8)),
        archiveUrl: getArchiveUrl(timestamp, original),
        screenshotUrl: getScreenshotUrl(timestamp, original),
        statusCode: row[3],
        mimeType: row[2],
        originalUrl: original
      }
    })
    
    return snapshots.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('The Wayback Machine is responding very slowly. Please try again in a moment.')
    }
    throw err
  }
}
