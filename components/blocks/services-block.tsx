import { BlockProps } from './types'
import { Bot, Workflow, BarChart3, Database, Shield, Zap } from 'lucide-react'
import { ServiceFlipCard } from './service-flip-card'

const SERVICES = [
    {
        title: 'AI Automation Agents',
        icon: Bot,
        desc: 'Autonomous agents that handle customer support, outreach, and scheduling 24/7.',
        details: ['Multi-channel support (Email/Chat)', 'Natural Language Processing', 'Human-in-the-loop escalation']
    },
    {
        title: 'Workflow Optimization',
        icon: Workflow,
        desc: 'Streamline operations by connecting your existing tools (Slack, HubSpot, Notion).',
        details: ['Zapier/Make Integration', 'Custom API Connectors', 'Real-time Event Triggers']
    },
    {
        title: 'Data Analytics',
        icon: BarChart3,
        desc: 'Turn raw data into actionable insights with predictive AI models.',
        details: ['Predictive Forecasting', 'Sentiment Analysis', 'Automated Reporting Dashboards']
    },
    {
        title: 'Knowledge Bases',
        icon: Database,
        desc: 'Centralize your company intelligence into a queryable AI brain.',
        details: ['RAG Pipeline Implementation', 'Vector Database Setup', 'Slack/Discord Bots']
    },
    {
        title: 'Enterprise Security',
        icon: Shield,
        desc: 'Bank-grade security protocols ensuring your data remains private and protected.',
        details: ['SOC2 Compliance Ready', 'PII Redaction', 'On-premise LLM Deployment']
    },
    {
        title: 'Rapid Prototyping',
        icon: Zap,
        desc: 'Go from idea to functional MVP in weeks, not months.',
        details: ['Fast Iteration Cycles', 'Scalable Architecture', 'Production-ready Code']
    },
]

export function ServicesBlock({ id }: BlockProps) {
    return (
        <section id={id} className="py-24 bg-black relative">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold font-heading">Our Services</h2>
                    <p className="text-muted-foreground text-lg">Comprehensive AI solutions tailored for modern enterprises.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SERVICES.map((service, idx) => (
                        <ServiceFlipCard
                            key={idx}
                            title={service.title}
                            desc={service.desc}
                            details={service.details}
                            icon={<service.icon className="w-6 h-6 text-accent" />}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
