import { Button } from "./ui/button";
import { Play, BarChart3, Brain, Zap } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { LogoBackground } from "./LogoBackground";

export function Hero() {
  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTestimonials = () => {
    const testimonialsSection = document.getElementById("testimonials");
    if (testimonialsSection) {
      testimonialsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <section className="relative pt-40 pb-32 lg:pt-56 lg:pb-44 bg-gradient-to-b from-background to-muted/20 overflow-hidden">
        <LogoBackground />
        <div className="container mx-auto max-w-5xl px-4 relative z-10">
          <div className="text-center space-y-12 max-w-4xl mx-auto">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1]">
                Kickstart your AI journey
                <br />
                <span className="text-primary">with us!</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Transform your organization with AI through expert guidance, proven frameworks, and strategic support. 
                We help you navigate the AI landscape with clarity and confidence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
              <Button 
                onClick={scrollToContact} 
                size="lg" 
                className="text-lg px-12 py-7 hover:bg-primary-hover transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Zap className="w-5 h-5 mr-2" />
                Book Free Strategy Session
              </Button>
              <Button 
                onClick={scrollToTestimonials} 
                variant="outline" 
                size="lg" 
                className="text-lg px-12 py-7 text-primary border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 hover:-translate-y-0.5"
              >
                <Play className="w-5 h-5 mr-2" />
                View Success Stories
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-10 text-sm text-muted-foreground pt-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2.5"></div>
                No obligation
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2.5"></div>
                Expert guidance
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2.5"></div>
                Proven frameworks
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
