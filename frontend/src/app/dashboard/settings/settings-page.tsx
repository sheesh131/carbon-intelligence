import { useTheme } from "@/theme/theme-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
    const { theme, setTheme } = useTheme()

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>

                {/* Profile Section (Read-Only) */}
                <TabsContent value="profile" className="space-y-4">
                    <Card className="glass-panel">
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>
                                Your personal information. Contact your administrator to update.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src="/avatars/01.png" alt="@shadcn" />
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-medium">John Doe</h3>
                                    <p className="text-sm text-muted-foreground">Lead Risk Analyst</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                                            Admin
                                        </span>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                            Verified
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" value="john.doe@carbon-intelligence.com" readOnly className="bg-muted/50 cursor-not-allowed" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Input id="role" value="Administrator" readOnly className="bg-muted/50 cursor-not-allowed" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Input id="department" value="Risk & Security" readOnly className="bg-muted/50 cursor-not-allowed" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input id="location" value="New York, USA" readOnly className="bg-muted/50 cursor-not-allowed" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Theme Selection */}
                <TabsContent value="appearance" className="space-y-4">
                    <Card className="glass-panel">
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>
                                Customize the look and feel of the platform.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4 max-w-2xl">
                                {/* Light Theme */}
                                <div
                                    onClick={() => setTheme("light")}
                                    className={cn(
                                        "cursor-pointer rounded-lg border-2 p-1 hover:border-primary transition-all",
                                        theme === "light" ? "border-primary bg-primary/5" : "border-muted"
                                    )}
                                >
                                    <div className="space-y-2 rounded-md bg-[#ecedef] p-2">
                                        <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                            <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                            <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                        </div>
                                    </div>
                                    <div className="p-2 text-center text-sm font-medium">Light</div>
                                </div>

                                {/* Dark Theme */}
                                <div
                                    onClick={() => setTheme("dark")}
                                    className={cn(
                                        "cursor-pointer rounded-lg border-2 p-1 hover:border-primary transition-all",
                                        theme === "dark" ? "border-primary bg-primary/5" : "border-muted"
                                    )}
                                >
                                    <div className="space-y-2 rounded-md bg-slate-950 p-2">
                                        <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                            <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                            <div className="h-4 w-4 rounded-full bg-slate-400" />
                                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                        </div>
                                    </div>
                                    <div className="p-2 text-center text-sm font-medium">Dark</div>
                                </div>

                                {/* Glass Theme */}
                                <div
                                    onClick={() => setTheme("glass")}
                                    className={cn(
                                        "cursor-pointer rounded-lg border-2 p-1 hover:border-primary transition-all",
                                        theme === "glass" ? "border-primary bg-primary/5" : "border-muted"
                                    )}
                                >
                                    <div className="space-y-2 rounded-md bg-slate-950 p-2 relative overflow-hidden">
                                        {/* Glass Effect Simulation */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-sm" />

                                        <div className="space-y-2 rounded-md bg-white/10 p-2 shadow-sm border border-white/10 relative z-10">
                                            <div className="h-2 w-[80px] rounded-lg bg-white/50" />
                                            <div className="h-2 w-[100px] rounded-lg bg-white/50" />
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-md bg-white/10 p-2 shadow-sm border border-white/10 relative z-10">
                                            <div className="h-4 w-4 rounded-full bg-white/50" />
                                            <div className="h-2 w-[100px] rounded-lg bg-white/50" />
                                        </div>
                                    </div>
                                    <div className="p-2 text-center text-sm font-medium">Glass</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
