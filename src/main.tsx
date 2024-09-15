import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Landing } from "./pages/landing.page.tsx";
import { CollabRoom } from "./pages/collabRoom.page.tsx";

const router = createBrowserRouter([
  {
    path: "*",
    element: <Landing />,
  },
  {
    path: "/room/:roomId",
    element: <CollabRoom />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
