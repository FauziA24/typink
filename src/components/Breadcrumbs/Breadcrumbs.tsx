import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { categories } from "../sidebars/LeftBar";

const staticLabels: Record<string, string> = {
  auth: "Login",
  forum: "Forum",
  novel: "Novel",
  novels: "Novels",
  read: "Read",
  category: "Category",
  create: "Create",
  edit: "Edit",
  "create-chapter": "Create Chapter",
  "edit-chapter": "Edit Chapter",
  donate: "Donate",
  profile: "Profile",
  creations: "My Creations",
  transactions: "Transactions",
};

function toTitle(segment: string) {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function labelForSegment(segment: string, segments: string[], index: number) {
  const previous = segments[index - 1];

  if (previous === "category") {
    return categories[Number(segment) - 1] || `Category ${segment}`;
  }

  if (previous === "read" && index === 1) {
    return `Novel ${segment}`;
  }

  if (previous === "read" && index === 2) {
    return `Chapter ${segment}`;
  }

  if (previous === "donate") {
    return "Author";
  }

  if (previous === "forum" && /^\d+$/.test(segment)) {
    return `Topic ${segment}`;
  }

  if (previous === "profile") {
    return "User";
  }

  return staticLabels[segment] || toTitle(segment);
}

function pathForIndex(segments: string[], index: number) {
  return `/${segments.slice(0, index + 1).join("/")}`;
}

function canLinkTo(path: string) {
  return (
    path === "/forum" ||
    /^\/forum\/[^/]+$/.test(path) ||
    /^\/read\/[^/]+$/.test(path) ||
    /^\/novels\/category\/\d+$/.test(path) ||
    /^\/profile\/[^/]+$/.test(path)
  );
}

export default function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-sm text-gray-500">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link
            to="/"
            className="inline-flex items-center gap-1 font-medium text-gray-700 hover:text-black"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </li>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const label = labelForSegment(segment, segments, index);
          const to = pathForIndex(segments, index);
          const isLink = !isLast && canLinkTo(to);

          return (
            <li key={`${segment}-${index}`} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-gray-300" />
              {isLast || !isLink ? (
                <span className="font-medium text-gray-900">{label}</span>
              ) : (
                <Link to={to} className="hover:text-black">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
