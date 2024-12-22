import {
  Settings,
  Moon,
  HelpCircle,
  ChevronRight,
  Bookmark,
} from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const categories = [
    "Home",
    "Technology",
    "Business",
    "Science",
    "Health",
    "Entertainment",
    "Sports",
    "World",
  ];

  const newsItems = [
    {
      source: "TechCrunch",
      title: "New Breakthrough in Quantum Computing Announced",
      time: "2 hours ago",
      author: "Sarah Johnson",
      image:
        "https://www.umweltbundesamt.de/sites/default/files/medien/4292/bilder/fotolia_8849224_m_news_0.jpg",
    },
    {
      source: "The Verge",
      title: "Latest Smartphone Release Sets New Industry Standards",
      time: "3 hours ago",
      author: "Mike Chen",
      image:
        "https://www.umweltbundesamt.de/sites/default/files/medien/4292/bilder/fotolia_8849224_m_news_0.jpg",
    },
    {
      source: "Wired",
      title: "AI Development Shows Promising Results in Healthcare",
      time: "4 hours ago",
      author: "Alex Rivera",
      image:
        "https://www.umweltbundesamt.de/sites/default/files/medien/4292/bilder/fotolia_8849224_m_news_0.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="grid grid-cols-3 items-center">
            {/* Left section - Bookmarks */}
            <div className="flex items-center">
              <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white">
                <Bookmark className="h-5 w-5" />
                <span className="text-sm">Bookmarks</span>
              </button>
            </div>

            {/* Center section - branding */}
            <div className="text-center">
              <h1
                className="text-3xl font-bold text-blue-400"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                PulseFeed
              </h1>
              <p
                className="text-xs text-gray-400 mt-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Stay Updated, Stay in the Loop
              </p>
            </div>

            {/* Right section - controls */}
            <div className="flex items-center justify-end space-x-3">
              <button className="p-2 hover:bg-gray-800 rounded-full">
                <Moon className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-full">
                <HelpCircle className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-full">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-4">
            <ul className="flex justify-center space-x-6">
              {categories.map((category) => (
                <li key={category}>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white pb-2 border-b-2 border-transparent hover:border-blue-500"
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* News Feed */}
          <div className="col-span-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              Top Stories
              <ChevronRight className="h-5 w-5 ml-1" />
            </h2>

            <div className="flex flex-col gap-6">
              {newsItems.map((item, index) => (
                <Link to="/news/id" key={index + 1} className="group">
                  <div className="bg-gray-800 rounded-lg overflow-hidden group">
                    <div className="flex relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-48 h-36 object-cover"
                      />
                      <div className="p-4 flex-grow">
                        <div className="text-sm text-blue-400 mb-1">
                          {item.source}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          {item.title}
                        </h3>
                        <div className="text-sm text-gray-400">
                          {item.time} • By {item.author}
                        </div>
                      </div>
                      <button className="absolute top-2 right-2 p-2 bg-gray-900 bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Bookmark className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Picks for you</h2>
              <div className="space-y-4">
                {newsItems.map((item, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-700 pb-4 last:border-0 relative group"
                  >
                    <div className="text-sm text-blue-400 mb-1">
                      {item.source}
                    </div>
                    <h3 className="text-sm font-medium">{item.title}</h3>
                    <div className="text-xs text-gray-400 mt-1">
                      {item.time}
                    </div>
                    <button className="absolute top-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Bookmark className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
