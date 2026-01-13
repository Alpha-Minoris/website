import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Discovery",
    price: "€15k",
    period: "one-time",
    description: "Perfect for organizations exploring AI opportunities",
    features: [
      "2-week engagement",
      "AI opportunity assessment",
      "Use case prioritization",
      "High-level roadmap",
      "Technology landscape review",
      "Executive presentation"
    ],
    isPopular: false,
  },
  {
    name: "Transformation",
    price: "€50k",
    period: "3-month engagement",
    description: "Comprehensive roadmap and implementation support",
    features: [
      "Deep dive assessment",
      "Detailed transformation roadmap",
      "ROI & impact modeling",
      "Technology selection support",
      "Team capability assessment",
      "Change management strategy",
      "Implementation guidance",
      "Monthly progress reviews",
      "Ongoing advisory access"
    ],
    isPopular: true,
  },
  {
    name: "Partnership",
    price: "Custom",
    period: "engagement",
    description: "Long-term strategic partnership for sustained AI success",
    features: [
      "Extended engagement (6-12 months)",
      "Hands-on implementation support",
      "Dedicated senior consultant",
      "Custom capability building",
      "Vendor management support",
      "Continuous optimization",
      "Executive coaching",
      "Team training programs",
      "Flexible scope adjustments",
      "Priority support access"
    ],
    isPopular: false,
  },
];

export function Pricing() {
  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="pricing" className="py-24 lg:py-40">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center space-y-5 mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl">
            Flexible Engagement Models
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Choose the engagement level that matches your AI transformation goals and timeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative transition-all duration-300 rounded-xl ${plan.isPopular ? 'border-primary shadow-xl scale-105 hover:shadow-2xl' : 'border-border/40 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1'}`}>
              {plan.isPopular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary hover:bg-primary shadow-md">
                  <Zap className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl mb-4">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-3xl">
                    {plan.price}
                    {plan.price !== "Custom" && <span className="text-lg text-muted-foreground">/{plan.period}</span>}
                  </div>
                  {plan.price === "Custom" && <div className="text-lg text-muted-foreground">{plan.period}</div>}
                </div>
                <CardDescription className="pt-3">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-7">
                <div className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3.5">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={scrollToContact}
                  className={`w-full ${plan.isPopular ? 'hover:bg-primary-hover shadow-md' : ''} transition-all duration-300`}
                  variant={plan.isPopular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.price === "Custom" ? "Schedule Consultation" : "Get Started"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16 space-y-5">
          <p className="text-muted-foreground">Every engagement includes:</p>
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center space-x-2.5">
              <Check className="w-4 h-4 text-primary" />
              <span>Expert AI consultants</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Check className="w-4 h-4 text-primary" />
              <span>Proven frameworks</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Check className="w-4 h-4 text-primary" />
              <span>Actionable deliverables</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Check className="w-4 h-4 text-primary" />
              <span>Tailored approach</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
