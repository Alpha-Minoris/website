import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";

const faqs = [
  {
    question: "How do you help organizations get started with AI?",
    answer: "We understand the unique challenges organizations face when beginning their AI journey – limited resources, fast growth, and pressure to show ROI quickly. Our frameworks prioritize practical, high-impact AI initiatives that fit your current capabilities and can be implemented effectively."
  },
  {
    question: "What if we don't have AI expertise in-house?",
    answer: "That's exactly why we exist. We work with organizations at all AI maturity levels, from complete beginners to those with some technical capability. Part of our engagement includes capability building so your team can continue the journey independently."
  },
  {
    question: "How long does a typical engagement take?",
    answer: "It depends on your needs. Discovery engagements are 2 weeks, Transformation roadmaps typically take 3 months, and Partnership engagements range from 6-12 months. We always balance thoroughness with the speed your organization requires."
  },
  {
    question: "Do you only provide strategy or also help with implementation?",
    answer: "We do both. While we're strategic advisors first, we provide hands-on implementation support, especially in our Transformation and Partnership engagements. We can work alongside your team or help you select and manage vendors."
  },
  {
    question: "What industries do you work with?",
    answer: "We work across industries with expertise in SaaS, e-commerce, financial services, and B2B technology companies. The key is that your organization has growth ambitions and sees AI as strategic to your success."
  },
  {
    question: "How do you ensure ROI from AI investments?",
    answer: "Every roadmap we build includes detailed ROI modeling tied to your business KPIs. We prioritize initiatives based on expected value, implementation effort, and strategic importance. We also help you establish metrics to measure actual impact."
  },
  {
    question: "What happens after the engagement ends?",
    answer: "You'll have a comprehensive roadmap, frameworks, and team capabilities to continue independently. Many clients start with Discovery, then progress to Transformation, and some choose ongoing Partnership for sustained support."
  },
  {
    question: "Can you help us navigate AI ethics and compliance?",
    answer: "Absolutely. We build governance frameworks covering ethics, bias mitigation, data privacy, and regulatory compliance. This is especially important for regulated industries and companies handling sensitive data."
  }
];

export function FAQ() {
  return (
    <section id="faq" className="pt-24 lg:pt-40 pb-16 lg:pb-20 bg-muted/20">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center space-y-5 mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Everything you need to know about our AI transformation consulting services.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-5">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border border-border/40 rounded-xl px-7 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
              <AccordionTrigger className="text-left hover:no-underline text-base md:text-lg py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
