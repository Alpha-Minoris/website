import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { CheckCircle } from "lucide-react";

const benefits = [
  "Accelerate AI implementation by 3-6 months",
  "Achieve 3x faster ROI on AI investments",
  "Build sustainable internal AI capabilities",
  "Reduce technology risk and wasted spend",
  "Align AI strategy with business goals",
  "Create competitive advantage through AI"
];

const useCases = [
  {
    title: "SaaS & Technology",
    description: "Leverage AI to enhance product offerings and operational efficiency.",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  },
  {
    title: "E-commerce & Retail",
    description: "Transform customer experience and operations with intelligent automation.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  },
  {
    title: "Financial Services",
    description: "Deploy AI responsibly while meeting regulatory requirements.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
  },
];

export function Benefits() {
  return (
    <section className="py-24 lg:py-40 bg-muted/20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <div className="space-y-10">
            <div className="space-y-5">
              <h2 className="text-3xl md:text-4xl lg:text-5xl">
                Transform with Confidence
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Join innovative organizations that trust us to guide their AI transformation journey 
                and unlock sustainable competitive advantage.
              </p>
            </div>

            <div className="grid gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3.5">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-base">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-xl">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-1/3">
                      <ImageWithFallback
                        src={useCase.image}
                        alt={useCase.title}
                        className="w-full h-32 sm:h-full object-cover"
                      />
                    </div>
                    <div className="sm:w-2/3 p-7">
                      <h3 className="text-xl mb-2.5">{useCase.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
