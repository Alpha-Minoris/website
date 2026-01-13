import { Star } from "lucide-react@0.487.0";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Testimonial {
  id: number;
  rating: number;
  text: string;
  author: string;
  role: string;
  company: string;
  logo: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    rating: 5,
    text: "Xelerator's approach to AI transformation was exactly what we needed. They didn't just provide technology recommendations - they created a comprehensive roadmap that aligned with our business goals and ensured successful implementation across our organization.",
    author: "Sarah Chen",
    role: "CTO",
    company: "TechVision Inc",
    logo: "https://images.unsplash.com/photo-1665360786492-ace5845fe817?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwc3RhcnR1cCUyMGNvbXBhbnl8ZW58MXx8fHwxNzYxMTE3NTY3fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 2,
    rating: 5,
    text: "The team's expertise in both AI technology and business strategy was invaluable. They helped us identify high-impact opportunities and built a practical implementation plan that delivered results within months, not years.",
    author: "Michael Rodriguez",
    role: "Head of Innovation",
    company: "GlobalFinance Corp",
    logo: "https://images.unsplash.com/photo-1535448674466-81707cbfe0f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNlJTIwY29ycG9yYXRlJTIwYnVzaW5lc3N8ZW58MXx8fHwxNzYxMTE3NTY4fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 3,
    rating: 5,
    text: "Working with Xelerator transformed how we think about AI. Their strategic guidance helped us move from confusion to clarity, and their roadmap gave us the confidence to invest in AI initiatives that are now driving significant competitive advantages.",
    author: "Emily Watson",
    role: "VP of Operations",
    company: "InnovateRetail",
    logo: "https://images.unsplash.com/photo-1637393933151-d37306ed606d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBidWlsZGluZyUyMG1vZGVybnxlbnwxfHx8fDE3NjExMTc1Njd8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 4,
    rating: 5,
    text: "Outstanding consulting experience from start to finish. Xelerator took time to understand our unique challenges and delivered a customized AI strategy that perfectly balanced ambition with practicality. Their ongoing support has been exceptional.",
    author: "David Park",
    role: "Chief Digital Officer",
    company: "MedTech Solutions",
    logo: "https://images.unsplash.com/photo-1589979034086-5885b60c8f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG9mZmljZSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NjEwMjc0MTR8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 5,
    rating: 5,
    text: "The clarity and actionability of the AI roadmap Xelerator created for us was impressive. Every recommendation was backed by solid business reasoning, and the implementation guidance made it easy for our teams to execute successfully.",
    author: "Jennifer Liu",
    role: "Director of Strategy",
    company: "NextGen Consulting",
    logo: "https://images.unsplash.com/photo-1758518725921-1eb74ed293be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdWx0aW5nJTIwcHJvZmVzc2lvbmFsJTIwb2ZmaWNlfGVufDF8fHx8MTc2MTExNzU2OHww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 6,
    rating: 5,
    text: "Xelerator helped us navigate the complex landscape of AI technologies and identify the right solutions for our specific needs. Their pragmatic approach and deep expertise accelerated our AI journey by at least 18 months.",
    author: "Robert Thompson",
    role: "VP of Technology",
    company: "DataFlow Systems",
    logo: "https://images.unsplash.com/photo-1722159475028-d38e511f7853?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29tcGFueSUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NjExMTc1Njh8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 7,
    rating: 5,
    text: "The ROI from working with Xelerator exceeded our expectations. Their structured approach to AI transformation helped us prioritize initiatives that delivered quick wins while building toward long-term strategic objectives.",
    author: "Amanda Foster",
    role: "COO",
    company: "CloudScale Partners",
    logo: "https://images.unsplash.com/photo-1665360786492-ace5845fe817?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwc3RhcnR1cCUyMGNvbXBhbnl8ZW58MXx8fHwxNzYxMTE3NTY3fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 8,
    rating: 5,
    text: "What impressed us most was Xelerator's ability to translate complex AI concepts into actionable business strategies. They bridged the gap between our technical teams and business leadership perfectly.",
    author: "Thomas Weber",
    role: "Managing Director",
    company: "Enterprise Solutions AG",
    logo: "https://images.unsplash.com/photo-1535448674466-81707cbfe0f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNlJTIwY29ycG9yYXRlJTIwYnVzaW5lc3N8ZW58MXx8fHwxNzYxMTE3NTY4fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 9,
    rating: 5,
    text: "Xelerator's consulting transformed our AI ambitions into reality. Their strategic roadmap provided the clarity and confidence we needed to secure executive buy-in and launch initiatives that are now core to our competitive strategy.",
    author: "Lisa Martinez",
    role: "Chief Strategy Officer",
    company: "InnovateLabs",
    logo: "https://images.unsplash.com/photo-1637393933151-d37306ed606d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBidWlsZGluZyUyMG1vZGVybnxlbnwxfHx8fDE3NjExMTc1Njd8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 10,
    rating: 5,
    text: "The value Xelerator brought to our organization was exceptional. From initial assessment to implementation support, their team demonstrated deep expertise and genuine commitment to our success with AI transformation.",
    author: "Patrick O'Neill",
    role: "Head of Digital Transformation",
    company: "FutureForward Inc",
    logo: "https://images.unsplash.com/photo-1589979034086-5885b60c8f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG9mZmljZSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NjEwMjc0MTR8MA&ixlib=rb-4.1.0&q=80&w=1080"
  }
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="w-[400px] h-[280px] border-border/40 rounded-xl flex-shrink-0 mx-3">
      <CardContent className="p-6 h-full flex flex-col justify-between">
        <div className="space-y-4">
          {/* Star Rating */}
          <div className="flex gap-1">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>

          {/* Testimonial Text */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
            {testimonial.text}
          </p>
        </div>

        {/* Author Info */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <div>
            <div className="text-sm">{testimonial.author}</div>
            <div className="text-xs text-muted-foreground">
              {testimonial.role} - {testimonial.company}
            </div>
          </div>
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <ImageWithFallback
              src={testimonial.logo}
              alt={testimonial.company}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AutoScrollTestimonials() {
  // Split testimonials into two rows
  const row1 = [...testimonials.slice(0, 5), ...testimonials.slice(0, 5), ...testimonials.slice(0, 5)];
  const row2 = [...testimonials.slice(5, 10), ...testimonials.slice(5, 10), ...testimonials.slice(5, 10)];

  return (
    <section className="py-24 lg:py-40 bg-muted/20 overflow-hidden">
      <div className="container mx-auto max-w-6xl px-4 mb-16">
        <div className="text-center space-y-5">
          <h2 className="text-3xl md:text-4xl lg:text-5xl">
            Trusted by Forward-Thinking Organizations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Hear from leaders who have transformed their organizations with our AI consulting services.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Row 1 - Scrolls Right to Left */}
        <div className="relative">
          <div className="flex animate-scroll-testimonials-rtl">
            {row1.map((testimonial, index) => (
              <TestimonialCard key={`row1-${testimonial.id}-${index}`} testimonial={testimonial} />
            ))}
          </div>
        </div>

        {/* Row 2 - Scrolls Left to Right */}
        <div className="relative">
          <div className="flex animate-scroll-testimonials-ltr">
            {row2.map((testimonial, index) => (
              <TestimonialCard key={`row2-${testimonial.id}-${index}`} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 mt-16">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Join hundreds of organizations accelerating their AI transformation journey
          </p>
        </div>
      </div>
    </section>
  );
}
