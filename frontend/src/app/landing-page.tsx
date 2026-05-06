import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Leaf, Zap, Shield, Brain, TrendingDown, Network, BarChart3, Database, Activity, Target, Mail, MapPin, Phone, Github, Linkedin, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"

const features = [
    {
        icon: Brain,
        color: "#3b82f6",
        title: "Neural Architecture Search",
        desc: "Carbon-aware NAS that jointly optimizes performance and sustainability across model depths and precisions.",
        stat: "AUC 0.954",
    },
    {
        icon: Leaf,
        color: "#22c55e",
        title: "83% Carbon Reduction",
        desc: "Massive, verified sustainability improvement from FP32 baseline to INT8 optimal — with minimal accuracy loss.",
        stat: "512 → 87 gCO₂",
    },
    {
        icon: Zap,
        color: "#eab308",
        title: "Dynamic Precision Scaling",
        desc: "Adaptive execution engine that fluidly shifts between FP32, FP16, and INT8 based on input complexity.",
        stat: "3× faster",
    },
    {
        icon: TrendingDown,
        color: "#f87171",
        title: "Credit Risk Modeling",
        desc: "Sustainable loan default prediction validated on real banking datasets with state-of-the-art results.",
        stat: "Bank + German",
    },
    {
        icon: Shield,
        color: "#a855f7",
        title: "Federated Learning",
        desc: "Secure, privacy-preserving distributed model training for financial institutions without data sharing.",
        stat: "Privacy-first",
    },
    {
        icon: Network,
        color: "#22d3ee",
        title: "Explainable AI",
        desc: "SHAP-based feature attribution that makes every model decision fully transparent and auditable.",
        stat: "SHAP values",
    },
]

// Particle component that floats around the orb
function Particle({ angle, radius, color, duration }: { angle: number; radius: number; color: string; duration: number }) {
    return (
        <motion.div
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
                background: color,
                boxShadow: `0 0 6px 2px ${color}`,
                top: "50%",
                left: "50%",
                x: Math.cos(angle) * radius - 3,
                y: Math.sin(angle) * radius - 3,
            }}
            animate={{
                x: [
                    Math.cos(angle) * radius - 3,
                    Math.cos(angle + Math.PI * 2) * radius - 3,
                ],
                y: [
                    Math.sin(angle) * radius - 3,
                    Math.sin(angle + Math.PI * 2) * radius - 3,
                ],
                opacity: [0.4, 1, 0.4],
            }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
        />
    )
}

function Counter({ value, color }: { value: number; color?: string }) {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        let start = displayValue
        const end = value
        const duration = 2
        const startTime = performance.now()

        const animate = (currentTime: number) => {
            const elapsed = (currentTime - startTime) / 1000
            const progress = Math.min(elapsed / duration, 1)
            const easeOutQuad = (t: number) => t * (2 - t)
            const current = Math.floor(start + (end - start) * easeOutQuad(progress))

            setDisplayValue(current)

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }, [value])

    return <span style={{ color }}>{displayValue}g</span>
}

