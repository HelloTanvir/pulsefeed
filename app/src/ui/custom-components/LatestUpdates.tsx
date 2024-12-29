import { NewsQueryParamsDto } from "@/lib/dto/news.dto";
import { NewsService } from "@/lib/services/news.service";
import { News } from "@/lib/types/news.type";
import { getTimeDifference } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

const borderColors = [
  "border-blue-500",
  "border-green-500",
  "border-purple-500",
  "border-yellow-500",
  "border-red-500",
  "border-pink-500",
  "border-indigo-500",
  "border-teal-500",
  "border-cyan-500",
  "border-orange-500",
  "border-lime-500",
  "border-rose-500",
  "border-emerald-500",
  "border-violet-500",
  "border-amber-500",
  "border-fuchsia-500",
  "border-lightBlue-500",
];

const LatestUpdates = () => {
  const [newsItems, setNewsItems] = useState<News[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const newsService = new NewsService();
    (async () => {
      setLoading(true);

      const sections = await newsService.getSections();

      sections.forEach(async (section) => {
        const query: NewsQueryParamsDto = {
          limit: 1,
          section: section,
        };

        const news = await newsService.getArticles(query);

        if (news.data.length > 0) {
          setNewsItems((prev) => {
            const existingIds = prev.map((n) => n.id);
            if (existingIds.includes(news.data[0].id)) return prev;
            return [...prev, news.data[0]];
          });
        }
      });

      setLoading(false);
    })();
  }, []);

  return (
    <div className="w-80">
      <h2 className="text-xl text-gray-200 font-semibold mb-4 flex items-center">
        <RefreshCw size={20} className="mr-2" />
        Latest Updates
        <span className="ml-auto text-xs text-blue-400 font-normal">
          One from each section
        </span>
      </h2>

      <div className="space-y-3">
        {/* Update items with timestamps */}
        {newsItems.map((news, index) => (
          <div
            key={news.id}
            className={`bg-[#1a1f2e] rounded-lg p-3 border-l-4 ${borderColors[index]}`}
          >
            <Link to={`/news-details/${news.id}`}>
              <div className="text-gray-200 font-medium mb-1">
                {news.section}
              </div>
              <p className="text-gray-300 text-sm">{news.title}</p>
              <div className="text-xs text-gray-400 mt-2">
                {getTimeDifference(news.publishedAt)}
              </div>
            </Link>
          </div>
        ))}

        {/* Loading skeleton */}
        {loading && (
          <div className="animate-pulse bg-[#1a1f2e] rounded-lg p-3 border-l-4 border-blue-500">
            <div className="h-4 bg-gray-700 w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-700 w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 w-1/3"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LatestUpdates;
