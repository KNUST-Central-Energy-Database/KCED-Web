import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import nProgress from "nprogress";
import { routeTree } from "./routeTree.gen";
import { AuthProvider } from "@/lib/auth-context";
import "./styles.css";

const router = createRouter({ routeTree });

nProgress.configure({ showSpinner: false });

router.subscribe("onBeforeNavigate", () => {
  nProgress.start();
});

router.subscribe("onLoad", () => {
  nProgress.done();
});

router.subscribe("onResolved", () => {
  nProgress.done();
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
