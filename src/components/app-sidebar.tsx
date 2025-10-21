import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Database, Cloud, Zap, BarChart2, Settings, LifeBuoy, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/data-sources", label: "Data Sources", icon: Database },
  { href: "/data-destinations", label: "Data Destinations", icon: Cloud },
  { href: "/pipelines", label: "Pipelines", icon: Zap },
  { href: "/monitoring", label: "Monitoring", icon: BarChart2 },
];
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuth(state => state.logout);
  const user = useAuth(state => state.user);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-brand to-brand-accent flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold font-display">AetherFlow</span>
        </div>
        <SidebarInput placeholder="Search" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                  <NavLink to={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="#"><LifeBuoy /> <span>Support</span></a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/settings'}>
                <NavLink to="/settings">
                  <Settings /> <span>Settings</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut /> <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {user && (
          <div className="p-4 border-t border-sidebar-border text-sm text-sidebar-foreground/80">
            <p className="font-semibold">{user?.name}</p>
            <p className="truncate">{user?.email}</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}