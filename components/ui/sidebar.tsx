"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";

type SidebarState = "open" | "collapsed";

const SidebarContext = React.createContext<{
  state: SidebarState;
  toggle: () => void;
  setState: (s: SidebarState) => void;
} | null>(null);

export const SidebarProvider = ({ children, defaultOpen = true }: { children: React.ReactNode; defaultOpen?: boolean }) => {
  const [state, setState] = React.useState<SidebarState>(defaultOpen ? "open" : "collapsed");
  const toggle = React.useCallback(() => setState((s) => (s === "open" ? "collapsed" : "open")), []);
  return <SidebarContext.Provider value={{ state, toggle, setState }}>{children}</SidebarContext.Provider>;
};

export const useSidebar = () => {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider");
  return ctx;
};

export const Sidebar = ({ children, className, collapsible }: { children: React.ReactNode; className?: string; collapsible?: "icon" | boolean }) => {
  // Make the sidebar sticky so it doesn't scroll away with the page content
  return (
    <aside className={cn("flex flex-col h-screen sticky top-0 flex-shrink-0", className)} data-collapsible={collapsible}>
      {children}
    </aside>
  );
};

export const SidebarContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  // Adjust width based on collapsed state; allow internal scrolling if content overflows
  return (
    <div
      className={cn(
        "flex flex-col min-h-0 bg-sidebar h-screen overflow-y-auto transition-all duration-200",
        // make collapsed sidebar slightly wider so icons and indicators remain readable
        collapsed ? "w-20 min-w-[5rem]" : "w-64",
        className
      )}
    >
      {children}
    </div>
  );
};

export const SidebarGroup = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn("px-2 py-2", className)}>
      {children}
    </div>
  );
};

export const SidebarGroupContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn("space-y-1", className)}>{children}</div>;
};

export const SidebarMenu = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <ul className={cn("flex flex-col gap-1 p-2", className)}>{children}</ul>;
};

export const SidebarMenuItem = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <li className={cn("list-none", className)}>{children}</li>;
};

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(
  ({ className, asChild = false, children, ...props }, ref) => {
    const Comp: any = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn("w-full text-left", className)} {...props}>
        {children}
      </Comp>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarTrigger = ({ className, children }: { className?: string; children?: React.ReactNode }) => {
  const { toggle, state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <button
      onClick={toggle}
      className={cn(
        "p-2 rounded-md hover:bg-accent/20 flex items-center justify-center",
        className
      )}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-expanded={!collapsed}
    >
      {children ?? (
        <span className="inline-flex items-center">
          {/* Show a chevron that points toward the action (expand -> right, collapse -> left) */}
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </span>
      )}
    </button>
  );
};

export default Sidebar;
