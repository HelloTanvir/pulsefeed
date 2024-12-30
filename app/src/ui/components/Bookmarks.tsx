import { BookmarksService } from "@/lib/services/bookmarks.service";
import { Bookmark } from "@/lib/types/bookmark.type";
import {
  Bookmark as BookmarkIcon,
  Search,
  Trash2,
  Filter,
  Calendar,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";
import Header from "./Header";
import {
  capitalizeFirstLetter,
  formatDate,
  getTimeDifference,
} from "@/lib/utils";
import { Link, useNavigate } from "react-router";
import { UserService } from "@/lib/services/user.service";
import toast from "react-hot-toast";

const Bookmarks = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    const userService = new UserService();
    const bookmarksService = new BookmarksService();
    (async () => {
      const user = await userService.getCurrentUser();
      if (!user) return navigate("/login");

      const _bookmarks = await bookmarksService.getBookmarks();
      setBookmarks(_bookmarks);
    })();
  }, []);

  const handleRemoveBookmark = async (id: string) => {
    const bookmarksService = new BookmarksService();
    await bookmarksService.removeBookmark(id);
    setBookmarks((prevBookmarks) =>
      prevBookmarks.filter((bookmark) => bookmark.id !== id)
    );
    toast.success("Bookmark removed successfully");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      {/* Bookmarks Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Bookmarks Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <BookmarkIcon className="h-6 w-6 text-blue-400" />
            Your Bookmarks
          </h2>

          <div className="flex gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search in bookmarks..."
                className="bg-gray-800 rounded-lg pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            {/* Filter */}
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="space-y-4">
          {bookmarks.map((item) => (
            <div
              key={item.id}
              className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors group"
            >
              <div className="flex gap-4">
                <Link to={`/news-details/${item.article.id}`}>
                  <img
                    src={item.article.imageUrl}
                    alt={item.article.title}
                    className="w-48 h-32 object-cover rounded-lg"
                  />
                </Link>

                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <Link to={`/news-details/${item.article.id}`}>
                      <div>
                        <span className="text-sm text-blue-400">
                          {capitalizeFirstLetter(item.article.portal)}
                        </span>
                        <span className="mx-2 text-gray-500">•</span>
                        <span className="text-sm text-gray-400">
                          {capitalizeFirstLetter(item.article.section)}
                        </span>
                      </div>
                    </Link>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRemoveBookmark(item.id)}
                        className="p-1.5 hover:bg-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  <Link to={`/news-details/${item.article.id}`}>
                    <h3 className="text-lg font-semibold mt-2 mb-3">
                      {item.article.title}
                    </h3>
                  </Link>

                  <Link to={`/news-details/${item.article.id}`}>
                    <div className="flex items-center text-sm text-gray-400 gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {getTimeDifference(item.article.publishedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Bookmarked on {formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (shown when no bookmarks) */}
        {bookmarks.length === 0 && (
          <div className="text-center py-16">
            <BookmarkIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
            <p className="text-gray-400">
              Start saving articles to read them later
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Bookmarks;