function BenchmarkVisual({ dataset }: { dataset: 'bank' | 'german' }) {
    const isBank = dataset === 'bank'
    const colorA = "#ef4444" // FP32 Hot
    const colorB = "#10b981" // INT8 Cool

    return (
        <div className="relative w-full h-full flex items-center justify-center rounded-3xl overflow-hidden bg-slate-950/40 border border-white/5 shadow-2xl">
            {/* Cinematic Grid Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Efficiency Bridge (SVG Path) with Flowing Energy */}
            <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                <defs>
                    <linearGradient id="bridge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={colorA} />
                        <stop offset="100%" stopColor={colorB} />
                    </linearGradient>
                    <filter id="glow-pulse">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Background Connection Path */}
                <motion.path
                    d="M 140,200 Q 250,110 360,200"
                    fill="none"
                    stroke="url(#bridge-gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{ opacity: 0.15 }}
                />

                {/* Animated Energy Flow */}
                <motion.path
                    d="M 140,200 Q 250,110 360,200"
                    fill="none"
                    stroke="url(#bridge-gradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="10 120"
                    filter="url(#glow-pulse)"
                    animate={{ strokeDashoffset: [260, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                />
            </svg>

            <div className="flex items-center justify-between w-full px-16 relative z-10">
                {/* Traditional State (FP32) */}
                <div className="flex flex-col items-center gap-8">
                    <div className="relative group">
                        {/* Multi-layered Atmospheric Glow */}
                        <motion.div
                            className="w-48 h-48 rounded-full blur-[80px] absolute inset-1/2 -translate-x-1/2 -translate-y-1/2"
                            style={{ background: colorA, opacity: 0.15 }}
                            animate={{ scale: [1, 1.25, 1], opacity: [0.1, 0.2, 0.1] }}
                            transition={{ duration: 5, repeat: Infinity }}
                        />
                        <motion.div
                            className="w-32 h-32 rounded-full border border-red-500/20 flex items-center justify-center bg-red-950/10 backdrop-blur-xl relative z-10 shadow-inner"
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] font-black text-red-500/60 uppercase tracking-widest">Baseline</span>
                                <span className="text-sm font-black text-red-500 tracking-tighter">FP32 COST</span>
                            </div>
                        </motion.div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-black tracking-tighter text-white/90 drop-shadow-lg">
                            <Counter value={isBank ? 512 : 480} />
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-1 opacity-70">CO₂ / RUN</div>
                    </div>
                </div>

                {/* The Transformation Narrative */}
                <div className="flex flex-col items-center gap-3">
                    <div className="flex gap-1.5">
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-primary"
                                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            />
                        ))}
                    </div>
                    <div className="text-[10px] font-black text-primary/80 uppercase tracking-[0.4em] translate-x-1">Optimization</div>
                    <div className="flex gap-1.5 rotate-180">
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-primary"
                                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            />
                        ))}
                    </div>
                </div>

                {/* Sustainable State (INT8) */}
                <div className="flex flex-col items-center gap-8">
                    <div className="relative group">
                        {/* High-Energy Pulse Rings */}
                        <motion.div
                            className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full border border-emerald-500/30"
                            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "easeOut" }}
                        />
                        <motion.div
                            className="w-48 h-48 rounded-full blur-[80px] absolute inset-1/2 -translate-x-1/2 -translate-y-1/2"
                            style={{ background: colorB, opacity: 0.35 }}
                            animate={{ scale: [0.9, 1.4, 0.9], opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 4, repeat: Infinity }}
                        />
                        <motion.div
                            className="w-24 h-24 rounded-full border-2 border-emerald-500/60 flex items-center justify-center bg-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.5)] relative z-10 backdrop-blur-2xl"
                            whileHover={{ scale: 1.15 }}
                        >
                            <Leaf className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                        </motion.div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-black tracking-tighter text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                            <Counter value={isBank ? 87 : 82} color="#34d399" />
                        </div>
                        <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em] mt-1 font-mono glow-text">Sustainable</div>
                    </div>
                </div>
            </div>

            {/* Bottom Insight Overlay */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-2.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl text-[9px] font-black flex items-center gap-4 tracking-[0.2em] text-white/50 shadow-xl"
            >
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" />
                    <span>SYSTEM VALIDATED</span>
                </div>
                <div className="w-[1px] h-3 bg-white/10" />
                <span>DYNAMIC PRECISION ENGINE ACTIVE</span>
            </motion.div>
        </div>
    )
}

