import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { 
  Brain, 
  Target, 
  Database,
  Users,
  Shield,
  Zap,
  BarChart3,
  GitBranch,
  RefreshCw
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Strategy & Roadmaps",
    description: "Align vision, prioritize use cases, and plan your AI journey with measurable ROI and business impact.",
  },
  {
    icon: BarChart3,
    title: "Implementation & MLOps Support",
    description: "Move from pilots to production with speed, reliability, and governance built into every deployment.",
  },
  {
    icon: Database,
    title: "Data & Infrastructure Readiness",
    description: "Strengthen data pipelines, platforms, and architecture to ensure your systems are AI-ready.",
  },
  {
    icon: Users,
    title: "Training & Change Enablement",
    description: "Empower teams with practical skills and foster organizational confidence in AI adoption.",
  },
  {
    icon: RefreshCw,
    title: "Ongoing Advisory & Optimization",
    description: "Continuous support to refine performance, identify new opportunities, and maximize AI value.",
  },
  {
    icon: Target,
    title: "Role-Based Access & Permissions",
    description: "Design secure, scalable access controls that align AI capabilities with your team structure.",
  },
  {
    icon: Shield,
    title: "AI Guardrails & Responsible AI",
    description: "Build ethical, compliant, and trusted AI systems with safety protocols and risk management.",
  },
  {
    icon: Zap,
    title: "Tooling, Security & Infosec",
    description: "Select robust technology stacks and implement security best practices for AI infrastructure.",
  },
  {
    icon: GitBranch,
    title: "Governance, Compliance & POCs",
    description: "Establish auditability, meet regulatory requirements, and validate concepts through rapid pilots.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 lg:py-40">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center space-y-5 mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl">
            End-to-End AI Transformation
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From strategy to execution, we provide the expertise and frameworks to help your 
            organization navigate the AI landscape and capture real value.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-border/40 hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-xl">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
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
