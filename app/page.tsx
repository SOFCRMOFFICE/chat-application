import ChatBot from '@/components/ChatBot';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            MTG.in AI Chatbot
          </h1>
          <p className="text-lg text-gray-600">
            Intelligent product discovery and customer support
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Features */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              What can the chatbot do?
            </h2>

            <div className="space-y-3">
              {[
                {
                  title: 'Product Search',
                  desc: 'Find products by name, category, or subject',
                },
                {
                  title: 'Price Information',
                  desc: 'Get accurate pricing from our website',
                },
                {
                  title: 'Product Recommendations',
                  desc: 'Receive personalized product suggestions',
                },
                {
                  title: 'FAQ Answers',
                  desc: 'Get answers to common questions',
                },
              ].map((item, i) => (
                <div key={i} className="bg-white p-4 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Try It Out */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Try it out now!
            </h2>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <p className="text-blue-900 font-semibold mb-4">
                💬 Open the chat widget in the bottom-right corner
              </p>

              <div className="space-y-3 text-sm text-blue-800">
                <p>Example questions you can ask:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>{"What are Class 10 Science books available?"}</li>
                  <li>{"Show me JEE preparation materials"}</li>
                  <li>{"What's the price of NEET guide books?"}</li>
                  <li>{"Recommend books for competitive exams"}</li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900">
                <span className="font-semibold">Note:</span> The chatbot is currently
                running in demo mode. Product data will be populated once the crawler
                is configured with actual MTG.in website data.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Technology Stack
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Frontend',
                items: ['React 19', 'Next.js 16', 'Tailwind CSS'],
              },
              {
                title: 'Backend',
                items: ['Node.js + Express', 'OpenAI API', 'Supabase'],
              },
              {
                title: 'Infrastructure',
                items: ['Vercel (Deployment)', 'pgvector (Embeddings)', 'Playwright (Crawler)'],
              },
            ].map((section, i) => (
              <div key={i}>
                <h3 className="font-semibold text-gray-900 mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item, j) => (
                    <li
                      key={j}
                      className="text-sm text-gray-600 flex items-center before:content-['▸'] before:mr-2"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="mt-12 bg-slate-900 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Getting Started</h2>

          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">1. Set Up Environment Variables</h3>
              <p className="text-slate-300 mb-2">
                Copy `.env.example` to `.env.local` and fill in:
              </p>
              <pre className="bg-slate-800 p-3 rounded text-xs overflow-x-auto">
{`SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_API_URL=http://localhost:3001`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Create Supabase Tables</h3>
              <p className="text-slate-300">
                Run the migration SQL from `backend/migrations/001_create_products_table.sql`
                in your Supabase SQL editor
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Start the Backend</h3>
              <pre className="bg-slate-800 p-3 rounded text-xs">npm run dev:backend</pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Start the Frontend</h3>
              <pre className="bg-slate-800 p-3 rounded text-xs">npm run dev</pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">5. Run the Crawler</h3>
              <p className="text-slate-300 mb-2">
                Once the backend is running, trigger the crawler with:
              </p>
              <pre className="bg-slate-800 p-3 rounded text-xs overflow-x-auto">
{`curl -X POST http://localhost:3001/api/crawler/sync \\
  -H "Authorization: Bearer your_crawler_token"`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot Widget */}
      <ChatBot
        apiUrl={process.env.NEXT_PUBLIC_API_URL}
        appName="MTG.in Assistant"
        brand={{
          color: '#1f2937',
          name: 'MTG.in',
        }}
      />
    </main>
  );
}
