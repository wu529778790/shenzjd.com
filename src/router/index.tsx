import { createBrowserRouter, RouteObject } from "react-router-dom";
import App from "@/App";
import Home from "@/views/home";
import AddNavigation from "@/views/addNavigation";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "addNavigation",
        element: <AddNavigation />,
      },
    ],
  },
];

const router: ReturnType<typeof createBrowserRouter> =
  createBrowserRouter(routes);

export default router;
