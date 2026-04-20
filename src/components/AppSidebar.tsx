import {
  LayoutDashboard, ShoppingCart, Package, Truck, BarChart3,
  Users, Settings, LogOut, Pill, ChevronLeft,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useAuthContext } from "@/contexts/AuthContext";
import { roleMenuAccess } from "@/hooks/useAuth";

const allMenuItems = [
  { key: "dashboard", title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { key: "transactions", title: "Transaksi / Kasir", icon: ShoppingCart, path: "/transactions" },
  { key: "inventory", title: "Inventaris", icon: Package, path: "/inventory" },
  { key: "procurement", title: "Pengadaan", icon: Truck, path: "/procurement" },
  { key: "reports", title: "Laporan", icon: BarChart3, path: "/reports" },
  { key: "customers", title: "Pelanggan", icon: Users, path: "/customers" },
  { key: "users", title: "Manajemen User", icon: Users, path: "/users" },
  { key: "settings", title: "Pengaturan", icon: Settings, path: "/settings" },
];

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { business } = useSettingsStore();
  const { signOut, role, profile } = useAuthContext();

  const allowedKeys = role ? roleMenuAccess[role] : allMenuItems.map(m => m.key);
  const menuItems = allMenuItems.filter(m => allowedKeys.includes(m.key));

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 gradient-sidebar flex flex-col transition-all duration-300 border-r border-sidebar-border",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
        {business.logoUrl ? (
          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-sidebar-accent flex items-center justify-center">
            <img src={business.logoUrl} alt="Logo" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center shrink-0">
            <Pill className="w-5 h-5 text-accent-foreground" />
          </div>
        )}
        {!collapsed && (
          <span className="text-lg font-bold text-sidebar-foreground animate-slide-in-left truncate">
            {business.namaApotek}
          </span>
        )}
      </div>

      {/* APJ label (static) */}
      {!collapsed && (
        <div className="px-4 py-2 border-b border-sidebar-border bg-sidebar-accent/20">
          <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">Apoteker Penanggung Jawab</p>
          <p className="text-xs text-sidebar-foreground font-semibold truncate">Apt. Madinatul Adawiyah, S.Farm</p>
        </div>
      )}

      {/* User info */}
      {!collapsed && profile && (
        <div className="px-4 py-2 border-b border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/70 truncate">{profile.full_name || profile.username}</p>
          <p className="text-[10px] text-sidebar-foreground/50 capitalize">{role?.replace('_', ' ') || 'User'}</p>
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="animate-slide-in-left">{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all w-full"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all w-full"
        >
          <ChevronLeft className={cn("w-5 h-5 shrink-0 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && <span>Ciutkan</span>}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
