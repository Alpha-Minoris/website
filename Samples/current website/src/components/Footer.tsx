import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Mail, Phone, MapPin, Linkedin, Twitter } from "lucide-react";
import xeleratorLogo from "figma:asset/0be336005f98fd35e59878f9c305d43cacc8aaf3.png";

export function Footer() {
  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-muted/30 border-t border-border/40">
      <div className="container mx-auto max-w-6xl px-4 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div className="space-y-5">
            <div className="flex items-center space-x-2.5">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center">
                <img 
                  src={xeleratorLogo} 
                  alt="Xelerator" 
                  className="w-9 h-9 object-contain"
                />
              </div>
              <span className="text-xl">Xelerator</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Kickstart your AI Journey with us! Strategic AI consulting for organizations getting started with AI.
            </p>
            <div className="flex space-x-3 pt-2">
              <Button variant="ghost" size="icon" className="hover:bg-accent transition-colors rounded-lg">
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-accent transition-colors rounded-lg">
                <Twitter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base">Services</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div><a href="#features" className="hover:text-foreground transition-colors">AI Strategy</a></div>
              <div><a href="#pricing" className="hover:text-foreground transition-colors">Engagements</a></div>
              <div><a href="#" className="hover:text-foreground transition-colors">Roadmap Design</a></div>
              <div><a href="#" className="hover:text-foreground transition-colors">Implementation</a></div>
              <div><a href="#testimonials" className="hover:text-foreground transition-colors">Case Studies</a></div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base">Resources</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div><a href="#" className="hover:text-foreground transition-colors">AI Insights</a></div>
              <div><a href="#" className="hover:text-foreground transition-colors">Getting Started Guide</a></div>
              <div><a href="#" className="hover:text-foreground transition-colors">Frameworks</a></div>
              <div><a href="#" className="hover:text-foreground transition-colors">About Us</a></div>
              <div><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base">Contact</h3>
            <div className="space-y-3.5 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>hello@xelerator.ai</span>
              </div>
              <div 
                className="flex items-center space-x-2.5 cursor-pointer hover:text-foreground transition-colors"
                onClick={scrollToContact}
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>Book a consultation</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Germany</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-10 bg-border/40" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-muted-foreground text-sm">
            © 2025 Xelerator. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
