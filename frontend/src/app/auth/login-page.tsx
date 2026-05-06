import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Logo } from "@/components/ui/logo"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Lock, Mail, ArrowRight, UserPlus, LogIn } from "lucide-react"
import axios from "axios"
import { useAuthStore } from "@/store/auth-store"

export default function LoginPage() {
    const navigate = useNavigate()
    const { setAuth } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const postLoginRoute = "/dashboard/prediction"

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register"
            const response = await axios.post(`http://localhost:5000${endpoint}`, {
                email,
                password
            })

            if (isLogin) {
                const { token, user } = response.data
                setAuth(user, token)
                navigate(postLoginRoute)
            } else {
                // After successful registration, switch to login
                setIsLogin(true)
                setError("Registration successful! Please login.")
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex relative overflow-hidden bg-background transition-colors duration-500">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10" />

            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
                <button onClick={() => navigate("/")} className="hover:opacity-80 transition-opacity">
                    <Logo className="text-2xl" />
                </button>
                <ThemeToggle />
            </div>

            {/* Main Content Grid */}
            <div className="container mx-auto grid lg:grid-cols-2 h-screen items-center relative z-10 px-6">

                {/* Left Side - Hero Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hidden lg:flex flex-col justify-center space-y-6 pr-12"
                >
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                        <span className="block text-primary">Intelligent</span>
                        <span className="block">Credit Risk Analysis</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-lg">
                        A sustainable approach to financial AI. Optimize your lending decisions while minimizing carbon footprint.
                    </p>

                    <div className="flex gap-4 pt-4">
                        <div className="flex flex-col gap-1 p-4 rounded-xl bg-card/50 border border-border backdrop-blur-sm">
                            <span className="text-3xl font-bold text-primary">99.9%</span>
                            <span className="text-sm text-muted-foreground">Uptime</span>
                        </div>
                        <div className="flex flex-col gap-1 p-4 rounded-xl bg-card/50 border border-border backdrop-blur-sm">
                            <span className="text-3xl font-bold text-primary">50%</span>
                            <span className="text-sm text-muted-foreground">Less Carbon</span>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side - Form */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex justify-center lg:justify-end"
                >
                    <Card className="w-full max-w-[400px] glass-panel border-white/10 shadow-2xl">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold">
                                {isLogin ? "Welcome back" : "Create an account"}
                            </CardTitle>
                            <CardDescription>
                                {isLogin
                                    ? "Enter your credentials to access the platform"
                                    : "Join us and start your sustainable credit journey"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="grid gap-4">
                                    <AnimatePresence mode="wait">
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className={`text-sm p-3 rounded-md ${error.includes('successful') ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}
                                            >
                                                {error}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                placeholder="m@example.com"
                                                type="email"
                                                className="pl-9"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                type="password"
                                                className="pl-9"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Button className="w-full" type="submit" disabled={loading}>
                                        {loading ? (
                                            <span className="animate-pulse">
                                                {isLogin ? "Signing in..." : "Creating account..."}
                                            </span>
                                        ) : (
                                            <>
                                                {isLogin ? (
                                                    <>Sign In <LogIn className="ml-2 h-4 w-4" /></>
                                                ) : (
                                                    <>Sign Up <UserPlus className="ml-2 h-4 w-4" /></>
                                                )}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            <div className="text-sm text-center text-muted-foreground">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="ml-1 underline text-primary hover:text-primary/80 transition-colors"
                                >
                                    {isLogin ? "Sign up" : "Log in"}
                                </button>
                            </div>
                            <div className="text-xs text-center text-muted-foreground mt-4">
                                Protects 100% of your data
                            </div>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
