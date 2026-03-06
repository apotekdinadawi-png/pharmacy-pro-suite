import { Outlet, Navigate, useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { useAuthContext } from "@/contexts/AuthContext";
import { roleMenuAccess, routeMenuMap } from "@/hooks/useAuth";

const AppLayout = () => {
  const { user, role, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Route guard: check if current role has access to this route
  if (role) {
    const menuKey = routeMenuMap[location.pathname];
    if (menuKey) {
      const allowed = roleMenuAccess[role] || [];
      if (!allowed.includes(menuKey)) {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
