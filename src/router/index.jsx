import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import Home from "@/views/home";
import AddNavigation from "@/views/addNavigation";

const router = createBrowserRouter([
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
]);

export default router;
