import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, Info, Leaf, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { predictionAPI, validateApplicationData } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth-store"
import type { CreditApplication, PredictionResponse } from "@/types/api"

type ExplanationFactor = NonNullable<
    NonNullable<PredictionResponse["explanation"]>["top_factors"]
>[number]

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

export default function PredictionPage() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<PredictionResponse | null>(null)
    const [showResultsDrawer, setShowResultsDrawer] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user) {
            navigate("/auth/login")
        }
    }, [user, navigate])

    const [formData, setFormData] = useState<Partial<CreditApplication>>({
        age: 30,
        credit_score: 720,
        loan_amount: 5000,
        income: 50000,
        employment_length: 5,
        debt_to_income_ratio: 0.25,
        loan_purpose: "home_improvement",
        home_ownership: "rent",
        verification_status: "verified",
    })

    const handlePredict = async () => {
        setLoading(true)
        setResult(null)
        setError(null)

        try {
            const validation = validateApplicationData(formData)
            if (!validation.valid) {
                setError(validation.errors.join(", "))
                setLoading(false)
                return
            }

            const response = await predictionAPI.predict({
                application: formData as CreditApplication,
                include_explanation: true,
                explanation_type: "shap",
                track_sustainability: true,
            })

            setResult(response)
            setShowResultsDrawer(true)
        } catch (err: unknown) {
            console.error("Prediction Error:", err)
            setError(err instanceof Error ? err.message : "An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Loan Prediction</h2>
                        <p className="text-muted-foreground">
                            AI-powered real-time credit risk assessment.
                        </p>
                    </div>
                </div>

                <Card className="glass-panel border-t-4 border-t-primary shadow-lg">
                    <CardHeader>
                        <CardTitle>Applicant Analysis</CardTitle>
                        <CardDescription>
                            Provide financial data for risk evaluation and carbon tracking.
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
                                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
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
                                    onChange={(e) => setFormData({ ...formData, credit_score: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount">Loan Amount ($)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    min="1000"
                                    value={formData.loan_amount || ""}
                                    onChange={(e) => setFormData({ ...formData, loan_amount: parseFloat(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="income">Annual Income ($)</Label>
                                <Input
                                    id="income"
                                    type="number"
                                    min="0"
                                    value={formData.income || ""}
                                    onChange={(e) => setFormData({ ...formData, income: parseFloat(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="employment">Employment Length (yrs)</Label>
                                <Input
                                    id="employment"
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={formData.employment_length || ""}
                                    onChange={(e) => setFormData({ ...formData, employment_length: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dti">Debt-to-Income Ratio (0-1)</Label>
                                <Input
                                    id="dti"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    value={formData.debt_to_income_ratio || ""}
                                    onChange={(e) => setFormData({ ...formData, debt_to_income_ratio: parseFloat(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Loan Purpose</Label>
                                <Select
                                    value={formData.loan_purpose || ""}
                                    onValueChange={(v) => setFormData({ ...formData, loan_purpose: v })}
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
                                    onValueChange={(v) => setFormData({ ...formData, home_ownership: v })}
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
                                    onValueChange={(v) => setFormData({ ...formData, verification_status: v })}
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

                    <CardFooter>
                        <Button
                            className="group relative h-12 w-full overflow-hidden bg-primary text-lg font-semibold hover:bg-primary/90"
                            onClick={handlePredict}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Zap className="mr-2 h-5 w-5 animate-spin" /> Analyzing Risk Profile...
                                </>
                            ) : (
                                <>
                                    <Zap className="mr-2 h-5 w-5 transition-transform group-hover:scale-125" /> Run Risk Prediction
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                {error && (
                    <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showResultsDrawer && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowResultsDrawer(false)}
                        />

                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 240 }}
                            className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl border-l border-border bg-background shadow-2xl"
                        >
                            <div className="flex h-full flex-col p-6">
                                <div className="mb-6 flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold">Prediction Results</h2>
                                        <p className="mt-1 text-sm text-muted-foreground">Complete risk assessment analysis</p>
                                    </div>

                                    <button
                                        onClick={() => setShowResultsDrawer(false)}
                                        className="rounded-lg p-2 transition-colors hover:bg-muted"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="flex-1 space-y-6 overflow-y-auto pr-1">
                                    {result && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className="space-y-6"
                                        >
                                            <Card
                                                className={cn(
                                                    "overflow-hidden border-l-4 shadow-lg",
                                                    result.risk_level === "low"
                                                        ? "border-l-green-500"
                                                        : result.risk_level === "medium"
                                                            ? "border-l-yellow-500"
                                                            : result.risk_level === "high"
                                                                ? "border-l-orange-500"
                                                                : "border-l-destructive"
                                                )}
                                            >
                                                <CardHeader className="bg-muted/30 pb-2">
                                                    <CardTitle className="flex items-center justify-between text-lg">
                                                        Risk Verdict
                                                        <span
                                                            className={cn(
                                                                "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                                                                result.risk_level === "low"
                                                                    ? "bg-green-500 text-white"
                                                                    : result.risk_level === "medium"
                                                                        ? "bg-yellow-500 text-black"
                                                                        : result.risk_level === "high"
                                                                            ? "bg-orange-500 text-white"
                                                                            : "bg-destructive text-white"
                                                            )}
                                                        >
                                                            {result.risk_level.replace("_", " ")}
                                                        </span>
                                                    </CardTitle>
                                                </CardHeader>

                                                <CardContent className="space-y-6 pt-6">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div className="relative flex h-40 w-40 items-center justify-center">
                                                            <svg className="h-full w-full -rotate-90 transform">
                                                                <circle
                                                                    cx="80"
                                                                    cy="80"
                                                                    r="72"
                                                                    stroke="currentColor"
                                                                    strokeWidth="12"
                                                                    fill="transparent"
                                                                    className="text-muted/10"
                                                                />
                                                                <circle
                                                                    cx="80"
                                                                    cy="80"
                                                                    r="72"
                                                                    stroke="currentColor"
                                                                    strokeWidth="12"
                                                                    fill="transparent"
                                                                    strokeDasharray={452.39}
                                                                    strokeDashoffset={452.39 * (1 - result.risk_score)}
                                                                    className={cn(
                                                                        "transition-all duration-1500 ease-in-out",
                                                                        result.risk_level === "low"
                                                                            ? "text-green-500"
                                                                            : result.risk_level === "medium"
                                                                                ? "text-yellow-500"
                                                                                : result.risk_level === "high"
                                                                                    ? "text-orange-500"
                                                                                    : "text-destructive"
                                                                    )}
                                                                />
                                                            </svg>

                                                            <div className="absolute flex flex-col items-center">
                                                                <span className="text-4xl font-black">{Math.round(result.risk_score * 100)}</span>
                                                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                                    Risk Score
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="flex flex-col items-center rounded-xl border border-border/50 bg-muted/40 p-4">
                                                            <span className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">Confidence</span>
                                                            <span className="text-xl font-black text-primary">{(result.confidence * 100).toFixed(1)}%</span>
                                                        </div>

                                                        <div className="flex flex-col items-center rounded-xl border border-border/50 bg-muted/40 p-4">
                                                            <span className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">Model</span>
                                                            <span className="font-mono text-xl font-bold">v{result.model_version}</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3 border-t border-border pt-4">
                                                        <h4 className="mb-2 flex items-center gap-2 text-sm font-bold">
                                                            <Info className="h-4 w-4 text-primary" /> Explanation
                                                        </h4>

                                                        {result.explanation ? (
                                                            <div className="space-y-3">
                                                                {result.explanation.summary && (
                                                                    <p className="rounded-lg border border-border/20 bg-background/50 p-3 text-xs leading-relaxed">
                                                                        {result.explanation.summary}
                                                                    </p>
                                                                )}

                                                                {result.explanation.top_factors && result.explanation.top_factors.length > 0 && (
                                                                    <div className="space-y-2">
                                                                        <p className="text-xs font-semibold text-muted-foreground">Top Factors:</p>
                                                                        {result.explanation.top_factors.map((factor, idx) => (
                                                                            <div
                                                                                key={`${factor.feature ?? factor.name ?? factor.label ?? idx}`}
                                                                                className="flex items-center justify-between rounded-lg border border-border/20 bg-background/50 p-2 text-xs"
                                                                            >
                                                                                <div className="min-w-0 flex-1">
                                                                                    <p className="truncate font-medium">
                                                                                        {getFactorLabel(factor)}
                                                                                    </p>
                                                                                    {buildFactorDescription(factor) && (
                                                                                        <p className="mt-1 text-[10px] text-muted-foreground">
                                                                                            {buildFactorDescription(factor)}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                                <span
                                                                                    className={cn(
                                                                                        "ml-3 shrink-0 font-mono font-bold",
                                                                                        getFactorContribution(factor) > 0 ? "text-red-500" : "text-green-500"
                                                                                    )}
                                                                                >
                                                                                    {getFactorContribution(factor) > 0 ? "+" : ""}
                                                                                    {(getFactorContribution(factor) * 100).toFixed(1)}%
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground">No explanation available</p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2 font-mono text-[9px] text-muted-foreground">
                                                        <span>ID: {result.prediction_id}</span>
                                                        <span>{new Date(result.prediction_timestamp).toLocaleTimeString()}</span>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {result.sustainability_metrics && (
                                                <Card className="glass-panel mt-6 border-l-4 border-l-primary bg-primary/5 shadow-md">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter text-primary">
                                                            <Leaf className="h-4 w-4" />
                                                            Sustainability Analytics
                                                        </CardTitle>
                                                    </CardHeader>

                                                    <CardContent className="space-y-3 pt-2">
                                                        {result.sustainability_metrics.carbon_emissions !== undefined && (
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-muted-foreground">Carbon Emissions</span>
                                                                <span className="font-mono font-bold">
                                                                    {result.sustainability_metrics.carbon_emissions.toFixed(6)} gCO2e
                                                                </span>
                                                            </div>
                                                        )}

                                                        {result.sustainability_metrics.energy_kwh !== undefined && (
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-muted-foreground">Energy Consumed</span>
                                                                <span className="font-mono font-bold">
                                                                    {result.sustainability_metrics.energy_kwh.toFixed(6)} kWh
                                                                </span>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </motion.div>
                                    )}
                                </div>

                                <div className="mt-6 flex gap-3 border-t pt-6">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowResultsDrawer(false)}
                                    >
                                        Close
                                    </Button>

                                    <Button
                                        className="flex-1"
                                        onClick={() => {
                                            setShowResultsDrawer(false)
                                            setResult(null)
                                        }}
                                    >
                                        New Assessment
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
