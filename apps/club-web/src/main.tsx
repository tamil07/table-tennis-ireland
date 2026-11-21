import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { AboutPage, EventArchivePage, NewsPage, NewsPostPage, PoliciesPage } from "./Pages";
import { CalendarPage } from "./CalendarPage";
import "@tti/ui/tailwind.css";
import "./styles.css";

/** Address-based pages for the content moved from the Wix site; everything else is the home page. */
function Route() {
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path === "/news") return <NewsPage />;
  if (path.startsWith("/news/")) return <NewsPostPage slug={decodeURIComponent(path.slice(6))} />;
  if (path === "/events") return <EventArchivePage />;
  if (path === "/calendar") return <CalendarPage />;
  if (path === "/about") return <AboutPage />;
  if (path === "/policies") return <PoliciesPage />;
  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Route />
  </StrictMode>,
);
