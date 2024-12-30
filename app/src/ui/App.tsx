import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import NewsList from "./components/NewsList";
import NewsDetails from "./components/NewsDetails";
import Bookmarks from "./components/Bookmarks";
import Auth from "./components/Auth";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<NewsList />} />
          <Route
            path="/section/:sectionName"
            element={<NewsList isSection />}
          />
          <Route path="/news-details/:articleId" element={<NewsDetails />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/login" element={<Auth defaultScreen="login" />} />
          <Route path="/signup" element={<Auth defaultScreen="signup" />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <ScrollToTop />
    </>
  );
}

export default App;
