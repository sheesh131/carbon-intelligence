import { Outlet } from "react-router-dom"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"

export default function DashboardLayout() {
    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar />
            <main className="flex-1 ml-64 flex flex-col min-h-screen transition-all duration-300">
                <Topbar />
                <div className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
