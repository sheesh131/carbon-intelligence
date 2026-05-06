import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, Leaf, ShieldCheck, Zap, Activity } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
    { name: "Mon", carbon: 400, traditional: 2400 },
    { name: "Tue", carbon: 300, traditional: 1398 },
    { name: "Wed", carbon: 200, traditional: 9800 },
    { name: "Thu", carbon: 278, traditional: 3908 },
    { name: "Fri", carbon: 189, traditional: 4800 },
    { name: "Sat", carbon: 239, traditional: 3800 },
    { name: "Sun", carbon: 349, traditional: 4300 },
]

export default function DashboardOverview() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Real-time overview of your credit risk models and carbon efficiency.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-panel border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12,234</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <span className="text-green-500 mr-1 flex items-center"><ArrowUpRight className="h-3 w-3" /> +20.1%</span> from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-panel border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Carbon Saved</CardTitle>
                        <Leaf className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.2 tons</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <span className="text-green-500 mr-1 flex items-center"><ArrowUpRight className="h-3 w-3" /> +15%</span> efficiency gain
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-panel border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
                        <Zap className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">94.8%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Maintained with federated learning
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-panel border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Nodes</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">573</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Secure federated participants
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 glass-panel">
                    <CardHeader>
                        <CardTitle>Carbon Efficiency vs Traditional Models</CardTitle>
                        <CardDescription>
                            Comparing CO2 emissions (g) per 1000 predictions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorTraditional" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}g`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Area type="monotone" dataKey="traditional" stroke="#ef4444" fillOpacity={1} fill="url(#colorTraditional)" name="Traditional AI" />
                                    <Area type="monotone" dataKey="carbon" stroke="#22c55e" fillOpacity={1} fill="url(#colorCarbon)" name="Carbon-Aware AI" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 glass-panel">
                    <CardHeader>
                        <CardTitle>Recent Predictions</CardTitle>
                        <CardDescription>
                            Latest loan assessments processed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            <div className="flex items-center">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Small Business Loan #4920</p>
                                    <p className="text-xs text-muted-foreground">Approved • 2 min ago</p>
                                </div>
                                <div className="ml-auto font-medium text-green-500">Low Risk</div>
                            </div>
                            <div className="flex items-center">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Personal Loan #4919</p>
                                    <p className="text-xs text-muted-foreground">Review Required • 15 min ago</p>
                                </div>
                                <div className="ml-auto font-medium text-yellow-500">Medium Risk</div>
                            </div>
                            <div className="flex items-center">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Mortgage Application #4918</p>
                                    <p className="text-xs text-muted-foreground">Rejected • 2 hrs ago</p>
                                </div>
                                <div className="ml-auto font-medium text-red-500">High Risk</div>
                            </div>
                            <div className="flex items-center">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Auto Loan #4917</p>
                                    <p className="text-xs text-muted-foreground">Approved • 4 hrs ago</p>
                                </div>
                                <div className="ml-auto font-medium text-green-500">Low Risk</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
