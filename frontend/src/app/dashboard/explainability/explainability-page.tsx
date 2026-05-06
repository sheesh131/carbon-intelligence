import { useState } from "react"
import { AlertTriangle, BrainCircuit, Lightbulb, Loader2 } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { predictionAPI, validateApplicationData } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import type { CreditApplication, PredictionResponse } from "@/types/api"

type ExplanationFactor = NonNullable<NonNullable<PredictionResponse["explanation"]>["top_factors"]>[number]

type ApplicationForm = Partial<CreditApplication>

const humanizeFactorName = (name: string) =>
    name.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

const getFactorLabel = (factor: ExplanationFactor) => {
    const rawLabel = factor.label ?? factor.name ?? factor.feature ?? ""
    return rawLabel ? humanizeFactorName(rawLabel) : "Unknown Factor"
}

const getFactorImpact = (factor: ExplanationFactor) => {
    if (factor.impact === "risk_increase" || factor.impact === "risk_decrease" || factor.impact === "neutral") {
        return factor.impact
    }

    if (typeof factor.contribution === "number") {
        if (factor.contribution > 0) return "risk_increase"
        if (factor.contribution < 0) return "risk_decrease"
    }

    return "neutral"
}

const getFactorContribution = (factor: ExplanationFactor) =>
    typeof factor.contribution === "number" ? factor.contribution : 0

const buildFactorDescription = (factor: ExplanationFactor) => {
    if (factor.description) {
        return factor.description
    }

    const label = getFactorLabel(factor)
    const impact = getFactorImpact(factor)
    const direction =
        impact === "risk_increase"
            ? "increasing"
            : impact === "risk_decrease"
                ? "reducing"
                : "having little effect on"

    if (factor.value === undefined || factor.value === null || factor.value === "") {
        return `${label} is ${direction} the predicted risk.`
    }

    return `${label} (${String(factor.value)}) is ${direction} the predicted risk.`
}

const defaultForm: ApplicationForm = {
    age: 30,
    credit_score: 720,
    loan_amount: 5000,
    income: 50000,
    employment_length: 5,
    debt_to_income_ratio: 0.25,
    loan_purpose: "home_improvement",
    home_ownership: "rent",
    verification_status: "verified",
}

const riskStyleMap: Record<string, { border: string; badge: string }> = {
    low: { border: "border-l-green-500", badge: "bg-green-500 text-white" },
    medium: { border: "border-l-yellow-500", badge: "bg-yellow-500 text-black" },
    high: { border: "border-l-orange-500", badge: "bg-orange-500 text-white" },
    very_high: { border: "border-l-destructive", badge: "bg-destructive text-white" },
}

