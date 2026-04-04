import { Link } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState, useRef } from "react";

const navItems = [
  {
    label: "Library",
    hasDropdown: true,
    children: [
      { label: "Hands-on Experiments", to: "/hands-on-experiments" },
      { label: "Virtual Simulations", to: "/demo" },
      { label: "Projectokart", to: "/projects" },
    ],
  },
  {
    label: "Programs",
    hasDropdown: true,
    children: [
      { label: "Teacher Training", to: "/teacher-training" },
      { label: "Workshops", to: "/workshops" },
      { label: "Research Programs", to: "/research" },
    ],
  },
  {
    label: "Events",
    hasDropdown: true,
    children: [
      { label: "Upcoming Events", to: "/events/upcoming" },
      { label: "Past Events", to: "/events/past" },
      { label: "Exhibitions", to: "/exhibitions" },
    ],
  },
  {
    label: "Why CSEEL",
    hasDropdown: true,
    children: [
      { label: "Why CSEEL", to: "/why-cseel" },
      { label: "For Students", to: "/for-students" },
      { label: "For Educators", to: "/for-educators" },
      { label: "For Institutions", to: "/for-institutions" },
    ],
  },
  {
    label: "Resources",
    hasDropdown: true,
    children: [
      { label: "Lab Materials & Kits", to: "/materials" },
      { label: "Blog", to: "/blog" },
      { label: "Lab Safety & Manuals", to: "/safety" },
      { label: "Media Archive", to: "/media-archive" },
      { label: "Help Center", to: "/help" },
    ],
  },
  {
    label: "About",
    hasDropdown: true,
    children: [
      { label: "Our Story", to: "/our-story" },
      { label: "Team", to: "/team" },
      { label: "Careers", to: "/careers" },
      { label: "Contact", to: "/contact-us" },
    ],
  },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isMenuOpen = openDropdown !== null || mobileOpen;

  const handleMouseEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => { setOpenDropdown(null); }, 200);
  };

  const handleClick = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <nav className={`bg-background border-b border-border sticky top-0 transition-all duration-300 w-full z-[400]`}>
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src="/images/logo.png" alt="CSEEL Logo" className="h-10 w-10" />
          <span className="text-xl font-bold text-primary tracking-wide">C.S.E.E.L</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <div key={item.label} className="relative group"
              onMouseEnter={() => handleMouseEnter(item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => handleClick(item.label)}
              >
                {item.label}
                {item.hasDropdown && (
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openDropdown === item.label ? "rotate-180" : ""}`} />
                )}
              </button>

              {item.hasDropdown && openDropdown === item.label && (
                <div
                  className="absolute top-full left-0 bg-background border border-border rounded-lg shadow-xl py-2 min-w-48 z-[410] mt-1"
                  onMouseEnter={() => handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  {item.children?.map((child) => (
                    <Link
                      key={child.label}
                      to={child.to}
                      className="block px-4 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => setOpenDropdown(null)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <Link to="/compare-plans" className="hidden lg:inline-flex items-center px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors text-sm">
          Compare Plans
        </Link>

        <button className="lg:hidden text-foreground p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className={`lg:hidden border-t border-border bg-background absolute top-full left-0 w-full shadow-lg overflow-hidden transition-all duration-500 ease-in-out z-[410] ${mobileOpen ? "max-h-[1000px] opacity-100 visible" : "max-h-0 opacity-0 invisible"}`}>
        <div className="px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <div key={item.label} className="flex flex-col">
              <button
                className="w-full text-left px-2 py-3 text-sm font-medium text-foreground flex items-center justify-between"
                onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
              >
                {item.label}
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${openDropdown === item.label ? "rotate-180" : ""}`} />
              </button>
              <div className={`grid transition-all duration-300 ease-in-out ${openDropdown === item.label ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  {item.children?.map((child) => (
                    <Link
                      key={child.label}
                      to={child.to}
                      className="block px-6 py-2.5 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;