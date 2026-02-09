// Interesting facts about websites to show during loading
// Used to keep users engaged during AI analysis

export interface WebsiteFact {
  domain: string;
  fact: string;
  year?: number;
  category: 'history' | 'design' | 'tech' | 'business' | 'fun';
}

// Domain-specific facts (matched by domain pattern)
const domainFacts: Record<string, WebsiteFact[]> = {
  'apple.com': [
    { domain: 'apple.com', fact: "Apple's first website (1996) featured a galaxy theme with stars and planets", year: 1996, category: 'history' },
    { domain: 'apple.com', fact: "The iconic 'Think Different' campaign influenced Apple's web design for years", category: 'design' },
    { domain: 'apple.com', fact: "Apple pioneered full-bleed product photography on the web", category: 'design' },
    { domain: 'apple.com', fact: "Apple.com processes more traffic during iPhone launches than most sites see in a year", category: 'tech' },
  ],
  'google.com': [
    { domain: 'google.com', fact: "Google's homepage has barely changed since 1999 — intentionally minimal", category: 'design' },
    { domain: 'google.com', fact: "The famous 'I'm Feeling Lucky' button costs Google ~$110M/year in lost ad revenue", category: 'business' },
    { domain: 'google.com', fact: "Google tested 41 shades of blue for their link color in 2009", category: 'design' },
    { domain: 'google.com', fact: "Google's first server was built with LEGO bricks", year: 1998, category: 'fun' },
  ],
  'amazon.com': [
    { domain: 'amazon.com', fact: "Amazon started as 'Cadabra' but changed due to confusion with 'cadaver'", year: 1994, category: 'history' },
    { domain: 'amazon.com', fact: "Amazon.com only sold books for the first 3 years of operation", category: 'history' },
    { domain: 'amazon.com', fact: "Every 100ms of latency costs Amazon 1% in sales", category: 'business' },
    { domain: 'amazon.com', fact: "Amazon's 1-Click patent was so valuable, Apple licensed it", category: 'tech' },
  ],
  'twitter.com': [
    { domain: 'twitter.com', fact: "Twitter's original name was 'twttr' — vowels were dropped to match Flickr's style", year: 2006, category: 'history' },
    { domain: 'twitter.com', fact: "The 140-character limit came from SMS constraints (160 chars minus username)", category: 'tech' },
    { domain: 'twitter.com', fact: "The fail whale became an iconic part of Twitter's early identity", category: 'design' },
    { domain: 'twitter.com', fact: "Twitter's bird logo is named 'Larry' after Larry Bird", category: 'fun' },
  ],
  'facebook.com': [
    { domain: 'facebook.com', fact: "Facebook was originally 'thefacebook.com' — the 'the' was dropped in 2005", year: 2004, category: 'history' },
    { domain: 'facebook.com', fact: "Facebook's signature blue color was chosen because Zuckerberg is red-green colorblind", category: 'design' },
    { domain: 'facebook.com', fact: "The like button was almost called 'Awesome' button", category: 'design' },
    { domain: 'facebook.com', fact: "Facebook.com cost $200,000 when purchased from AboutFace Corp", year: 2005, category: 'business' },
  ],
  'youtube.com': [
    { domain: 'youtube.com', fact: "YouTube's first video 'Me at the zoo' is still up and has 280M+ views", year: 2005, category: 'history' },
    { domain: 'youtube.com', fact: "YouTube was almost an online dating site called 'Tune In Hook Up'", category: 'history' },
    { domain: 'youtube.com', fact: "Google bought YouTube for $1.65B just 18 months after it launched", year: 2006, category: 'business' },
    { domain: 'youtube.com', fact: "YouTube's design evolution mirrors the shift from user-generated chaos to professional content", category: 'design' },
  ],
  'netflix.com': [
    { domain: 'netflix.com', fact: "Netflix started as a DVD-by-mail service — the first website showed DVD covers", year: 1998, category: 'history' },
    { domain: 'netflix.com', fact: "Netflix's recommendation algorithm is worth an estimated $1B/year in retention", category: 'tech' },
    { domain: 'netflix.com', fact: "The red-and-black color scheme has remained consistent for over 20 years", category: 'design' },
    { domain: 'netflix.com', fact: "Netflix offered to sell to Blockbuster for $50M in 2000. They declined.", year: 2000, category: 'business' },
  ],
};

