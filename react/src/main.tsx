import { createRoot } from "react-dom/client";
import "./index.css";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { Landing } from "./pages/landing.page";
import { CollabRoom } from "./pages/collabRoom.page";
import { Signup } from "./pages/signup.page";
import { Login } from "./pages/login.page";

import { UserContextProvider } from "./components/user.context";
import { PostHogProvider } from "posthog-js/react";
import Clarity from "@microsoft/clarity";

const POSTHOG_API_HOST = import.meta.env.VITE_POSTHOG_HOST;
const POSTHOG_API_KEY = import.meta.env.VITE_POSTHOG_KEY;
const CLARITY_PROJECT_ID = import.meta.env.VITE_CLARITY_PROJECT_ID;

let options;

if (POSTHOG_API_HOST) {
  options = {
    api_host: POSTHOG_API_HOST,
  };
}

if (CLARITY_PROJECT_ID) {
  Clarity.init(CLARITY_PROJECT_ID);
}

const router = createHashRouter([
  {
    path: "*",
    element: <Landing />,
  },
  {
    path: "/room/:roomName",
    element: <CollabRoom />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  }
]);

createRoot(document.getElementById("root")!).render(
  <>
    {options ? (
      <PostHogProvider apiKey={POSTHOG_API_KEY} options={options}>
        <UserContextProvider>
          <RouterProvider router={router} />
        </UserContextProvider>
      </PostHogProvider>
    ) : (
      <UserContextProvider>
        <RouterProvider router={router} />
      </UserContextProvider>
    )}
  </>
);
