import { AuthService } from "@/lib/services/auth.service";
import { NewsService } from "@/lib/services/news.service";
import { UserService } from "@/lib/services/user.service";
import { Bookmark, LogOut, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
import Notification from "./Notification";
import { User } from "@/lib/types/user.type";
import { capitalizeFirstLetter } from "@/lib/utils";

const Header = () => {
  const [sections, setSections] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const newsService = new NewsService();
    const userService = new UserService();
    (async () => {
      const sections = await newsService.getSections();
      setSections(sections);

      const user = await userService.getCurrentUser();
      setUser(user);
    })();
  }, []);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    const authService = new AuthService();
    await authService.logout();
    window.location.reload();
  };

  return (
    <header className="border-b border-gray-700 sticky top-0 z-10 bg-gray-900">
      <div className="container mx-auto px-4 py-3">
        <div className="grid grid-cols-3 items-center">
          {/* Left section - Bookmarks */}
          <div className="flex items-center">
            <Link
              to="/bookmarks"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white"
            >
              <Bookmark className="h-5 w-5" />
              <span className="text-sm">Bookmarks</span>
            </Link>
          </div>

          {/* Center section - branding */}
          <Link to="/" className="text-center">
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
          </Link>

          {/* Right section - controls */}
          <div className="flex items-center justify-end space-x-3">
            {user ? (
              <>
                <Notification user={user} />
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white"
              >
                <UserCheck className="h-5 w-5" />
                <span className="text-sm">Login</span>
              </Link>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4">
          <ul className="flex justify-center space-x-6">
            {sections.map((sectionName) => (
              <li key={sectionName}>
                <NavLink
                  to={`/section/${sectionName}`}
                  className={({ isActive }) =>
                    isActive
                      ? "text-gray-300 hover:text-white pb-2 border-b-2 border-blue-500"
                      : "text-gray-300 hover:text-white pb-2 border-b-2 border-transparent hover:border-blue-500"
                  }
                >
                  {capitalizeFirstLetter(sectionName)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