export default function ExplainabilityPage() {
    const [formData, setFormData] = useState<ApplicationForm>(defaultForm)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<PredictionResponse | null>(null)
    const [showResultsDrawer, setShowResultsDrawer] = useState(false)

    const explanationFactors = result?.explanation?.top_factors ?? []
    const factorChartData = explanationFactors.map((factor) => ({
        label: getFactorLabel(factor),
        contribution: Math.abs(getFactorContribution(factor)),
        rawContribution: getFactorContribution(factor),
        impact: getFactorImpact(factor),
    }))

    const selectedRiskLevel = result?.risk_level ? String(result.risk_level) : "medium"
    const riskStyle = riskStyleMap[selectedRiskLevel] ?? riskStyleMap.medium

    const updateNumberField = <K extends keyof ApplicationForm>(key: K, value: string) => {
        setFormData((current) => ({
            ...current,
            [key]: value === "" ? current[key] : Number(value),
        }))
    }

    const handleExplain = async () => {
        setLoading(true)
        setError(null)

        try {
            const validation = validateApplicationData(formData)
            if (!validation.valid) {
                setError(validation.errors.join(", "))
                return
            }

            const response = await predictionAPI.predict({
                application: formData as CreditApplication,
                include_explanation: true,
                explanation_type: "shap",
                track_sustainability: false,
            })

            setResult(response)
            setShowResultsDrawer(true)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unable to generate explanation")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Explainable AI</h2>
                    </div>
                </div>

                <Card className="glass-panel border-t-4 border-t-primary shadow-lg">
                    <CardHeader>
                        <CardTitle>Applicant Input</CardTitle>
                        <CardDescription>
                            Enter a credit application and generate an explanation from the backend.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="age">Age (yrs)</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    min="18"
                                    max="100"
                                    value={formData.age || ""}
                                    onChange={(event) => updateNumberField("age", event.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="credit_score">Credit Score</Label>
                                <Input
                                    id="credit_score"
                                    type="number"
                                    min="300"
                                    max="850"
                                    value={formData.credit_score || ""}
                                    onChange={(event) => updateNumberField("credit_score", event.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="loan_amount">Loan Amount ($)</Label>
                                <Input
                                    id="loan_amount"
                                    type="number"
                                    min="1000"
                                    value={formData.loan_amount || ""}
                                    onChange={(event) => updateNumberField("loan_amount", event.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="income">Annual Income ($)</Label>
                                <Input
                                    id="income"
                                    type="number"
                                    min="0"
                                    value={formData.income || ""}
                                    onChange={(event) => updateNumberField("income", event.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="employment_length">Employment Length (yrs)</Label>
                                <Input
                                    id="employment_length"
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={formData.employment_length || ""}
                                    onChange={(event) => updateNumberField("employment_length", event.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="debt_to_income_ratio">Debt-to-Income Ratio (0-1)</Label>
                                <Input
                                    id="debt_to_income_ratio"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    value={formData.debt_to_income_ratio || ""}
                                    onChange={(event) => updateNumberField("debt_to_income_ratio", event.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Loan Purpose</Label>
                                <Select
                                    value={formData.loan_purpose || ""}
                                    onValueChange={(value) => setFormData({ ...formData, loan_purpose: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select purpose" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="debt_consolidation">Debt Consolidation</SelectItem>
                                        <SelectItem value="home_improvement">Home Improvement</SelectItem>
                                        <SelectItem value="major_purchase">Major Purchase</SelectItem>
                                        <SelectItem value="medical">Medical</SelectItem>
                                        <SelectItem value="vacation">Vacation</SelectItem>
                                        <SelectItem value="wedding">Wedding</SelectItem>
                                        <SelectItem value="moving">Moving</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Home Ownership</Label>
                                <Select
                                    value={formData.home_ownership || ""}
                                    onValueChange={(value) => setFormData({ ...formData, home_ownership: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="own">Own</SelectItem>
                                        <SelectItem value="rent">Rent</SelectItem>
                                        <SelectItem value="mortgage">Mortgage</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Verification Status</Label>
                                <Select
                                    value={formData.verification_status || ""}
                                    onValueChange={(value) => setFormData({ ...formData, verification_status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="verified">Verified</SelectItem>
                                        <SelectItem value="source_verified">Source Verified</SelectItem>
                                        <SelectItem value="not_verified">Not Verified</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BrainCircuit className="h-5 w-5 text-primary" />
                            Ready to explain
                        </CardTitle>
                        <CardDescription>
                            Generate the backend explanation and open the result drawer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="group relative h-12 w-full overflow-hidden bg-primary text-lg font-semibold hover:bg-primary/90"
                            onClick={handleExplain}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Explanation...
                                </>
                            ) : (
                                <>
                                    <Lightbulb className="mr-2 h-5 w-5 transition-transform group-hover:scale-125" />
                                    Run Explanation
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Drawer open={showResultsDrawer} onOpenChange={setShowResultsDrawer}>
                <DrawerContent>
                    <div className="flex h-full flex-col">
                        <DrawerHeader>
                            <DrawerTitle>Explainability Results</DrawerTitle>
                            <DrawerDescription>
                                Backend explanation for the submitted credit application.
                            </DrawerDescription>
                        </DrawerHeader>

                        <div className="flex-1 space-y-6 overflow-y-auto p-6 pt-0">
                            {result && (
                                <>
                                    <Card className={cn("overflow-hidden border-l-4 shadow-lg", riskStyle.border)}>
                                        <CardHeader className="bg-muted/30 pb-2">
                                            <CardTitle className="flex items-center justify-between text-lg">
                                                Risk Verdict
                                                <span className={cn("rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest", riskStyle.badge)}>
                                                    {String(result.risk_level).replace("_", " ")}
                                                </span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid gap-4 pt-6 md:grid-cols-2 xl:grid-cols-4">
                                            <div className="rounded-xl border border-border/50 bg-background/60 p-4">
                                                <div className="text-xs uppercase tracking-widest text-muted-foreground">Risk Score</div>
                                                <div className="mt-1 text-2xl font-black">{Math.round(result.risk_score * 100)}%</div>
                                            </div>
                                            <div className="rounded-xl border border-border/50 bg-background/60 p-4">
                                                <div className="text-xs uppercase tracking-widest text-muted-foreground">Confidence</div>
                                                <div className="mt-1 text-2xl font-black">{(result.confidence * 100).toFixed(1)}%</div>
                                            </div>
                                            <div className="rounded-xl border border-border/50 bg-background/60 p-4">
                                                <div className="text-xs uppercase tracking-widest text-muted-foreground">Model Version</div>
                                                <div className="mt-1 text-sm font-semibold">{result.model_version}</div>
                                            </div>
                                            <div className="rounded-xl border border-border/50 bg-background/60 p-4">
                                                <div className="text-xs uppercase tracking-widest text-muted-foreground">Processing Time</div>
                                                <div className="mt-1 text-sm font-semibold">{result.processing_time_ms.toFixed(0)} ms</div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="grid gap-6 lg:grid-cols-3">
                                        <Card className="glass-panel lg:col-span-2">
                                            <CardHeader>
                                                <CardTitle>Top Factors</CardTitle>
                                                <CardDescription>
                                                    The backend explanation returns the strongest contributors for this prediction.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {explanationFactors.length > 0 ? (
                                                    <>
                                                        <div className="h-[320px]">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <BarChart data={factorChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                                                                    <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                                                                    <XAxis dataKey="label" interval={0} tick={{ fontSize: 11 }} />
                                                                    <YAxis />
                                                                    <Tooltip
                                                                        contentStyle={{
                                                                            backgroundColor: "hsl(var(--card))",
                                                                            borderColor: "hsl(var(--border))",
                                                                            borderRadius: 12,
                                                                        }}
                                                                        formatter={(value, _, payload) => [
                                                                            `${Number(value ?? 0).toFixed(4)} contribution`,
                                                                            (payload?.payload as { impact?: string } | undefined)?.impact === "risk_decrease"
                                                                                ? "Risk reduction"
                                                                                : "Risk increase",
                                                                        ]}
                                                                    />
                                                                    <Bar dataKey="contribution">
                                                                        {factorChartData.map((factor, index) => (
                                                                            <Cell
                                                                                key={`${factor.label}-${index}`}
                                                                                fill={factor.impact === "risk_decrease" ? "#22c55e" : factor.impact === "risk_increase" ? "#ef4444" : "#6b7280"}
                                                                            />
                                                                        ))}
                                                                    </Bar>
                                                                </BarChart>
                                                            </ResponsiveContainer>
                                                        </div>

                                                        <div className="space-y-3">
                                                            {explanationFactors.map((factor) => {
                                                                const impact = getFactorImpact(factor)
                                                                const contribution = getFactorContribution(factor)
                                                                return (
                                                                    <div key={`${factor.feature ?? factor.label ?? factor.name}`} className="rounded-xl border border-border/50 bg-background/60 p-4">
                                                                        <div className="flex items-start justify-between gap-4">
                                                                            <div>
                                                                                <div className="font-semibold">{getFactorLabel(factor)}</div>
                                                                                <div className="mt-1 text-sm text-muted-foreground">{buildFactorDescription(factor)}</div>
                                                                            </div>
                                                                            <div
                                                                                className={cn(
                                                                                    "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest",
                                                                                    impact === "risk_decrease"
                                                                                        ? "bg-green-500/10 text-green-600"
                                                                                        : impact === "risk_increase"
                                                                                            ? "bg-red-500/10 text-red-600"
                                                                                            : "bg-muted text-muted-foreground"
                                                                                )}
                                                                            >
                                                                                {contribution >= 0 ? "+" : ""}{contribution.toFixed(4)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="rounded-xl border border-border/50 bg-background/60 p-4 text-sm text-muted-foreground">
                                                        No top-factor explanation was returned by the backend for this prediction.
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card className="glass-panel">
                                            <CardHeader>
                                                <CardTitle>Prediction Summary</CardTitle>
                                                <CardDescription>
                                                    The backend summary captures the main explanation in a single sentence.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3 text-sm">
                                                <div className="rounded-xl border border-border/50 bg-background/60 p-3">
                                                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Status</div>
                                                    <div className="mt-1 font-semibold">{result.status}</div>
                                                </div>
                                                <div className="rounded-xl border border-border/50 bg-background/60 p-3">
                                                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Summary</div>
                                                    <div className="mt-1 text-sm leading-relaxed text-foreground">
                                                        {result.explanation?.summary ?? result.message}
                                                    </div>
                                                </div>
                                                <div className="rounded-xl border border-border/50 bg-background/60 p-3">
                                                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Prediction ID</div>
                                                    <div className="mt-1 font-semibold">{result.prediction_id}</div>
                                                </div>
                                                <div className="rounded-xl border border-border/50 bg-background/60 p-3">
                                                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Timestamp</div>
                                                    <div className="mt-1 text-sm font-semibold">{new Date(result.prediction_timestamp).toLocaleString()}</div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {result.explanation?.feature_importance && Object.keys(result.explanation.feature_importance).length > 0 && (
                                        <Card className="glass-panel">
                                            <CardHeader>
                                                <CardTitle>Feature Importance Map</CardTitle>
                                                <CardDescription>
                                                    Raw feature importance values returned by the backend explainability service.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex flex-wrap gap-2">
                                                {Object.entries(result.explanation.feature_importance)
                                                    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
                                                    .slice(0, 12)
                                                    .map(([feature, value]) => (
                                                        <div key={feature} className="rounded-full border border-border/50 bg-background/60 px-3 py-1 text-xs font-mono">
                                                            {feature}: {value.toFixed(4)}
                                                        </div>
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
