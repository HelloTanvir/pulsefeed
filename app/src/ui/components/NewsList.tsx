import { NewsService } from "@/lib/services/news.service";
import { News } from "@/lib/types/news.type";
import { Bookmark, CircleCheckBig } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Header from "./Header";
import { NewsQueryParamsDto } from "@/lib/dto/news.dto";
import { capitalizeFirstLetter, formatDate } from "@/lib/utils";
import { UserService } from "@/lib/services/user.service";
import { BookmarksService } from "@/lib/services/bookmarks.service";
import LatestUpdates from "./LatestUpdates";
import toast from "react-hot-toast";
import { User } from "@/lib/types/user.type";

interface Props {
  isSection?: boolean;
}

const NewsList: FC<Props> = ({ isSection = false }) => {
  const navigate = useNavigate();
  const { sectionName } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [newsItems, setNewsItems] = useState<News[]>([]);
  const [newsOffset, setNewsOffset] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const userService = new UserService();
    (async () => {
      const _user = await userService.getCurrentUser();
      setUser(_user);
    })();
  }, []);

  useEffect(() => {
    setNewsOffset(0);

    const newsService = new NewsService();
    (async () => {
      setLoading(true);

      const query: NewsQueryParamsDto = {
        limit: 20,
        offset: 0,
      };

      if (isSection) {
        query.section = sectionName;
      }

      const news = await newsService.getArticles(query);
      setNewsItems(news.data);

      setLoading(false);
    })();
  }, [isSection, sectionName]);

  const handleSubscribe = async () => {
    if (!sectionName) return;
    if (!user) return navigate("/login");

    const userService = new UserService();
    const _user = await userService.subscribeToSection({ name: sectionName });
    setUser(_user);

    toast.success(`Subscribed to ${capitalizeFirstLetter(sectionName)}!`);
  };

  const handleUnsubscribe = async () => {
    if (!sectionName) return;
    if (!user) return navigate("/login");

    const userService = new UserService();
    const _user = await userService.unsubscribeFromSection({
      name: sectionName,
    });
    setUser(_user);

    toast.success(`Unsubscribed from ${capitalizeFirstLetter(sectionName)}!`);
  };

  const handleCreateBookmark = async (articleId: string) => {
    if (!user) return navigate("/login");

    const toastID = toast.loading("Waiting...");

    const bookmarksService = new BookmarksService();
    await bookmarksService.createBookmark({ articleId });

    toast.success("Article bookmarked successfully!", { id: toastID });
  };

  const handlePagination = async () => {
    const newsService = new NewsService();
    setLoading(true);

    const query: NewsQueryParamsDto = {
      limit: 20,
      offset: newsOffset + 20,
    };

    if (isSection) {
      query.section = sectionName;
    }

    const news = await newsService.getArticles(query);

    setNewsItems((prev) => [...prev, ...news.data]);
    setNewsOffset((prev) => prev + 20);

    setLoading(false);
  };

  const getSubscribeOrUnsubscribeButton = () => {
    if (!user || !sectionName) return null;

    if (
      user.subscriptions?.some((s) => s.section === sectionName.toLowerCase())
    ) {
      return (
        <button
          onClick={handleUnsubscribe}
          className="bg-gray-800/50 hover:bg-gray-800 duration-75 border border-gray-700 hover:border-gray-500 text-white px-4 py-2 rounded-lg mb-4 flex items-center gap-2"
        >
          <CircleCheckBig className="h-5 w-5" /> Unsubscribe from{" "}
          {capitalizeFirstLetter(sectionName)}
        </button>
      );
    }

    return (
      <button
        onClick={handleSubscribe}
        className="bg-gray-800/50 hover:bg-gray-800 duration-75 border border-gray-700 hover:border-gray-500 text-white px-4 py-2 rounded-lg mb-4 flex items-center gap-2"
      >
        <CircleCheckBig className="h-5 w-5" /> Subscribe to{" "}
        {capitalizeFirstLetter(sectionName)}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* News Feed */}
          <div className="col-span-8">
            {getSubscribeOrUnsubscribeButton()}

            <div className="flex flex-col gap-6">
              {newsItems.map((item) => (
                <div key={item.id} className="group">
                  <div className="bg-gray-800 rounded-lg overflow-hidden group">
                    <div className="flex relative">
                      <Link to={`/news-details/${item.id}`}>
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-48 h-36 object-cover"
                        />
                      </Link>
                      <Link
                        to={`/news-details/${item.id}`}
                        className="p-4 flex-grow"
                      >
                        <div className="text-sm text-blue-400 mb-1">
                          {capitalizeFirstLetter(item.portal)}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          {item.title}
                        </h3>
                        <div className="text-sm text-gray-400">
                          {formatDate(item.publishedAt)} • By {item.author}
                        </div>
                      </Link>
                      <button
                        onClick={() => handleCreateBookmark(item.id)}
                        className="absolute top-2 right-2 p-2 bg-gray-900 bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Bookmark className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <LatestUpdates key={sectionName} />
        </div>

        {/* pagination */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handlePagination}
            className="bg-gray-800/50 hover:bg-gray-800 duration-75 border border-gray-700 hover:border-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            Load More
            {loading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0c4.418 0 8 3.582 8 8s-3.582 8-8 8v-4a4 4 0 00-4-4H4z"
                ></path>
              </svg>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default NewsList;
