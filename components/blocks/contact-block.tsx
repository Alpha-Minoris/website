'use client'

import { BlockProps } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useActionState } from 'react'
import { submitLead } from '@/actions/submit-lead'
import { Loader2 } from 'lucide-react'

// Initial State
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
        <section id={id} className="py-24 bg-black relative">
            <div className="absolute inset-0 bg-gradient-to-t from-accent/10 to-transparent pointer-events-none"></div>

            <div className="container mx-auto px-4 max-w-xl relative z-10">
                <Card className="bg-black/50 border-white/10 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-3xl font-heading">Ready to Scale?</CardTitle>
                        <CardDescription className="text-lg">
                            Book a discovery call. No hard sales, just strategy.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
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

                                <Button disabled={isPending} type="submit" size="lg" className="w-full text-lg h-14 rounded-full bg-accent text-white hover:bg-accent/90 mt-2">
                                    {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                    {isPending ? 'Sending...' : 'Request Consultation'}
                                </Button>

                                <p className="text-xs text-center text-muted-foreground mt-4">
                                    By submitting, you agree to our privacy policy. We respect your inbox.
                                </p>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}
