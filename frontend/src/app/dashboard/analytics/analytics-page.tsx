import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Activity, BarChart2, GitCompare, AlertCircle } from "lucide-react"
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar, Legend, ReferenceLine
} from "recharts"

// Mock Data
const rocData = Array.from({ length: 20 }, (_, i) => ({
    fpr: i / 19,
    tpr: 1 - Math.exp(-5 * (i / 19)), // Simulated curve
    random: i / 19
}))

const trendData = [
    { month: "Jan", auc: 0.92, ks: 0.45 },
    { month: "Feb", auc: 0.93, ks: 0.48 },
    { month: "Mar", auc: 0.91, ks: 0.42 },
    { month: "Apr", auc: 0.94, ks: 0.51 },
    { month: "May", auc: 0.95, ks: 0.53 },
    { month: "Jun", auc: 0.96, ks: 0.55 },
]

const modelComparisonData = [
    { name: "Full FP32 Baseline", auc: 0.948, carbon: 512.52, score: 0 },
    { name: "Scaling Only", auc: 0.949, carbon: 262.52, score: 0 },
    { name: "INT8 Only", auc: 0.964, carbon: 87.5, score: 0 },
    { name: "Carbon-Aware NAS (Ours)", auc: 0.954, carbon: 87.5, score: 0 },
]

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Model Analytics</h2>
                    <p className="text-muted-foreground">
                        Deep dive into model performance, stability, and comparison.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select defaultValue="v2.4">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Model Version" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="v2.4">v2.4 (Current Prod)</SelectItem>
                            <SelectItem value="v2.3">v2.3 (Legacy)</SelectItem>
                            <SelectItem value="v2.5-beta">v2.5-beta (Staging)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-panel border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">AUC Score</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0.954</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Top 1% performing models
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-panel border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">KS Statistic</CardTitle>
                        <BarChart2 className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0.55</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Strong separation power (&gt;0.5)
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-panel border-l-4 border-l-yellow-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Brier Score</CardTitle>
                        <TrendingUp className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0.082</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Low calibration error
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-panel border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">PSI (Stability)</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0.04</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Stable distribution (&lt;0.1)
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <Tabs defaultValue="performance" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="performance">Performance Curves</TabsTrigger>
                    <TabsTrigger value="trends">Historical Trends</TabsTrigger>
                    <TabsTrigger value="comparison">Model Comparison</TabsTrigger>
                </TabsList>

                <TabsContent value="performance" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="glass-panel">
                            <CardHeader>
                                <CardTitle>ROC Curve</CardTitle>
                                <CardDescription>Receiver Operating Characteristic</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={rocData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                        <XAxis dataKey="fpr" type="number" domain={[0, 1]} tickFormatter={(v) => v.toFixed(1)} label={{ value: 'False Positive Rate', position: 'insideBottomRight', offset: -5 }} />
                                        <YAxis domain={[0, 1]} tickFormatter={(v) => v.toFixed(1)} label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                                        <Area type="monotone" dataKey="tpr" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Model ROC" />
                                        <Line type="linear" dataKey="random" stroke="#9ca3af" strokeDasharray="5 5" name="Random Guess" dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="glass-panel">
                            <CardHeader>
                                <CardTitle>Prediction Distribution</CardTitle>
                                <CardDescription>Score density for Default vs Non-Default</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[350px] flex items-center justify-center text-muted-foreground">
                                {/* Placeholder for now - complex to simulate perfectly without data */}
                                <div className="text-center">
                                    <BarChart2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    (KS Plot Placeholder - Requires granular distribution data)
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="trends" className="space-y-4">
                    <Card className="glass-panel">
                        <CardHeader>
                            <CardTitle>Performance History</CardTitle>
                            <CardDescription>AUC and KS Statistic trends over the last 6 months.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="month" />
                                    <YAxis yAxisId="left" domain={[0.8, 1]} />
                                    <YAxis yAxisId="right" orientation="right" domain={[0, 1]} />
                                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="auc" stroke="#3b82f6" strokeWidth={2} name="AUC Score" />
                                    <Line yAxisId="right" type="monotone" dataKey="ks" stroke="#8b5cf6" strokeWidth={2} name="KS Statistic" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="comparison" className="space-y-4">
                    <Card className="glass-panel">
                        <CardHeader>
                            <CardTitle>Model Comparison</CardTitle>
                            <CardDescription>AUC vs Carbon Cost across architectures.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={modelComparisonData} layout="vertical" margin={{ left: 50 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={150} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                                    <Legend />
                                    <Bar dataKey="auc" fill="#3b82f6" name="Accuracy (AUC)" minPointSize={5} />
                                    <Bar dataKey="carbon" fill="#22c55e" name="Carbon Footprint (Relative)" minPointSize={5} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    )
}
