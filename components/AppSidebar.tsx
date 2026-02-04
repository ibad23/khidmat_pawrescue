"use client";

import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Cat, 
  Heart, 
  Building2, 
  DollarSign, 
  Users, 
  LogOut,
  Sun,
  Moon 
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Cats", url: "/cats", icon: Cat },
  { title: "Treatments", url: "/treatments", icon: Heart },
  { title: "Wards", url: "/wards", icon: Building2 },
  { title: "Finances", url: "/finances", icon: DollarSign },
];

const bottomItems = [
  { title: "Team", url: "/team", icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { signOut } = useAuth() || {};
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="bg-sidebar">
        {/* Logo Header - matches h-16 of main header */}
        <div className="h-16 flex items-center justify-center border-b border-border px-2">
          <Logo className={cn(
            "transition-all duration-200 object-contain",
            collapsed ? "w-6 h-6" : "h-8 w-auto"
          )} />
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-foreground border-l-2 border-primary"
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
                      >
                        <div className={cn(collapsed ? "w-10 h-10 flex items-center justify-center rounded-md" : "") }>
                          <item.icon className={cn(collapsed ? "w-6 h-6" : "w-5 h-5")} />
                        </div>
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button
                      variant="ghost"
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors justify-start"
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                      {mounted ? (
                        theme === "dark" ? <Sun className={cn(collapsed ? "w-6 h-6" : "w-5 h-5")} /> : <Moon className={cn(collapsed ? "w-6 h-6" : "w-5 h-5")} />
                      ) : (
                        <span className={cn(collapsed ? "w-6 h-6 inline-block" : "w-5 h-5 inline-block")} />
                      )}
                      {!collapsed && (
                        <span>{mounted ? (theme === "dark" ? "Light Mode" : "Dark Mode") : ""}</span>
                      )}
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button
                      variant="ghost"
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors justify-start"
                      onClick={async () => {
                        try {
                          await signOut();
                          router.replace("/login");
                        } catch (err) {
                          // swallow or add toast handling if desired
                        }
                      }}
                    >
                      <div className={cn(collapsed ? "w-10 h-10 flex items-center justify-center rounded-md" : "") }>
                        <LogOut className={cn(collapsed ? "w-6 h-6" : "w-5 h-5")} />
                      </div>
                      {!collapsed && <span>Logout</span>}
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
