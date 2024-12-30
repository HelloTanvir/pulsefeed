import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
  return (
    <button
      className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-600 transition-colors"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
};

export default ScrollToTop;
