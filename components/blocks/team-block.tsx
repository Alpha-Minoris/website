
import { BlockProps } from './types'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Github, Linkedin, Twitter } from 'lucide-react'

// Placeholder team data
const TEAM = [
    { name: 'Sarah Chen', role: 'CTO & Co-Founder', bio: 'Ex-Google Brain. Expert in transformer architectures and agentic workflows.' },
    { name: 'Marcus Rodriguez', role: 'Lead Architect', bio: 'Specialist in scalable systems and enterprise integration patterns.' },
    { name: 'Emily Zhang', role: 'Head of Product', bio: 'Bridging the gap between technical capability and business value.' },
    { name: 'David Kim', role: 'AI Ethics Lead', bio: 'Ensuring your automation is safe, compliant, and reliable.' },
]

export function TeamBlock({ id }: BlockProps) {
    return (
        <section id={id} className="py-24 bg-black relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">Meet the Experts</h2>
                    <p className="text-muted-foreground text-lg">The minds behind the machines.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {TEAM.map((member, idx) => (
                        <Card key={idx} className="bg-white/5 border-white/10 overflow-hidden group hover:border-accent/40 transition-colors">
                            <div className="h-48 bg-white/5 relative group-hover:bg-white/10 transition-colors flex items-center justify-center">
                                {/* Avatar Placeholder */}
                                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-3xl font-bold text-white/20">
                                    {member.name.charAt(0)}
                                </div>
                            </div>
                            <CardContent className="pt-6 text-center space-y-2">
                                <h3 className="text-xl font-bold font-heading text-white">{member.name}</h3>
                                <p className="text-accent text-sm font-medium uppercase tracking-wider">{member.role}</p>
                                <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                            </CardContent>
                            <CardFooter className="justify-center gap-4 pb-6">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10">
                                    <Linkedin className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10">
                                    <Twitter className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10">
                                    <Github className="w-4 h-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
