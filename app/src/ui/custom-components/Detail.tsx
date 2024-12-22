import { BookmarkIcon, MoonIcon, HelpCircleIcon, Settings } from 'lucide-react';

const DarkArticleDetail = () => {
  // Sample article data
  const mainArticle = {
    title: "New Breakthrough in Quantum Computing Announced",
    source: "TechCrunch",
    author: "Sarah Johnson",
    publishedAt: "2 hours ago",
    content: `Scientists at the Quantum Research Institute have announced a major breakthrough 
    in quantum computing stability. The new technique, dubbed "coherent state preservation," 
    allows qubits to maintain their quantum state for significantly longer periods than 
    previously possible.

    This development marks a significant step forward in the field of quantum computing, 
    potentially bringing us closer to practical quantum computers that could revolutionize 
    fields from cryptography to drug discovery.
    
    The research team, led by Dr. Emily Chen, spent three years developing this new approach. 
    "What makes this breakthrough particularly exciting is its potential scalability," 
    explains Dr. Chen. "Previous methods for maintaining qubit stability were difficult 
    to implement at scale, but our new technique shows promising results even in 
    larger quantum systems."`,
    imageUrl: "https://www.umweltbundesamt.de/sites/default/files/medien/4292/bilder/fotolia_8849224_m_news_0.jpg"
  };

  const relatedArticles = [
    {
      title: "Quantum Computing Milestone Achieved by Research Team",
      source: "BBC News",
      time: "3 hours ago"
    },
    {
      title: "Major Step Forward in Quantum Computing Development",
      source: "CNN",
      time: "4 hours ago"
    },
    {
      title: "New Quantum Computing Method Shows Promise",
      source: "Reuters",
      time: "5 hours ago"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f1729]">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-800 bg-[#0f1729]">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <BookmarkIcon className="w-5 h-5 text-gray-400" />
            
            {/* Centered Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
              <h1 className="text-2xl font-bold text-[#4d7cfe]">PulseFeed</h1>
              <p className="text-xs text-gray-400">Stay Updated, Stay in the Loop</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <MoonIcon className="w-5 h-5 text-gray-400" />
              <HelpCircleIcon className="w-5 h-5 text-gray-400" />
              <Settings className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-white">Home</a>
            <a href="#" className="text-gray-400 hover:text-white">Technology</a>
            <a href="#" className="text-gray-400 hover:text-white">Business</a>
            <a href="#" className="text-gray-400 hover:text-white">Science</a>
            <a href="#" className="text-gray-400 hover:text-white">Health</a>
            <a href="#" className="text-gray-400 hover:text-white">Entertainment</a>
            <a href="#" className="text-gray-400 hover:text-white">Sports</a>
            <a href="#" className="text-gray-400 hover:text-white">World</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Article Content */}
          <div className="lg:w-3/4">
            <article className="bg-[#0f1729] rounded-lg">
              <img
                src={mainArticle.imageUrl}
                alt="Quantum Computing"
                className="w-full h-64 object-cover rounded-t-lg"
              />
              <div className="p-6 bg-[#0f1729]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-[#4d7cfe]">{mainArticle.source}</span>
                    <span className="text-gray-400 text-sm">{mainArticle.publishedAt}</span>
                    <span className="text-gray-400 text-sm">By {mainArticle.author}</span>
                  </div>
                  <BookmarkIcon className="w-5 h-5 text-gray-400 hover:text-[#4d7cfe] cursor-pointer" />
                </div>
                
                <h1 className="text-2xl font-bold mb-6 text-white">{mainArticle.title}</h1>
                
                <div className="prose max-w-none">
                  {mainArticle.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-300 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </article>
          </div>

          {/* Related Coverage Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-[#0f1729] rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4 text-white">Related Coverage</h2>
              <div className="space-y-4">
                {relatedArticles.map((article, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-800 last:border-0 pb-4 last:pb-0"
                  >
                    <a href="#" className="block hover:bg-[#1a2234] rounded-lg transition-colors duration-150 p-2">
                      <h3 className="font-medium text-gray-200 hover:text-[#4d7cfe] mb-2">
                        {article.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#4d7cfe]">{article.source}</span>
                        <span className="text-gray-500">{article.time}</span>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkArticleDetail;