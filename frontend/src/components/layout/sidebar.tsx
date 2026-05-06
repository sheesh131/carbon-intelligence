import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button" // Re-add if needed for logout
import { Logo } from "@/components/ui/logo"
import {
    LayoutDashboard,
    Zap,
    Leaf,
    Network,
    LogOut,
    Settings
} from "lucide-react"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Zap, label: "Loan Prediction", href: "/dashboard/prediction" },
    { icon: Leaf, label: "Sustainability", href: "/dashboard/sustainability" },
    { icon: Network, label: "Federated Learning", href: "/dashboard/federated" },
]

export function Sidebar() {
    const location = useLocation()

    return (
        <div className="h-screen w-64 bg-card border-r border-border flex flex-col fixed left-0 top-0 z-30 transition-all duration-300">
            <div className="p-6 h-16 flex items-center">
                <Logo />
            </div>

            <div className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Platform
                </div>
                {sidebarItems.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                            {item.label}
                            {isActive && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full" />
                            )}
                        </Link>
                    )
                })}
            </div>

            <div className="p-4 border-t border-border">
                <Link
                    to="/dashboard/settings"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                    <Settings className="h-4 w-4" />
                    Settings
                </Link>
                <Link
                    to="/login"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors mt-1"
                >
                    <LogOut className="h-4 w-4" />
                    Log Out
                </Link>
            </div>
        </div>
    )
}
