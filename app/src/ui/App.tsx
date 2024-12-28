import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NewsList from "./custom-components/NewsList";
import NewsDetails from "./custom-components/NewsDetails";
import Bookmarks from "./custom-components/Bookmarks";
import Auth from "./custom-components/Auth";

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
      <Toaster />
    </>
  );
}

export default App;