// Generic facts for any website
const genericFacts: WebsiteFact[] = [
  { domain: 'generic', fact: "The first website ever created (1991) is still online at info.cern.ch", year: 1991, category: 'history' },
  { domain: 'generic', fact: "The Wayback Machine has archived over 835 billion web pages since 1996", category: 'history' },
  { domain: 'generic', fact: "In 1996, there were only 100,000 websites. Today there are over 1.8 billion", category: 'history' },
  { domain: 'generic', fact: "Web design trends cycle roughly every 10-15 years (flat design is back!)", category: 'design' },
  { domain: 'generic', fact: "The average website redesigns every 2-3 years", category: 'design' },
  { domain: 'generic', fact: "CSS didn't become widespread until the early 2000s — before that, tables ruled", category: 'tech' },
  { domain: 'generic', fact: "Flash content from 2000-2015 is largely lost to history as browsers dropped support", category: 'tech' },
  { domain: 'generic', fact: "The hamburger menu icon was designed at Xerox in 1981 — decades before smartphones", category: 'design' },
  { domain: 'generic', fact: "Comic Sans was released in 1994 and immediately became the most loved/hated font", category: 'design' },
  { domain: 'generic', fact: "The blink tag and marquee were so overused, they became HTML's running jokes", category: 'fun' },
  { domain: 'generic', fact: "Under construction GIFs were so common in the 90s, they're now nostalgic art", category: 'fun' },
  { domain: 'generic', fact: "Site visitor counters were essential in the 90s — everyone wanted to show their traffic", category: 'history' },
  { domain: 'generic', fact: "The 'fold' (visible area without scrolling) used to be sacred — now we scroll endlessly", category: 'design' },
  { domain: 'generic', fact: "Responsive design only became standard after 2010 with mobile traffic growth", category: 'tech' },
  { domain: 'generic', fact: "The first banner ad (1994) had a 44% click-through rate. Today's average is 0.05%", year: 1994, category: 'business' },
  { domain: 'generic', fact: "Internet Archive stores 99 petabytes of data — that's 99 million gigabytes", category: 'tech' },
  { domain: 'generic', fact: "Web brutalism (intentionally ugly design) became trendy around 2014 as a reaction to polished UX", category: 'design' },
  { domain: 'generic', fact: "Skeuomorphism (realistic textures) dominated 2007-2013, then flat design took over", category: 'design' },
];

// Get facts for a specific domain or generic facts
export function getFactsForDomain(domain: string): WebsiteFact[] {
  // Clean domain
  const cleanDomain = domain.toLowerCase().replace(/^www\./, '');
  
  // Check for exact match first
  if (domainFacts[cleanDomain]) {
    return [...domainFacts[cleanDomain], ...genericFacts];
  }
  
  // Check for partial match
  for (const key of Object.keys(domainFacts)) {
    if (cleanDomain.includes(key) || key.includes(cleanDomain)) {
      return [...domainFacts[key], ...genericFacts];
    }
  }
  
  return genericFacts;
}

// Get a random fact for a domain
export function getRandomFact(domain: string): WebsiteFact {
  const facts = getFactsForDomain(domain);
  return facts[Math.floor(Math.random() * facts.length)];
}

// Get a rotating fact (cycles through all available facts)
export function* factGenerator(domain: string): Generator<WebsiteFact> {
  const facts = getFactsForDomain(domain);
  let index = 0;
  
  // Shuffle facts
  const shuffled = [...facts].sort(() => Math.random() - 0.5);
  
  while (true) {
    yield shuffled[index % shuffled.length];
    index++;
  }
}
