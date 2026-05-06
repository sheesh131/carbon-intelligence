import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, ShieldCheck, Lock, FileText, Activity, AlertTriangle, CheckCircle } from "lucide-react"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"

// Mock Data for Alerts
const alerts = [
    { id: "ALT-001", type: "Suspicious Input", severity: "High", timestamp: "10 mins ago", description: "Adversarial attack pattern detected in input vector." },
    { id: "ALT-002", type: "Model Drift", severity: "Medium", timestamp: "2 hours ago", description: "Prediction distribution deviating from baseline." },
    { id: "ALT-003", type: "Unauthorized Access", severity: "Low", timestamp: "5 hours ago", description: "Failed login attempt from IP 192.168.1.105." },
]

// Mock Data for Update Logs
const updateLogs = [
    { version: "v2.5-beta", date: "Today, 10:45 AM", author: "System", type: "Auto-Update", status: "Success" },
    { version: "v2.4-stable", date: "Yesterday, 09:30 AM", author: "Admin", type: "Manual Patch", status: "Success" },
    { version: "v2.3.5", date: "Feb 15, 2026", author: "System", type: "Rollback", status: "Failed" },
]

export default function SecurityPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Security Monitoring</h2>
                    <p className="text-muted-foreground">
                        Real-time tracking of model integrity and system threats.
                    </p>
                </div>
                <Badge variant="outline" className="px-4 py-1 text-sm bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    System Status: Secure
                </Badge>
            </div>

            {/* Integrity Status Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-panel border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Model Integrity</CardTitle>
                        <Lock className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Verified</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            SHA-256 Hash Matched
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-panel border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Data Validation</CardTitle>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">99.8%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Valid Inputs (This Hour)
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-panel border-l-4 border-l-yellow-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Threats</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            No critical threats detected
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-panel border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Audit Log</CardTitle>
                        <Activity className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Tracking</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Immutable ledger active
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Suspicious Activity Alerts */}
                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Suspicious Activity Alerts
                        </CardTitle>
                        <CardDescription>Recent security events requiring attention.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {alerts.map((alert) => (
                                <div key={alert.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 border border-transparent hover:border-destructive/20 transition-all">
                                    <div className="mt-1">
                                        {alert.severity === "High" ? <ShieldAlert className="h-5 w-5 text-destructive" /> :
                                            alert.severity === "Medium" ? <AlertTriangle className="h-5 w-5 text-yellow-500" /> :
                                                <Activity className="h-5 w-5 text-blue-500" />}
                                    </div>
                                    <div className="space-y-1 w-full">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">{alert.type}</p>
                                            <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{alert.description}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant="secondary" className="text-[10px] h-5">{alert.id}</Badge>
                                            <Badge variant={alert.severity === "High" ? "destructive" : "outline"} className="text-[10px] h-5">
                                                {alert.severity} Severity
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Update Logs */}
                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-500" />
                            System Update Log
                        </CardTitle>
                        <CardDescription>History of model versions and patches.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Version</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {updateLogs.map((log) => (
                                    <TableRow key={log.version}>
                                        <TableCell className="font-medium">{log.version}</TableCell>
                                        <TableCell>{log.type}</TableCell>
                                        <TableCell>{log.author}</TableCell>
                                        <TableCell className="text-right">
                                            {log.status === "Success" ? (
                                                <div className="flex items-center justify-end gap-1 text-green-500">
                                                    <CheckCircle className="h-3 w-3" /> Success
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-1 text-destructive">
                                                    <AlertTriangle className="h-3 w-3" /> Failed
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
