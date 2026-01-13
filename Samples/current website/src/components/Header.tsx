import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import xeleratorLogo from "figma:asset/0be336005f98fd35e59878f9c305d43cacc8aaf3.png";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["features", "pricing", "testimonials", "faq", "contact"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const navItems = [
    { href: "#features", label: "Services" },
    { href: "#pricing", label: "Price" },
    { href: "#testimonials", label: "Success Stories" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <header className="fixed top-5 left-0 right-0 z-50 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-background/80 backdrop-blur-xl border border-border/40 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-2.5">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center group">
                <img 
                  src={xeleratorLogo} 
                  alt="Xelerator" 
                  className="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="text-xl">Xelerator</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.href.substring(1);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2.5 rounded-lg transition-all duration-200 ${ 
                      isActive 
                        ? "text-primary bg-primary/10" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center space-x-3">
              <Button onClick={scrollToContact} className="hover:bg-primary-hover transition-all duration-300 shadow-sm hover:shadow-md">
                Book Consultation
              </Button>
            </div>

            <button
              className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden border-t border-border/40 rounded-b-xl bg-background/80 backdrop-blur-xl">
              <nav className="flex flex-col space-y-2 p-5">
                {navItems.map((item) => {
                  const isActive = activeSection === item.href.substring(1);
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`px-4 py-2.5 rounded-lg transition-all duration-200 ${ 
                        isActive 
                          ? "text-primary bg-primary/10" 
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  );
                })}
                <div className="pt-2">
                  <Button onClick={scrollToContact} className="w-full justify-start hover:bg-primary-hover transition-colors">
                    Book Consultation
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
