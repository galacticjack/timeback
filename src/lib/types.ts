export interface Snapshot {
  timestamp: string  // YYYYMMDDHHMMSS format from Wayback
  date: string       // Human readable date
  year: number
  month: number
  day: number
  archiveUrl: string // URL to the archived page
  screenshotUrl: string // URL to screenshot (we'll generate this)
  statusCode: string
  mimeType: string
  originalUrl: string
}

export interface CDXResponse {
  // CDX API returns arrays: [urlkey, timestamp, original, mimetype, statuscode, digest, length]
  0: string  // urlkey
  1: string  // timestamp
  2: string  // original url
  3: string  // mimetype
  4: string  // statuscode
  5: string  // digest
  6: string  // length
}

export interface AIAnalysis {
  summary: string
  keyChanges: string[]
  designChanges: string[]
  contentChanges: string[]
  businessInsights: string[]
  sentiment: {
    before: string
    after: string
    shift: string
  }
}
