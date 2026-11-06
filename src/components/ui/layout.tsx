import Navbar from "../navbar/Navbar";
import LeftBar from "../sidebars/LeftBar";
import RightBar from "../sidebars/RightBar";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";

export default function Layout({
  children,
  leftBar = true,
  rightBar = true,
  sticky = false,
  showBreadcrumbs = true,
}: {
  children: React.ReactNode;
  leftBar?: boolean;
  rightBar?: boolean;
  sticky?: boolean;
  showBreadcrumbs?: boolean;
}) {
  const contentGrid = leftBar && rightBar
    ? "lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_260px]"
    : leftBar
      ? "lg:grid-cols-[220px_minmax(0,1fr)]"
      : rightBar
        ? "xl:grid-cols-[minmax(0,1fr)_260px]"
        : "grid-cols-1";

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[1366px] px-3 sm:px-4">
      <Navbar sticky={sticky} />
      <div className={`relative grid w-full gap-4 py-6 ${contentGrid}`}>
        {leftBar && (
          <aside className="hidden min-w-0 lg:block">
            <LeftBar />
          </aside>
        )}
        <main className="min-w-0 w-full">
          {showBreadcrumbs && <Breadcrumbs />}
          {children}
        </main>
        {rightBar && (
          <aside className="sticky top-20 hidden min-w-0 self-start p-2 xl:block">
            <RightBar />
          </aside>
        )}
      </div>
    </div>
  );
}
