'use client'

import { BlockProps } from './types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useActionState } from 'react'
import { submitLead } from '@/actions/submit-lead'
import { Loader2, ArrowRight } from 'lucide-react'

import { TiltCard } from '@/components/ui/tilt-card'

// ... imports remain the same

// Initial State (unchanged)
const initialState: {
    message: string
    success: boolean
    errors?: {
        firstName?: string[]
        lastName?: string[]
        email?: string[]
        company?: string[]
        website?: string[]
    }
} = {
    message: '',
    success: false,
}

export function ContactBlock({ id }: BlockProps) {
    const [state, formAction, isPending] = useActionState(submitLead, initialState)

    return (
        <section id={id} className="py-24 bg-transparent relative">
            <div className="absolute inset-0 bg-gradient-to-t from-accent/10 to-transparent pointer-events-none"></div>

            <div className="container mx-auto px-4 max-w-xl relative z-10">
                <TiltCard>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden p-2">
                        {/* Added inner glow/blur effects from hero demo style */}
                        <div className="absolute -inset-4 bg-accent/20 blur-3xl rounded-full opacity-20 pointer-events-none"></div>

                        <div className="relative z-10 p-6 md:p-8 space-y-6">
                            <div className="text-center space-y-2">
                                <h3 className="text-3xl font-heading font-bold text-white">Ready to Scale?</h3>
                                <p className="text-lg text-muted-foreground">
                                    Book a discovery call. No hard sales, just strategy.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {state.success ? (
                                    <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg text-center text-green-400">
                                        <h3 className="font-bold text-xl mb-2">Message Sent!</h3>
                                        <p>{state.message}</p>
                                    </div>
                                ) : (
                                    <form action={formAction} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="first-name">First Name</Label>
                                                <Input name="first-name" id="first-name" placeholder="Jane" className="bg-white/5 border-white/10 h-12" required />
                                                {state.errors?.firstName && <p className="text-red-400 text-xs">{state.errors.firstName}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="last-name">Last Name</Label>
                                                <Input name="last-name" id="last-name" placeholder="Doe" className="bg-white/5 border-white/10 h-12" required />
                                                {state.errors?.lastName && <p className="text-red-400 text-xs">{state.errors.lastName}</p>}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Work Email</Label>
                                            <Input name="email" id="email" type="email" placeholder="jane@company.com" className="bg-white/5 border-white/10 h-12" required />
                                            {state.errors?.email && <p className="text-red-400 text-xs">{state.errors.email}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="company">Company Website</Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input name="company" id="company" placeholder="Company Name" className="bg-white/5 border-white/10 h-12" required />
                                                <Input name="website" id="website" placeholder="website.com" className="bg-white/5 border-white/10 h-12" />
                                            </div>
                                            {state.errors?.company && <p className="text-red-400 text-xs">{state.errors.company}</p>}
                                            {state.errors?.website && <p className="text-red-400 text-xs">{state.errors.website}</p>}
                                        </div>

                                        {state.message && !state.success && (
                                            <p className="text-red-400 text-sm text-center">{state.message}</p>
                                        )}

                                        <Button disabled={isPending} type="submit" size="lg" className="w-full text-lg h-14 bg-accent text-white hover:bg-accent/90 mt-2 font-bold tracking-wide shadow-lg hover:shadow-accent/20 transition-all">
                                            {isPending ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Please wait
                                                </>
                                            ) : (
                                                <>
                                                    Request Consultation
                                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </Button>

                                        <p className="text-xs text-center text-muted-foreground mt-4">
                                            By submitting, you agree to our privacy policy. We respect your inbox.
                                        </p>
                                    </form>
                                )}
                            </div>
                        </div>
                    </Card>
                </TiltCard>
            </div>
        </section>
    )
}
