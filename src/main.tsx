import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, type RouteObject } from "react-router-dom";

import { ThemeProvider } from "./components/theme-provider.tsx";
import "../app/globals.css";
import { Toaster } from "./components/ui/toaster.tsx";
import CmsPage from "./routes/CmsPage.tsx";
import "./api/client.ts";
import RouteErrorBoundary from "./components/RouteErrorBoundary.tsx";

type PageModule = { default: React.ComponentType };

const lazyPage = (load: () => Promise<PageModule>) => async () => {
  const { default: Component } = await load();
  return { Component };
};

const routes: RouteObject[] = [
  {
    path: "/",
    lazy: lazyPage(() => import("./routes/Home.tsx")),
  },
  {
    path: "/auth",
    lazy: lazyPage(() => import("./routes/Auth.tsx")),
  },
  {
    path: "/auth/google/callback",
    lazy: lazyPage(() => import("./routes/Auth.tsx")),
  },
  {
    path: "/forum",
    lazy: lazyPage(() => import("./routes/forum/Forum.tsx")),
  },
  {
    path: "/forum/create",
    lazy: lazyPage(() => import("./routes/forum/ForumCreate.tsx")),
  },
  {
    path: "/forum/:category",
    lazy: lazyPage(() => import("./routes/forum/ForumCategory.tsx")),
  },
  {
    path: "/forum/:category/:id",
    lazy: lazyPage(() => import("./routes/forum/ForumRead.tsx")),
  },
  {
    path: "/novel/create",
    lazy: lazyPage(() => import("./routes/literature/LiteratureCreate.tsx")),
  },
  {
    path: "/novel/:literatureId/create-chapter",
    lazy: lazyPage(() => import("./routes/literature/ChapterCreate.tsx")),
  },
  {
    path: "/novel/edit/:literatureId",
    lazy: lazyPage(() => import("./routes/literature/LiteratureEdit.tsx")),
  },
  {
    path: "/novel/edit-chapter/:chapterId",
    lazy: lazyPage(() => import("./routes/literature/ChapterEdit.tsx")),
  },
  {
    path: "/novels/category/:genreId",
    lazy: lazyPage(() => import("./routes/literature/LiteratureCategory.tsx")),
  },

  {
    path: "/read/:id",
    lazy: lazyPage(() => import("./routes/literature/LiteratureRead.tsx")),
  },
  {
    path: "/read/:id/:chapterId",
    lazy: lazyPage(() => import("./routes/literature/LiteratureChapter.tsx")),
  },
  {
    path: "/donate/:authorId",
    lazy: lazyPage(() => import("./routes/donation/DonatePage.tsx")),
  },
  {
    path: "/profile/:id",
    lazy: lazyPage(() => import("./routes/Profile.tsx")),
  },
  {
    path: "/profile/edit",
    lazy: lazyPage(() => import("./routes/EditProfile.tsx")),
  },
  {
    path: "/profile/creations",
    lazy: lazyPage(() => import("./routes/profile/MyCreations.tsx")),
  },
  {
    path: "/profile/transactions",
    lazy: lazyPage(() => import("./routes/profile/Transactions.tsx")),
  },
  {
    path: "/library",
    lazy: lazyPage(() => import("./routes/profile/ReaderHub.tsx")),
  },
  {
    path: "/author/dashboard",
    lazy: lazyPage(() => import("./routes/author/AuthorDashboard.tsx")),
  },
  { path: "/terms", element: <CmsPage page="terms" /> },
  { path: "/privacy", element: <CmsPage page="privacy" /> },
  { path: "/credits", element: <CmsPage page="credits" /> },
  {
    path: "*",
    lazy: lazyPage(() => import("./routes/NotFound.tsx")),
  },
];

const router = createBrowserRouter(
  routes.map((route) => ({ ...route, errorElement: <RouteErrorBoundary /> }))
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="typink-theme">
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>
);
