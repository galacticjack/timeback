'use client';

interface UseCasesProps {
  onExampleClick?: (url: string) => void;
}

const useCases = [
  {
    icon: '🔍',
    title: 'Competitive Research',
    description: 'Track how competitors evolved their messaging, pricing, and features over time. Spot market trends before they become obvious.',
    example: 'stripe.com',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: '📈',
    title: 'Design Inspiration',
    description: 'Study how top brands refined their design language. Learn from their iterations and avoid their mistakes.',
    example: 'airbnb.com',
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: '📚',
    title: 'Historical Research',
    description: 'Document the evolution of companies, organizations, and cultural phenomena through their web presence.',
    example: 'wikipedia.org',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: '⚖️',
    title: 'Legal & Compliance',
    description: 'Verify historical claims, track policy changes, and document website states for legal proceedings.',
    example: 'terms of service pages',
    color: 'from-purple-500 to-violet-500'
  },
  {
    icon: '🎓',
    title: 'Education & Training',
    description: 'Teach web design evolution, digital marketing trends, and the history of the internet with real examples.',
    example: 'google.com',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: '💼',
    title: 'Due Diligence',
    description: 'Research potential acquisitions, partnerships, or investments by examining their digital footprint over time.',
    example: 'any startup',
    color: 'from-indigo-500 to-purple-500'
  }
];

export function UseCases({ onExampleClick }: UseCasesProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="text-center mb-10 md:mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          What Can You Discover?
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          TimeBack isn&apos;t just nostalgia — it&apos;s a powerful research tool for anyone who needs to understand how the web evolves.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {useCases.map((useCase, index) => (
          <div 
            key={index}
            className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all hover:shadow-lg"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${useCase.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
              {useCase.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {useCase.title}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {useCase.description}
            </p>
            {onExampleClick && useCase.example !== 'any startup' && useCase.example !== 'terms of service pages' && (
              <button
                onClick={() => onExampleClick(useCase.example)}
                className="text-sm text-tb-accent hover:text-gray-900 transition-colors flex items-center gap-1"
              >
                Try {useCase.example}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function Testimonials() {
  const testimonials = [
    {
      quote: "TimeBack completely changed how we do competitive research. We can now see exactly when competitors shifted their strategies.",
      author: "Marketing Director",
      company: "Tech Startup",
      avatar: "👨‍💼"
    },
    {
      quote: "As a designer, seeing how major brands evolved their websites over decades is incredibly valuable for understanding design trends.",
      author: "Senior UX Designer",
      company: "Design Agency",
      avatar: "👩‍🎨"
    },
    {
      quote: "Perfect for our legal team to document historical website states. The comparison feature is exactly what we needed.",
      author: "Legal Counsel",
      company: "Enterprise Corp",
      avatar: "👨‍⚖️"
    }
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="text-center mb-10 md:mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          What People Are Saying
        </h2>
        <p className="text-gray-500">
          Join thousands of researchers, designers, and analysts using TimeBack.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div 
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <div className="text-4xl mb-4">{testimonial.avatar}</div>
            <blockquote className="text-gray-600 mb-4">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <div className="text-sm">
              <div className="font-medium text-gray-900">{testimonial.author}</div>
              <div className="text-gray-400">{testimonial.company}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
          <div className="text-3xl md:text-4xl font-bold text-tb-accent">850B+</div>
          <div className="text-sm text-gray-500 mt-1">Pages Archived</div>
        </div>
        <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
          <div className="text-3xl md:text-4xl font-bold text-tb-accent">25+</div>
          <div className="text-sm text-gray-500 mt-1">Years of History</div>
        </div>
        <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
          <div className="text-3xl md:text-4xl font-bold text-tb-accent">Free</div>
          <div className="text-sm text-gray-500 mt-1">No Signup Required</div>
        </div>
        <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
          <div className="text-3xl md:text-4xl font-bold text-tb-accent">AI</div>
          <div className="text-sm text-gray-500 mt-1">Powered Insights</div>
        </div>
      </div>
    </section>
  );
}
