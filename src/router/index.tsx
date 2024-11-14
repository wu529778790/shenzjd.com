import { createBrowserRouter, RouteObject } from "react-router-dom";
import App from "@/App";
import Home from "@/views/home/index";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
    ],
  },
];

const router: ReturnType<typeof createBrowserRouter> =
  createBrowserRouter(routes);

export default router;
