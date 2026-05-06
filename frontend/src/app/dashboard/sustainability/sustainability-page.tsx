import { useState } from "react"
import { CheckCircle2, Cpu, FlaskConical, Leaf, Loader2, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { API_BASE_URL } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import {
    SustainabilityDataset,
    type SustainabilityRunResponse,
} from "@/types/api"
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts"

const datasetCards = [
    {
        dataset: SustainabilityDataset.BANK,
        title: "Bank dataset",
        description: "Runs the main bank sustainability pipeline from run_nas.py.",
        icon: Database,
    },
    {
        dataset: SustainabilityDataset.GERMAN,
        title: "German dataset",
        description: "Runs the German credit sustainability pipeline from run_nas_german.py.",
        icon: FlaskConical,
    },
] as const

const summaryCards = [
    {
        key: "carbon_reduction_pct",
        label: "Carbon Reduction",
        suffix: "%",
        icon: Leaf,
    },
    {
        key: "performance_retention_pct",
        label: "Performance Retention",
        suffix: "%",
        icon: Cpu,
    },
    {
        key: "efficiency_gain_pct",
        label: "Efficiency Gain",
        suffix: "%",
        icon: CheckCircle2,
    },
] as const

const metricCards = [
    { label: "AUC", key: "auc" },
    { label: "KS", key: "ks" },
    { label: "Brier", key: "brier" },
] as const

export default function SustainabilityPage() {
    const [selectedDataset, setSelectedDataset] = useState<SustainabilityDataset>(
        SustainabilityDataset.BANK
    )
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<SustainabilityRunResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [logs, setLogs] = useState<string[]>([])
    const [streamStatus, setStreamStatus] = useState<string>("")

    const chartData = result
        ? [
              {
                  name: "Carbon Cost",
                  Baseline: result.summary.baseline?.carbon_cost ?? 0,
                  Optimized: result.summary.optimized?.carbon_cost ?? 0,
              },
              {
                  name: "AUC",
                  Baseline: result.summary.baseline?.metrics?.auc ?? 0,
                  Optimized: result.summary.optimized?.metrics?.auc ?? 0,
              },
              {
                  name: "KS",
                  Baseline: result.summary.baseline?.metrics?.ks ?? 0,
                  Optimized: result.summary.optimized?.metrics?.ks ?? 0,
              },
              {
                  name: "Brier",
                  Baseline: result.summary.baseline?.metrics?.brier ?? 0,
                  Optimized: result.summary.optimized?.metrics?.brier ?? 0,
              },
          ]
        : []

    const handleRun = async () => {
        setLoading(true)
        setError(null)
        setResult(null)
        setLogs([])
        setStreamStatus("Connecting to backend...")

        const streamUrl = `${API_BASE_URL}/sustainability/stream?dataset=${selectedDataset}&preview_only=false`
        const source = new EventSource(streamUrl)
        let completed = false

        const appendLog = (message: string) => {
            setLogs((currentLogs) => [...currentLogs, message])
        }

        source.addEventListener("status", (event) => {
            const payload = JSON.parse((event as MessageEvent).data) as { message?: string }
            if (payload.message) {
                setStreamStatus(payload.message)
                appendLog(payload.message)
            }
        })

        source.addEventListener("log", (event) => {
            const payload = JSON.parse((event as MessageEvent).data) as { message?: string }
            if (payload.message) {
                appendLog(payload.message)
            }
        })

        source.addEventListener("result", (event) => {
            const payload = JSON.parse((event as MessageEvent).data) as {
                data?: SustainabilityRunResponse
            }
            if (payload.data) {
                setResult(payload.data)
                setStreamStatus("Run completed")
            }
        })

        source.addEventListener("done", () => {
            completed = true
            source.close()
            setLoading(false)
        })

        source.onerror = () => {
            if (completed) {
                return
            }

            source.close()
            setLoading(false)
            setError("No response from server. Please check your connection.")
        }
    }

    const selectedLabel =
        datasetCards.find((card) => card.dataset === selectedDataset)?.title ?? "dataset"

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Sustainability Check</h2>
                    <p className="text-muted-foreground">
                        Choose a dataset and run the matching backend pipeline. The page only shows the metrics the API actually returns.
                    </p>
                </div>
                <Button onClick={handleRun} disabled={loading} className="md:self-start">
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running {selectedLabel}
                        </>
                    ) : (
                        <>Check sustainability for {selectedLabel}</>
                    )}
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {datasetCards.map((card) => {
                    const Icon = card.icon
                    const isSelected = selectedDataset === card.dataset

                    return (
                        <Card
                            key={card.dataset}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedDataset(card.dataset)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault()
                                    setSelectedDataset(card.dataset)
                                }
                            }}
                            className={cn(
                                "cursor-pointer border transition-all",
                                isSelected
                                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                                    : "border-border/60 bg-background/60 hover:border-primary/50 hover:bg-muted/30"
                            )}
                        >
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-base">{card.title}</CardTitle>
                                    <CardDescription>{card.description}</CardDescription>
                                </div>
                                <Icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                            </CardHeader>
                            <CardContent className="flex items-center justify-between pt-0">
                                <span className="font-mono text-xs text-muted-foreground">{card.dataset}</span>
                                <span className={cn(
                                    "rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-widest",
                                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                    {isSelected ? "Selected" : "Select"}
                                </span>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            {(loading || logs.length > 0) && (
                <Card className="glass-panel border border-border/60">
                    <CardHeader>
                        <CardTitle>Live Logs</CardTitle>
                        <CardDescription>
                            {streamStatus || "Streaming backend progress one line at a time."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-72 overflow-y-auto rounded-xl border border-border/50 bg-black/90 p-4 font-mono text-xs text-green-300">
                            {logs.length > 0 ? (
                                logs.map((line, index) => (
                                    <div key={`${index}-${line}`} className="whitespace-pre-wrap break-words">
                                        {line}
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted-foreground">Waiting for backend logs...</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {result && (
                <div className="space-y-6">
                    <Card className="glass-panel border border-border/60">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                Run Complete
                            </CardTitle>
                            <CardDescription>{result.message}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-3">
                            {summaryCards.map((item) => {
                                const Icon = item.icon
                                const value = result.summary[item.key]

                                return (
                                    <div key={item.key} className="rounded-xl border border-border/50 bg-background/60 p-4">
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                                {item.label}
                                            </span>
                                            <Icon className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {typeof value === "number" ? `${value.toFixed(2)}${item.suffix}` : "N/A"}
                                        </div>
                                    </div>
                                )
                            })}
                            <div className="rounded-xl border border-border/50 bg-background/60 p-4 md:col-span-3">
                                <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    Candidates
                                </div>
                                <div className="text-2xl font-bold">{result.total_candidates}</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-panel border border-border/60">
                        <CardHeader>
                            <CardTitle>Metric Comparison</CardTitle>
                            <CardDescription>
                                Baseline versus optimized values from the summary payload.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[360px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            borderColor: "hsl(var(--border))",
                                            borderRadius: 12,
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="Baseline" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="Optimized" fill="#22c55e" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <Card className="glass-panel xl:col-span-1">
                            <CardHeader>
                                <CardTitle>Baseline</CardTitle>
                                <CardDescription>Highest-carbon candidate from the selected run.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Precision</span>
                                    <span className="font-mono">{result.summary.baseline?.precision ?? "N/A"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Exit level</span>
                                    <span className="font-mono">{result.summary.baseline?.exit_level ?? "N/A"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Carbon cost</span>
                                    <span className="font-mono">{result.summary.baseline?.carbon_cost?.toFixed(4) ?? "N/A"}</span>
                                </div>
                                {metricCards.map((metric) => (
                                    <div key={`baseline-${metric.key}`} className="flex items-center justify-between">
                                        <span className="text-muted-foreground">{metric.label}</span>
                                        <span className="font-mono">
                                            {result.summary.baseline?.metrics?.[metric.key]?.toFixed(4) ?? "N/A"}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="glass-panel xl:col-span-1">
                            <CardHeader>
                                <CardTitle>Optimized</CardTitle>
                                <CardDescription>Best efficiency candidate from the selected run.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Precision</span>
                                    <span className="font-mono">{result.summary.optimized?.precision ?? "N/A"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Exit level</span>
                                    <span className="font-mono">{result.summary.optimized?.exit_level ?? "N/A"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Carbon cost</span>
                                    <span className="font-mono">{result.summary.optimized?.carbon_cost?.toFixed(4) ?? "N/A"}</span>
                                </div>
                                {metricCards.map((metric) => (
                                    <div key={`optimized-${metric.key}`} className="flex items-center justify-between">
                                        <span className="text-muted-foreground">{metric.label}</span>
                                        <span className="font-mono">
                                            {result.summary.optimized?.metrics?.[metric.key]?.toFixed(4) ?? "N/A"}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                    </div>
                </div>
            )}
        </div>
    )
}
