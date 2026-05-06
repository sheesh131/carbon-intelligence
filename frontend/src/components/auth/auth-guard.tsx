import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/auth-store"

interface AuthGuardProps {
    children: React.ReactNode
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
    const { isAuthenticated } = useAuthStore()
    const location = useLocation()

    if (!isAuthenticated) {
        // Redirect theme to login page but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <>{children}</>
}
