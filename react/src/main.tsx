import { createRoot } from "react-dom/client";
import "./index.css";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { Landing } from "./pages/landing.page";
import { CollabRoom } from "./pages/collabRoom.page";


const router = createHashRouter([
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
