import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ClipboardCheck, Map, Rocket } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    step: "Step 1",
    title: "Readiness Check",
    description: "Start with our AI Maturity Assessment to understand where you stand and what's possible.",
  },
  {
    icon: Map,
    step: "Step 2",
    title: "Strategy & Roadmap",
    description: "We work together to design your AI strategy, prioritize use cases, and create a clear roadmap.",
  },
  {
    icon: Rocket,
    step: "Step 3",
    title: "Execution & Check-ins",
    description: "Implement your AI initiatives with us, supported by regular progress reviews and improvements.",
  },
];

export function HowToWorkWithUs() {
  return (
    <section className="py-24 lg:py-40 bg-muted/20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center space-y-5 mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl">
            How to Work With Us
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A simple, clear process that guides you from assessment to implementation with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="border-border/40 hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-xl">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-primary">{step.step}</div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
