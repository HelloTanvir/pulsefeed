import { createBrowserRouter } from "react-router-dom";
import Home from "./custom-components/Home";
import AuthGuard from "./AuthGuard";
import Detail from "./custom-components/Detail";

const router = createBrowserRouter([
  {
    path: "/",
    // element: <></>,
    // errorElement: <></>,
    children: [
      {
        index: true,
        element: (
          <AuthGuard>
            <Home />
          </AuthGuard>
        ),
      },
      {
        path: "login",
        // element: <Auth />,
        element: <></>,
      },
      {
        path: "register",
        // element: <Auth />,
        element: <></>,
      },
      {
        path: "news/:id",
        element: <Detail />,
        loader: async ({ params }) => {
          //   const { default: Detail } = await import('./custom-components/Detail');
          //   return Detail;
          return params;
        },
      },
    ],
  },
]);

export default router;
