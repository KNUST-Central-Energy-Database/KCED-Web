import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { LogIn } from "iconoir-react";
import { useEffect, useState } from "react";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Sticky header that transitions dynamically. 
        When top, it has no bg or border, text adapts to dark hero content layer.
        When scrolled, it locks into white bg with border.
      */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ${isScrolled
          ? "bg-white shadow-sm text-ink"
          : "bg-transparent text-white"
          }`}
      >
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="flex-1 flex items-center space-x-3">
            <img
              src="/assets/images/knust-logo.png"
              alt="KNUST Crest"
              className="h-11 w-auto md:h-14"
            />
            <h1 className="font-display font-bold md:text-2xl tracking-tight">
              KCED
            </h1>
          </div>

          <nav className="hidden md:flex items-center space-x-10">
            <Link
              to="/blog"
              className={`font-medium transition-colors ${isScrolled ? "hover:text-primary" : "hover:text-white/80"
                }`}
              activeProps={{ className: "text-primary" }}
            >
              Blog
            </Link>
            <Link
              to="/faqs"
              className={`font-medium transition-colors ${isScrolled ? "hover:text-primary" : "hover:text-white/80"
                }`}
              activeProps={{ className: "text-primary" }}
            >
              FAQs
            </Link>
            <Link
              to="/support"
              className={`font-medium transition-colors ${isScrolled ? "hover:text-primary" : "hover:text-white/80"
                }`}
              activeProps={{ className: "text-primary" }}
            >
              Contact Support
            </Link>
          </nav>

          <div className="flex-1 flex justify-end">
            <Link
              to="/login"
              className={`px-4 py-2 rounded-md font-display font-medium transition-colors ${isScrolled
                ? "text-black hover:text-primary/90"
                : "text-white/80 hover:text-white"
                } flex gap-2 items-center`}
            >
              Log in
              <LogIn width={18} height={18} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main viewport frame */}
      <Outlet />
    </>
  );
}