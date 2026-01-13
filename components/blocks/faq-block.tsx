
import { BlockProps } from './types'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const FAQS = [
    { q: 'How is this different from generic AI tools like ChatGPT?', a: 'ChatGPT is a tool. We build workflows. We integrate AI directly into your business logic, connecting it to your databases, CRMs, and APIs to perform complex actions autonomously.' },
    { q: 'Is my data secure?', a: 'Absolutely. We practice data minimalization and can deploy agents within your own VPC. We never train public models on your private data.' },
    { q: 'How long does implementation take?', a: 'A typical pilot takes 2-4 weeks. Enterprise-wide deployment depends on complexity but generally follows a 8-12 week timeline.' },
    { q: 'Do I need a technical team?', a: 'No. We handle the entire technical implementation. Your team just provides the business requirements and feedback.' },
    { q: 'What is the pricing model?', a: 'We typically charge a setup fee + a monthly maintenance retainer. For high-volume processing, we utilize utility-based pricing.' }
]

export function FAQBlock({ id }: BlockProps) {
    return (
        <section id={id} className="py-24 bg-black relative">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">Frequently Asked Questions</h2>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {FAQS.map((faq, idx) => (
                        <AccordionItem key={idx} value={`item-${idx}`} className="border border-white/10 bg-white/5 rounded-lg px-4 data-[state=open]:border-accent/40 data-[state=open]:bg-white/10 transition-all">
                            <AccordionTrigger className="text-lg font-heading hover:no-underline hover:text-accent text-left">
                                {faq.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                                {faq.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    )
}
