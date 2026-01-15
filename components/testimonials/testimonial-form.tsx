'use client'

import { useState } from 'react'
import { submitTestimonial } from '@/actions/testimonial-actions'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2 } from "lucide-react"

interface TestimonialFormProps {
    token: string
    context?: any
}

export function TestimonialForm({ token, context }: TestimonialFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function onSubmit(formData: FormData) {
        setIsSubmitting(true)
        setError(null)

        try {
            await submitTestimonial(token, formData)
            setIsSuccess(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <Card className="p-8 bg-zinc-900 border-zinc-800 text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold">Thank you!</h2>
                <p className="text-zinc-400">Your testimonial has been submitted successfully.</p>
            </Card>
        )
    }

    return (
        <Card className="p-6 bg-zinc-900 border-zinc-800 shadow-xl">
            <form action={onSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" required placeholder="John Doe" className="bg-zinc-950 border-zinc-800" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" name="role" placeholder="CEO" className="bg-zinc-950 border-zinc-800" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" name="company" placeholder="Acme Inc" className="bg-zinc-950 border-zinc-800" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="quote">Your Experience</Label>
                    <Textarea
                        id="quote"
                        name="quote"
                        required
                        placeholder="Working with the team was..."
                        className="bg-zinc-950 border-zinc-800 min-h-[120px]"
                    />
                </div>

                {error && (
                    <div className="p-3 rounded bg-red-500/10 text-red-500 text-sm border border-red-500/20">
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Submit Testimonial
                </Button>
            </form>
        </Card>
    )
}
