import { Snapshot, CDXResponse } from './types'

// Clean and normalize URL
export function normalizeUrl(url: string): string {
  let normalized = url.trim().toLowerCase()
  
  // Remove protocol
  normalized = normalized.replace(/^https?:\/\//, '')
  
  // Remove www
  normalized = normalized.replace(/^www\./, '')
  
  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '')
  
  return normalized
}

// Format timestamp to human readable date
export function formatTimestamp(timestamp: string): string {
  const year = timestamp.substring(0, 4)
  const month = timestamp.substring(4, 6)
  const day = timestamp.substring(6, 8)
  
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

// Get archive URL for a snapshot
export function getArchiveUrl(timestamp: string, originalUrl: string): string {
  return `https://web.archive.org/web/${timestamp}/${originalUrl}`
}

// Get screenshot URL - uses if_ modifier for raw page (no Wayback toolbar)
// This returns HTML suitable for iframe embedding, not an image
export function getScreenshotUrl(timestamp: string, originalUrl: string): string {
  return `https://web.archive.org/web/${timestamp}if_/${originalUrl}`
}

// Fetch with retry logic for 429 rate limiting
async function fetchWithRetry(url: string, maxRetries: number = 3): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)
    
    let response: Response
    try {
      response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'TimeBack/1.0 (website archive viewer)'
        }
      })
    } catch (err) {
      clearTimeout(timeoutId)
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Wayback Machine API timed out. Please try again.')
      }
      throw err
    } finally {
      clearTimeout(timeoutId)
    }
    
    if (response.status === 429 && attempt < maxRetries) {
      // Wait with exponential backoff: 2s, 4s, 8s
      const waitMs = Math.pow(2, attempt + 1) * 1000
      await new Promise(resolve => setTimeout(resolve, waitMs))
      continue
    }
    
    return response
  }
  
  throw new Error('Wayback Machine is rate-limiting requests. Please try again in a moment.')
}

// Fetch snapshots from CDX API
export async function fetchSnapshots(url: string, limit: number = 50): Promise<Snapshot[]> {
  const normalized = normalizeUrl(url)
  
  // CDX API endpoint — collapse by month (timestamp:6) to reduce results and avoid rate limits
  const cdxUrl = new URL('https://web.archive.org/cdx/search/cdx')
  cdxUrl.searchParams.set('url', normalized)
  cdxUrl.searchParams.set('output', 'json')
  cdxUrl.searchParams.set('limit', limit.toString())
  cdxUrl.searchParams.set('filter', 'statuscode:200') // Only successful captures
  cdxUrl.searchParams.set('collapse', 'timestamp:6') // One per month (YYYYMM) — fewer results, less rate limiting
  cdxUrl.searchParams.set('fl', 'timestamp,original,mimetype,statuscode') // Fields to return
  
  const response = await fetchWithRetry(cdxUrl.toString())
  
  if (!response.ok) {
    throw new Error(`Wayback Machine API error: ${response.status}`)
  }
  
  const data = await response.json() as string[][]
  
  // First row is header, skip it
  if (data.length <= 1) {
    return []
  }
  
  const snapshots: Snapshot[] = data.slice(1).map((row) => {
    const [timestamp, original, mimetype, statuscode] = row
    
    return {
      timestamp,
      date: formatTimestamp(timestamp),
      year: parseInt(timestamp.substring(0, 4)),
      month: parseInt(timestamp.substring(4, 6)),
      day: parseInt(timestamp.substring(6, 8)),
      archiveUrl: getArchiveUrl(timestamp, original),
      screenshotUrl: getScreenshotUrl(timestamp, original),
      statusCode: statuscode,
      mimeType: mimetype,
      originalUrl: original
    }
  })
  
  // Sort by date descending (newest first)
  return snapshots.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

// Group snapshots by year for timeline display
export function groupByYear(snapshots: Snapshot[]): Map<number, Snapshot[]> {
  const groups = new Map<number, Snapshot[]>()
  
  for (const snapshot of snapshots) {
    const year = snapshot.year
    if (!groups.has(year)) {
      groups.set(year, [])
    }
    groups.get(year)!.push(snapshot)
  }
  
  return groups
}
