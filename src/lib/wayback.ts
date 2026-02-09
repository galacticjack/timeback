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

// Get screenshot URL (uses Wayback Machine's built-in screenshot feature)
export function getScreenshotUrl(timestamp: string, originalUrl: string): string {
  // Wayback Machine has a screenshot endpoint
  return `https://web.archive.org/web/${timestamp}im_/${originalUrl}`
}

// Fetch snapshots from CDX API
export async function fetchSnapshots(url: string, limit: number = 100): Promise<Snapshot[]> {
  const normalized = normalizeUrl(url)
  
  // CDX API endpoint
  const cdxUrl = new URL('https://web.archive.org/cdx/search/cdx')
  cdxUrl.searchParams.set('url', normalized)
  cdxUrl.searchParams.set('output', 'json')
  cdxUrl.searchParams.set('limit', limit.toString())
  cdxUrl.searchParams.set('filter', 'statuscode:200') // Only successful captures
  cdxUrl.searchParams.set('collapse', 'timestamp:8') // One per day (first 8 chars = YYYYMMDD)
  cdxUrl.searchParams.set('fl', 'timestamp,original,mimetype,statuscode') // Fields to return
  
  // Add timeout for slow Wayback Machine API
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout
  
  let response: Response
  try {
    response = await fetch(cdxUrl.toString(), { signal: controller.signal })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Wayback Machine API timed out. Please try again.')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
  
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
