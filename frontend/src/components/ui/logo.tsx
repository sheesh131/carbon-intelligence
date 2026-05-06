import { Zap } from "lucide-react";

export function Logo({ className }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 font-bold text-xl tracking-tighter ${className}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                CarbonIntel.
            </span>
        </div>
    );
}
