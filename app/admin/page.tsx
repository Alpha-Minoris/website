import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ArrowLeft, Settings, Layout, Layers, Database, Palette, Users, FileText } from 'lucide-react'

export default function AdminPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="rounded-full text-zinc-400 hover:text-white">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                            <p className="text-zinc-400">Manage your website content and settings.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Theme & Brand */}
                    <Card className="p-6 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                                <Palette className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Theme & Brand</h3>
                                <p className="text-sm text-zinc-500">Colors, Fonts, Logos</p>
                            </div>
                        </div>
                    </Card>

                    {/* Content Sections */}
                    <Card className="p-6 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-full bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                                <Layout className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Sections</h3>
                                <p className="text-sm text-zinc-500">Reorder, Toggle, SEO</p>
                            </div>
                        </div>
                    </Card>

                    {/* Testimonials */}
                    <Card className="p-6 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-full bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20 transition-colors">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Testimonials</h3>
                                <p className="text-sm text-zinc-500">Approvals, Tokens</p>
                            </div>
                        </div>
                    </Card>

                    {/* Case Studies */}
                    <Card className="p-6 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-full bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20 transition-colors">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Case Studies</h3>
                                <p className="text-sm text-zinc-500">Rotation, Management</p>
                            </div>
                        </div>
                    </Card>

                    {/* Assets */}
                    <Card className="p-6 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-full bg-pink-500/10 text-pink-500 group-hover:bg-pink-500/20 transition-colors">
                                <Database className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Assets</h3>
                                <p className="text-sm text-zinc-500">Library, Uploads</p>
                            </div>
                        </div>
                    </Card>

                    {/* Settings */}
                    <Card className="p-6 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-full bg-zinc-500/10 text-zinc-500 group-hover:bg-zinc-500/20 transition-colors">
                                <Settings className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold">System</h3>
                                <p className="text-sm text-zinc-500">Logs, Users, Backup</p>
                            </div>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    )
}