export default function LandingPage() {
    const navigate = useNavigate()
    const [active, setActive] = useState(0)
    const [benchmarkDataset, setBenchmarkDataset] = useState<'bank' | 'german'>('bank')
    const isPausedRef = useRef(false)
    const f = features[active]

    // Auto-cycle: setTimeout re-arms after every active change — reliable, no stale closure
    useEffect(() => {
        if (isPausedRef.current) return
        const t = setTimeout(() => {
            setActive(i => (i + 1) % features.length)
        }, 5000)
        return () => clearTimeout(t)
    }, [active])

    // Orbit angle for the 6 dots
    const orbRadius = 140
    const angles = features.map((_, i) => (i / features.length) * Math.PI * 2 - Math.PI / 2)

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="flex items-center gap-2">
                    <Leaf className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl tracking-tight">Carbon<span className="text-primary">Intel</span></span>
                </div>
                <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => navigate("/login")}>Login</Button>
                    <Button onClick={() => navigate("/login")}>Get Started</Button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
                <div className="max-w-5xl mx-auto text-center space-y-8">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                            Sustainable AI for <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                                Credit Risk Modeling
                            </span>
                        </h1>
                    </motion.div>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Reduce computational carbon footprint by 83% without sacrificing predictive performance.
                        Next-generation Neural Architecture Search for modern banking.
                    </motion.p>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Button size="lg" className="h-14 px-8 text-lg rounded-full" onClick={() => navigate("/login")}>
                            Access Platform <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full"
                            onClick={() => window.open("https://github.com", "_blank")}>
                            Read Research
                        </Button>
                    </motion.div>
                </div>
                {/* Mockup */}
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.6 }}
                    className="max-w-5xl mx-auto mt-20 p-2 md:p-4 rounded-xl border border-border bg-card/50 backdrop-blur-xl shadow-2xl relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none rounded-xl" />
                    <div className="aspect-[16/9] rounded-lg bg-muted/30 border border-muted overflow-hidden">
                        <div className="grid grid-cols-3 gap-4 p-8 w-full h-full opacity-50">
                            <div className="col-span-2 space-y-4">
                                <div className="h-8 bg-primary/20 rounded w-1/3" />
                                <div className="h-64 bg-card rounded-lg border border-border" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-32 bg-card rounded-lg border border-border" />
                                    <div className="h-32 bg-card rounded-lg border border-border" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-32 bg-primary/10 rounded-lg border border-primary/20" />
                                <div className="h-48 bg-card rounded-lg border border-border" />
                                <div className="h-32 bg-card rounded-lg border border-border" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ── FEATURES: ORBITAL SHOWCASE ── */}
            <section
                className="relative py-32 px-6 overflow-hidden bg-background"
                onMouseEnter={() => { isPausedRef.current = true }}
                onMouseLeave={() => { isPausedRef.current = false }}
            >
                {/* Deep radial bg glow that follows active color */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{ background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${f.color}18 0%, transparent 70%)` }}
                    transition={{ duration: 1 }}
                />

                {/* Subtle dot grid */}
                <div className="absolute inset-0 pointer-events-none opacity-30"
                    style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

                <div className="max-w-6xl mx-auto relative z-10">
                    {/* Section label */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="text-center mb-20">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-3">Core Capabilities</p>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Everything you need</h2>
                    </motion.div>

                    {/* ── Main showcase ── */}
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                        {/* LEFT: Orbital diagram */}
                        <div className="relative flex-shrink-0 w-[340px] h-[340px]">

                            {/* Orbit ring */}
                            <motion.div
                                className="absolute inset-0 rounded-full border border-white/10"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            />

                            {/* Orbit ring 2 (counter) */}
                            <motion.div
                                className="absolute inset-6 rounded-full border border-white/5"
                                animate={{ rotate: -360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            />

                            {/* Particles around center */}
                            {[0, 1, 2, 3].map(i => (
                                <Particle
                                    key={i}
                                    angle={(i / 4) * Math.PI * 2}
                                    radius={60}
                                    color={f.color}
                                    duration={6 + i}
                                />
                            ))}

                            {/* Central glowing orb */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    className="absolute w-28 h-28 rounded-full blur-2xl"
                                    animate={{ background: f.color, scale: [1, 1.2, 1] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", background: { duration: 0.8 } }}
                                    style={{ opacity: 0.35 }}
                                />
                                <motion.div
                                    className="relative w-20 h-20 rounded-full flex items-center justify-center border border-white/20"
                                    animate={{ boxShadow: `0 0 30px 6px ${f.color}60`, background: `${f.color}20` }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={active}
                                            initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
                                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                            exit={{ opacity: 0, scale: 0.5, rotate: 30 }}
                                            transition={{ duration: 0.4 }}
                                            style={{ color: f.color }}
                                        >
                                            <f.icon className="w-9 h-9" />
                                        </motion.span>
                                    </AnimatePresence>
                                </motion.div>
                            </div>

                            {/* Orbit nodes */}
                            {features.map((feat, i) => {
                                const a = angles[i]
                                const x = Math.cos(a) * orbRadius
                                const y = Math.sin(a) * orbRadius
                                const isActive = i === active
                                return (
                                    <motion.button
                                        key={i}
                                        onClick={() => { setActive(i); isPausedRef.current = true }}
                                        className="absolute flex items-center justify-center rounded-full border transition-all"
                                        style={{
                                            top: "50%",
                                            left: "50%",
                                            width: isActive ? 44 : 34,
                                            height: isActive ? 44 : 34,
                                            transform: `translate(${x - (isActive ? 22 : 17)}px, ${y - (isActive ? 22 : 17)}px)`,
                                        }}
                                        animate={{
                                            background: isActive ? `${feat.color}30` : "rgba(255,255,255,0.04)",
                                            borderColor: isActive ? feat.color : "rgba(255,255,255,0.15)",
                                            boxShadow: isActive ? `0 0 20px 4px ${feat.color}50` : "none",
                                        }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        {/* Pulse ring on active */}
                                        {isActive && (
                                            <motion.span
                                                className="absolute inset-0 rounded-full"
                                                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                                                transition={{ duration: 1.2, repeat: Infinity }}
                                                style={{ border: `2px solid ${feat.color}` }}
                                            />
                                        )}
                                        <span style={{ color: feat.color }}>
                                            <feat.icon className="w-4 h-4" />
                                        </span>
                                    </motion.button>
                                )
                            })}

                            {/* Connecting lines from center to active node */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
                                {features.map((feat, i) => {
                                    const a = angles[i]
                                    const x2 = 170 + Math.cos(a) * orbRadius
                                    const y2 = 170 + Math.sin(a) * orbRadius
                                    return (
                                        <motion.line
                                            key={i}
                                            x1={170} y1={170} x2={x2} y2={y2}
                                            stroke={feat.color}
                                            strokeWidth={i === active ? 1.5 : 0.5}
                                            animate={{ opacity: i === active ? 0.8 : 0.12 }}
                                            transition={{ duration: 0.5 }}
                                            strokeDasharray={i === active ? "4 4" : "2 6"}
                                        />
                                    )
                                })}
                                {/* Animated dash on active line */}
                                <AnimatePresence>
                                    {(() => {
                                        const a = angles[active]
                                        const x2 = 170 + Math.cos(a) * orbRadius
                                        const y2 = 170 + Math.sin(a) * orbRadius
                                        const len = Math.sqrt((x2 - 170) ** 2 + (y2 - 170) ** 2)
                                        return (
                                            <motion.line
                                                key={active}
                                                x1={170} y1={170} x2={x2} y2={y2}
                                                stroke={f.color}
                                                strokeWidth={2}
                                                strokeDasharray={`10 ${len}`}
                                                strokeLinecap="round"
                                                initial={{ strokeDashoffset: len + 10 }}
                                                animate={{ strokeDashoffset: -(len + 10) }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                            />
                                        )
                                    })()}
                                </AnimatePresence>
                            </svg>
                        </div>

                        {/* RIGHT: Feature description */}
                        <div className="flex-1 min-w-0">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={active}
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.45, ease: "easeOut" }}
                                    className="space-y-6"
                                >
                                    {/* Stat pill */}
                                    <motion.span
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
                                        style={{ color: f.color, borderColor: `${f.color}40`, background: `${f.color}12` }}
                                    >
                                        {f.stat}
                                    </motion.span>

                                    {/* Title */}
                                    <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                                        {f.title.split(" ").map((word, wi) => (
                                            <motion.span
                                                key={wi}
                                                className="inline-block mr-3"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: wi * 0.07, duration: 0.4 }}
                                            >
                                                {word}
                                            </motion.span>
                                        ))}
                                    </h3>

                                    {/* Description */}
                                    <motion.p
                                        className="text-lg text-muted-foreground leading-relaxed max-w-lg"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        {f.desc}
                                    </motion.p>

                                    {/* Progress bar */}
                                    <div className="space-y-2">
                                        <div className="h-[2px] w-full bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{ background: f.color }}
                                                initial={{ width: "0%" }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 5.0, ease: "linear" }}
                                                key={active}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            {features.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => { setActive(i); isPausedRef.current = true }}
                                                    className="h-1.5 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: i === active ? 28 : 8,
                                                        background: i === active ? f.color : "rgba(255,255,255,0.15)"
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CINEMATIC BENCHMARK SHOWCASE ── */}
            <section className="relative py-40 px-6 border-t border-border overflow-hidden bg-background/50">
                {/* Immersive background elements */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-24"
                    >
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary/80 mb-4 px-4 py-1 border border-primary/20 rounded-full inline-block bg-primary/5">
                            Performance Benchmarks
                        </p>
                        <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
                            Carbon-Aware <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Superiority</span>
                        </h2>
                        <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium">
                            Visualizing the transformation from traditional computation to sustainable credit intelligence.
                        </p>
                    </motion.div>

                    {/* Dataset Switcher - Premium Style */}
                    <div className="flex justify-center mb-20">
                        <div className="p-1 bg-muted/40 backdrop-blur-md border border-border rounded-2xl flex gap-1">
                            {[
                                { id: 'bank', name: 'Retail Bank Dataset', icon: Database },
                                { id: 'german', name: 'German Credit Dataset', icon: BarChart3 }
                            ].map((ds) => (
                                <button
                                    key={ds.id}
                                    onClick={() => setBenchmarkDataset(ds.id as any)}
                                    className={`relative px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${benchmarkDataset === ds.id ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {benchmarkDataset === ds.id && (
                                        <motion.div
                                            layoutId="active-ds"
                                            className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <ds.icon className="w-4 h-4 relative z-10" />
                                    <span className="relative z-10">{ds.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Transformation Visual */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="relative aspect-square max-w-xl mx-auto w-full">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={benchmarkDataset}
                                    initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    className="w-full h-full"
                                >
                                    <BenchmarkVisual dataset={benchmarkDataset} />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="space-y-8">
                            <div className="grid sm:grid-cols-2 gap-6">
                                {/* Precision Card */}
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="p-8 rounded-3xl bg-card/40 border border-border backdrop-blur-xl relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Target className="w-24 h-24" />
                                    </div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Model AUC</span>
                                    </div>
                                    <div className="text-6xl font-black tracking-tighter mb-2">
                                        {benchmarkDataset === 'bank' ? '0.954' : '0.939'}
                                    </div>
                                    <div className="text-sm font-medium text-blue-500 flex items-center gap-1">
                                        <TrendingDown className="w-4 h-4 rotate-180" />
                                        <span>State-of-the-art Accuracy</span>
                                    </div>
                                </motion.div>

                                {/* Efficiency Card */}
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="p-8 rounded-3xl bg-card/40 border border-border backdrop-blur-xl relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Leaf className="w-24 h-24" />
                                    </div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Efficiency</span>
                                    </div>
                                    <div className="text-6xl font-black tracking-tighter mb-2 text-emerald-500">
                                        {benchmarkDataset === 'bank' ? '5.7×' : '83%'}
                                    </div>
                                    <div className="text-sm font-medium text-emerald-500 flex items-center gap-1">
                                        <Leaf className="w-4 h-4" />
                                        <span>Carbon Footprint Reduction</span>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Detailed Stats Panel */}
                            <div className="p-8 rounded-3xl bg-card/20 border border-border border-dashed space-y-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-primary" />
                                    Benchmark Insights
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { label: "Optimal Architecture", value: benchmarkDataset === 'bank' ? "INT8 + Scale 0.5" : "Dynamic INT8" },
                                        { label: "Execution Precision", value: "8-bit Fixed Point" },
                                        { label: "Stability Score", value: "99.2% Guaranteed" }
                                    ].map((stat, i) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                                            <span className="text-muted-foreground font-medium">{stat.label}</span>
                                            <span className="font-bold text-foreground">{stat.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PREMIUM FOOTER ── */}
            <footer className="relative py-20 px-6 border-t border-border bg-card/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                        {/* Brand Column */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Leaf className="h-6 w-6 text-primary" />
                                <span className="font-bold text-xl tracking-tight">Carbon<span className="text-primary">Intel</span></span>
                            </div>
                            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed font-medium">
                                Driving the future of sustainable banking through carbon-aware neural architecture search and explainable AI.
                            </p>
                            <div className="flex gap-4">
                                {[Github, Linkedin, Twitter].map((Social, i) => (
                                    <motion.button
                                        key={i}
                                        whileHover={{ y: -2 }}
                                        className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <Social className="w-5 h-5" />
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Product Column */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground">Product</h4>
                            <ul className="space-y-3">
                                {["Features", "Research", "Documentation", "API Reference"].map((link) => (
                                    <li key={link}>
                                        <button className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">{link}</button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Support Column */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground">Support</h4>
                            <ul className="space-y-3">
                                {["Help Center", "Community", "Safety Guidelines", "Status"].map((link) => (
                                    <li key={link}>
                                        <button className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">{link}</button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Column */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground">Get in Touch</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 group">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">research@carbonintel.ai</span>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">Bengaluru, India</span>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">+91 6361590793</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-muted-foreground text-xs font-medium">
                            © {new Date().getFullYear()} Carbon Intelligence Research Group. All rights reserved.
                        </div>
                        <div className="flex gap-8">
                            <button className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Privacy Policy</button>
                            <button className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Terms of Service</button>
                            <button className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Cookie Settings</button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
