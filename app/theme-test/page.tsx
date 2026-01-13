import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ThemeTestPage() {
    return (
        <div className="container mx-auto py-10 space-y-10">
            <div className="space-y-4">
                <h1 className="text-4xl font-heading font-bold">Theme Verification</h1>
                <p className="text-muted-foreground text-lg">
                    Verifying strict design rules: Matte Glass, Typography, Radius (14px), and ShadCN components.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Colors Card */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle>Core Colors</CardTitle>
                        <CardDescription>Should match design specs</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg bg-background border border-border shadow-sm"></div>
                            <span>Background (#000000)</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg bg-surface border border-border shadow-sm"></div>
                            <span>Surface (#0a0a0a)</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg bg-accent border border-border"></div>
                            <span>Accent (#0c759a)</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Inputs Card */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle>Interactive Elements</CardTitle>
                        <CardDescription>ShadCN components verification</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input type="email" id="email" placeholder="Email" />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label>Select Option</Label>
                            <Select>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a fruit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="apple">Apple</SelectItem>
                                    <SelectItem value="banana">Banana</SelectItem>
                                    <SelectItem value="blueberry">Blueberry</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="ghost">Cancel</Button>
                        <Button>Deploy</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
