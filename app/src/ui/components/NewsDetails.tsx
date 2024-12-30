import { BookmarksService } from "@/lib/services/bookmarks.service";
import { NewsService } from "@/lib/services/news.service";
import { UserService } from "@/lib/services/user.service";
import { Comment, News } from "@/lib/types/news.type";
import { capitalizeFirstLetter, formatDate } from "@/lib/utils";
import { BookmarkIcon, ThumbsUp } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Header from "./Header";
import toast from "react-hot-toast";

const NewsDetails = () => {
  const navigate = useNavigate();
  const { articleId } = useParams();

  const [article, setArticle] = useState<News | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<News[]>([]);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!articleId) return;

    const newsService = new NewsService();
    (async () => {
      const article = await newsService.getArticleById(articleId);
      setArticle(article);
      setLikeCount(article?.likedBy?.length ?? 0);
      setComments(article?.comments ?? []);

      const user = await new UserService().getCurrentUser();
      if (user) {
        setLiked(article?.likedBy?.some((u) => u.id === user.id) ?? false);
      }

      const relatedArticles = await newsService.getSimilarArticles(articleId);
      setRelatedArticles(relatedArticles.data);
    })();
  }, [articleId]);

  const handleAuthCheck = async () => {
    const userService = new UserService();
    const user = await userService.getCurrentUser();
    if (!user) return navigate("/login");
  };

  const handleCreateBookmark = async (articleId: string) => {
    await handleAuthCheck();
    
    const toastID = toast.loading("Waiting...");

    const bookmarksService = new BookmarksService();
    await bookmarksService.createBookmark({ articleId });

    toast.success("Article bookmarked successfully!", { id: toastID });
  };

  const handleLike = async () => {
    await handleAuthCheck();

    setLiked(!liked);
    setLikeCount((prevCount) => (liked ? prevCount - 1 : prevCount + 1));

    const newsService = new NewsService();
    await newsService.likeArticle(articleId!);

    toast.success("Thanks for liking the article!");
  };

  const handleSubmitComment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await handleAuthCheck();

    if (comment.trim()) {
      const newsService = new NewsService();
      const updatedArticle = await newsService.commentOnArticle(articleId!, {
        content: comment,
      });

      if (updatedArticle) {
        setComments(updatedArticle.comments);
        setComment("");
        toast.success("Comment posted successfully!");
      }
    }
  };

  if (!article) return null;

  return (
    <div className="min-h-screen bg-[#0f1729]">
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Article Content */}
          <div className="lg:w-3/4">
            <article className="bg-[#0f1729] rounded-lg">
              <img
                src={article.imageUrl}
                alt="Quantum Computing"
                className="w-full h-[600px] object-cover rounded-t-lg"
              />
              <div className="p-6 bg-[#0f1729]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-[#4d7cfe]">{capitalizeFirstLetter(article.portal)}</span>
                    <span className="text-gray-400 text-sm">
                      {formatDate(article.publishedAt)}
                    </span>
                    <span className="text-gray-400 text-sm">
                      By {article.author}
                    </span>
                  </div>
                  <button onClick={() => handleCreateBookmark(article.id)}>
                    <BookmarkIcon className="w-5 h-5 text-gray-400 hover:text-[#4d7cfe] cursor-pointer" />
                  </button>
                </div>

                <h1 className="text-2xl font-bold mb-4 text-white">
                  {article.title}
                </h1>

                <div
                  className="prose max-w-none text-gray-300 leading-relaxed *:my-4"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>
            </article>

            {/* Engagement Section */}
            <div className="border-t border-gray-700 pt-8 space-y-6">
              {/* Like Button */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    liked
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  }`}
                >
                  <ThumbsUp size={20} />
                  <span>{likeCount} Likes</span>
                </button>
              </div>

              {/* Comment Form */}
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Post Comment
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                <h3 className="text-xl text-gray-200 font-semibold">
                  Comments
                </h3>
                {comments.length === 0 ? (
                  <p className="text-gray-400">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-4 bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <h4 className="text-gray-200 font-semibold">
                            {comment.user?.name}
                          </h4>
                          <p className="text-gray-400">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Coverage Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-[#0f1729] rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Related Coverage
              </h2>
              <div className="space-y-4">
                {relatedArticles.map((article) => (
                  <div
                    key={article.id}
                    className="border-b border-gray-800 last:border-0 pb-4 last:pb-0"
                  >
                    <Link
                      to={`/news-details/${article.id}`}
                      className="block hover:bg-[#1a2234] rounded-lg transition-colors duration-150 p-2"
                    >
                      <h3 className="font-medium text-gray-200 hover:text-[#4d7cfe] mb-2">
                        {article.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#4d7cfe]">{capitalizeFirstLetter(article.portal)}</span>
                        <span className="text-gray-500">
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>
                    </Link>
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

export default NewsDetails;
