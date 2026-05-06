import { Button } from "@/components/ui/button"
import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function Topbar() {
    return (
        <div className="h-16 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4 w-1/3">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search analysis, models, or logs..."
                        className="pl-9 h-9 bg-background/50 border-input/50 focus-visible:bg-background transition-colors"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <div className="flex items-center gap-3 pl-2">
                    <div className="flex flex-col items-end hidden md:flex">
                        <span className="text-sm font-medium leading-none">Alex Morgan</span>
                        <span className="text-xs text-muted-foreground">Lead Data Scientist</span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-primary/50 ring-2 ring-background" />
                </div>
            </div>
        </div>
    )
}
