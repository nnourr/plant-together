import React from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext"; 
import { Landing } from "./pages/landing.page.tsx";
import { CollabRoom } from "./pages/collabRoom.page.tsx";

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

const App: React.FC = () => {
  return (
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
  );
};

export default App;
