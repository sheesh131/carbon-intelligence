import { useState } from "react"
import { Activity, Loader2, Network, RefreshCw, Shield, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { federatedAPI } from "@/lib/api-client"
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import type { FederatedRunResponse } from "@/types/api"

type FederatedSettings = {
    preview_only: boolean
    number_of_clients: number
    local_epochs: number
    batch_size: number
    learning_rate: number
    aggregation_rounds: number
    validation_split: number
    input_size: number
    hidden_size: number
    random_seed: number
    enable_early_stopping: boolean
    early_stopping_patience: number
    early_stopping_min_delta: number
}

const defaultSettings: FederatedSettings = {
    preview_only: true,
    number_of_clients: 3,
    local_epochs: 2,
    batch_size: 32,
    learning_rate: 0.001,
    aggregation_rounds: 3,
    validation_split: 0.2,
    input_size: 20,
    hidden_size: 32,
    random_seed: 42,
    enable_early_stopping: true,
    early_stopping_patience: 5,
    early_stopping_min_delta: 0.001,
}

export default function FederatedPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<FederatedRunResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [settings, setSettings] = useState<FederatedSettings>(defaultSettings)
    const [showResultsDrawer, setShowResultsDrawer] = useState(false)

    const roundChartData = result?.round_metrics.map((round) => ({
        round: `Round ${round.round_number + 1}`,
        "Train Accuracy": round.average_client_accuracy,
        "Val Accuracy": round.average_val_accuracy,
        "Train Loss": round.average_client_loss,
        "Val Loss": round.average_val_loss,
    })) ?? []

    const lastRound = result?.round_metrics.at(-1)

    const updateNumberField = <K extends keyof FederatedSettings>(key: K, value: string) => {
        setSettings((current) => ({
            ...current,
            [key]: value === "" ? current[key] : Number(value),
        }))
    }

    const handleRun = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await federatedAPI.run({
                preview_only: settings.preview_only,
                number_of_clients: settings.number_of_clients,
                local_epochs: settings.local_epochs,
                batch_size: settings.batch_size,
                learning_rate: settings.learning_rate,
                aggregation_rounds: settings.aggregation_rounds,
                validation_split: settings.validation_split,
                input_size: settings.input_size,
                hidden_size: settings.hidden_size,
                random_seed: settings.random_seed,
                enable_early_stopping: settings.enable_early_stopping,
                early_stopping_patience: settings.early_stopping_patience,
                early_stopping_min_delta: settings.early_stopping_min_delta,
            })
            setResult(response)
            setShowResultsDrawer(true)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unable to run federated simulation")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Federated Learning</h2>
                    </div>
                </div>

                <Card className="glass-panel">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="space-y-1">
                            <CardTitle>Simulation Settings</CardTitle>
                        </div>
                        <Button onClick={handleRun} disabled={loading} className="ml-auto">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running simulation
                                </>
                            ) : (
                                <>Run federated simulation</>
                            )}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="number_of_clients">Number of clients</Label>
                                <Input
                                    id="number_of_clients"
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={settings.number_of_clients}
                                    onChange={(event) => updateNumberField("number_of_clients", event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="aggregation_rounds">Aggregation rounds</Label>
                                <Input
                                    id="aggregation_rounds"
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={settings.aggregation_rounds}
                                    onChange={(event) => updateNumberField("aggregation_rounds", event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="local_epochs">Local epochs</Label>
                                <Input
                                    id="local_epochs"
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={settings.local_epochs}
                                    onChange={(event) => updateNumberField("local_epochs", event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="batch_size">Batch size</Label>
                                <Input
                                    id="batch_size"
                                    type="number"
                                    min={1}
                                    max={256}
                                    value={settings.batch_size}
                                    onChange={(event) => updateNumberField("batch_size", event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="learning_rate">Learning rate</Label>
                                <Input
                                    id="learning_rate"
                                    type="number"
                                    step="0.0001"
                                    min={0.0001}
                                    max={1}
                                    value={settings.learning_rate}
                                    onChange={(event) => updateNumberField("learning_rate", event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="validation_split">Validation split</Label>
                                <Input
                                    id="validation_split"
                                    type="number"
                                    step="0.01"
                                    min={0.01}
                                    max={0.99}
                                    value={settings.validation_split}
                                    onChange={(event) => updateNumberField("validation_split", event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="input_size">Input size</Label>
                                <Input
                                    id="input_size"
                                    type="number"
                                    min={1}
                                    max={512}
                                    value={settings.input_size}
                                    onChange={(event) => updateNumberField("input_size", event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hidden_size">Hidden size</Label>
                                <Input
                                    id="hidden_size"
                                    type="number"
                                    min={1}
                                    max={512}
                                    value={settings.hidden_size}
                                    onChange={(event) => updateNumberField("hidden_size", event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="random_seed">Random seed</Label>
                                <Input
                                    id="random_seed"
                                    type="number"
                                    min={0}
                                    value={settings.random_seed}
                                    onChange={(event) => updateNumberField("random_seed", event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="early_stopping_patience">Early stopping patience</Label>
                                <Input
                                    id="early_stopping_patience"
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={settings.early_stopping_patience}
                                    onChange={(event) => updateNumberField("early_stopping_patience", event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="early_stopping_min_delta">Early stopping min delta</Label>
                                <Input
                                    id="early_stopping_min_delta"
                                    type="number"
                                    step="0.0001"
                                    min={0}
                                    value={settings.early_stopping_min_delta}
                                    onChange={(event) => updateNumberField("early_stopping_min_delta", event.target.value)}
                                />
                            </div>
                            <div className="space-y-2 rounded-lg border border-border/50 bg-background/60 p-3 md:col-span-2 xl:col-span-1">
                                <Label className="flex items-center gap-2 text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-border"
                                        checked={settings.preview_only}
                                        onChange={(event) =>
                                            setSettings((current) => ({
                                                ...current,
                                                preview_only: event.target.checked,
                                            }))
                                        }
                                    />
                                    Preview mode
                                </Label>
                            </div>
                            <div className="space-y-2 rounded-lg border border-border/50 bg-background/60 p-3 md:col-span-2 xl:col-span-1">
                                <Label className="flex items-center gap-2 text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-border"
                                        checked={settings.enable_early_stopping}
                                        onChange={(event) =>
                                            setSettings((current) => ({
                                                ...current,
                                                enable_early_stopping: event.target.checked,
                                            }))
                                        }
                                    />
                                    Enable early stopping
                                </Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle>Ready for analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Run the simulation to open the detailed federated results drawer.
                    </CardContent>
                </Card>
            </div>

            <Drawer open={showResultsDrawer} onOpenChange={setShowResultsDrawer}>
                <DrawerContent>
                    <div className="flex h-full flex-col">
                        <DrawerHeader>
                            <DrawerTitle>Federated Simulation Results</DrawerTitle>
                            <DrawerDescription>
                                Backend summary for the configured federated learning run.
                            </DrawerDescription>
                        </DrawerHeader>

                        <div className="flex-1 space-y-6 overflow-y-auto p-6 pt-0">
                            {result && (
                                <>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <Card className="glass-panel">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">Participating Clients</CardTitle>
                                                <Network className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{result.config.number_of_clients}</div>
                                                <p className="text-xs text-muted-foreground mt-1">Synthetic clients used by the backend simulation</p>
                                            </CardContent>
                                        </Card>

                                        <Card className="glass-panel">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">Aggregation Rounds</CardTitle>
                                                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{result.round_metrics.length}</div>
                                                <p className="text-xs text-muted-foreground mt-1">Best round #{result.best_round + 1}</p>
                                            </CardContent>
                                        </Card>

                                        <Card className="glass-panel">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">Best Validation Loss</CardTitle>
                                                <Activity className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{result.best_val_loss.toFixed(6)}</div>
                                                <p className="text-xs text-green-500 mt-1 flex items-center">
                                                    <TrendingUp className="h-3 w-3 mr-1" /> Lower is better
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card className="glass-panel">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">Model Artifact</CardTitle>
                                                <Shield className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-blue-500">{result.stopped_early ? "Early stop" : "Full run"}</div>
                                                <p className="text-xs text-muted-foreground mt-1">{result.best_model_path}</p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="grid gap-6 lg:grid-cols-3">
                                        <Card className="glass-panel lg:col-span-2">
                                            <CardHeader>
                                                <CardTitle>Round Metrics</CardTitle>
                                                <CardDescription>Loss and accuracy evolution returned by the backend simulation.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="h-[360px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={roundChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                                                        <XAxis dataKey="round" />
                                                        <YAxis />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: "hsl(var(--card))",
                                                                borderColor: "hsl(var(--border))",
                                                                borderRadius: 12,
                                                            }}
                                                        />
                                                        <Legend />
                                                        <Line type="monotone" dataKey="Train Accuracy" stroke="#22c55e" strokeWidth={2} dot={false} />
                                                        <Line type="monotone" dataKey="Val Accuracy" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                                        <Line type="monotone" dataKey="Train Loss" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                                        <Line type="monotone" dataKey="Val Loss" stroke="#ef4444" strokeWidth={2} dot={false} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>

                                        <Card className="glass-panel">
                                            <CardHeader>
                                                <CardTitle>Backend Summary</CardTitle>
                                                <CardDescription>Configuration and aggregation details.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3 text-sm">
                                                <div className="rounded-xl border border-border/50 bg-background/60 p-3">
                                                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Status</div>
                                                    <div className="mt-1 font-semibold">{result.status}</div>
                                                </div>
                                                <div className="rounded-xl border border-border/50 bg-background/60 p-3">
                                                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Best Round</div>
                                                    <div className="mt-1 font-semibold">#{result.best_round + 1}</div>
                                                </div>
                                                <div className="rounded-xl border border-border/50 bg-background/60 p-3">
                                                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Global Keys</div>
                                                    <div className="mt-1 font-semibold">{result.global_keys.length}</div>
                                                </div>
                                                <div className="rounded-xl border border-border/50 bg-background/60 p-3">
                                                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Local Epochs</div>
                                                    <div className="mt-1 font-semibold">{result.config.local_epochs}</div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Card className="glass-panel">
                                        <CardHeader>
                                            <CardTitle>Round History</CardTitle>
                                            <CardDescription>Per-round averages from client training and validation.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="overflow-x-auto">
                                            <table className="w-full min-w-[720px] text-sm">
                                                <thead className="text-left text-muted-foreground">
                                                    <tr>
                                                        <th className="py-2 pr-4">Round</th>
                                                        <th className="py-2 pr-4">Clients</th>
                                                        <th className="py-2 pr-4">Train Loss</th>
                                                        <th className="py-2 pr-4">Train Acc</th>
                                                        <th className="py-2 pr-4">Val Loss</th>
                                                        <th className="py-2 pr-4">Val Acc</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {result.round_metrics.map((round) => (
                                                        <tr key={round.round_number} className="border-t border-border/50">
                                                            <td className="py-2 pr-4 font-medium">#{round.round_number + 1}</td>
                                                            <td className="py-2 pr-4">{round.participating_clients}</td>
                                                            <td className="py-2 pr-4 font-mono">{round.average_client_loss.toFixed(4)}</td>
                                                            <td className="py-2 pr-4 font-mono">{(round.average_client_accuracy * 100).toFixed(2)}%</td>
                                                            <td className="py-2 pr-4 font-mono">{round.average_val_loss.toFixed(4)}</td>
                                                            <td className="py-2 pr-4 font-mono">{(round.average_val_accuracy * 100).toFixed(2)}%</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </CardContent>
                                    </Card>

                                    {lastRound && (
                                        <Card className="glass-panel">
                                            <CardHeader>
                                                <CardTitle>Latest Round Snapshot</CardTitle>
                                                <CardDescription>Quick view of the final aggregated round.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                                <div className="rounded-xl border border-border/50 bg-background/60 p-3">
                                                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Clients</div>
                                                    <div className="mt-1 font-semibold">{lastRound.participating_clients}</div>
                                                </div>
                                                <div className="rounded-xl border border-border/50 bg-background/60 p-3">
                                                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Train Loss</div>
                                                    <div className="mt-1 font-semibold">{lastRound.average_client_loss.toFixed(4)}</div>
                                                </div>
                                                <div className="rounded-xl border border-border/50 bg-background/60 p-3">
                                                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Val Loss</div>
                                                    <div className="mt-1 font-semibold">{lastRound.average_val_loss.toFixed(4)}</div>
                                                </div>
                                                <div className="rounded-xl border border-border/50 bg-background/60 p-3">
                                                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Val Accuracy</div>
                                                    <div className="mt-1 font-semibold">{(lastRound.average_val_accuracy * 100).toFixed(2)}%</div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {result.global_keys.length > 0 && (
                                        <Card className="glass-panel">
                                            <CardHeader>
                                                <CardTitle>Global Model Keys</CardTitle>
                                                <CardDescription>Parameter keys saved in the aggregated model state.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex flex-wrap gap-2">
                                                {result.global_keys.slice(0, 12).map((key) => (
                                                    <Badge key={key} variant="outline" className="font-mono">
                                                        {key}
                                                    </Badge>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="border-t p-6">
                            <DrawerClose asChild>
                                <Button variant="outline" className="w-full">
                                    Close results
                                </Button>
                            </DrawerClose>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    )
}
