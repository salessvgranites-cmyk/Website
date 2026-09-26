import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { ExternalLink, LayoutDashboard, LogOut, MessageSquare, PanelLeft, Palette } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Content studio", path: "/admin" },
  { icon: MessageSquare, label: "Message Templates", path: "/admin/templates" },
  { icon: ExternalLink, label: "Public website", path: "/", external: true },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Sign in to continue
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Access to this dashboard requires authentication. Continue to launch the login flow.
            </p>
          </div>
          <Button
            onClick={() => { window.location.href = "/api/auth/google"; }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
          >
            <svg viewBox="0 0 48 48" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.2 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.5 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.5 29.4 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.5 26.9 36 24 36c-5.2 0-9.6-2.7-11.3-6.8l-6.6 5.1C9.5 39.3 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.4 4.3-4.5 5.6l6.2 5.2C40.5 35.7 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/>
            </svg>
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r border-white/10 bg-[#090b0e]"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center border-b border-white/10 bg-[#090b0e]">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors focus:outline-none text-stone-400 hover:text-white shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col items-center">
                    <span className="font-cinzel text-lg font-bold tracking-[0.18em] text-[#d4af37] leading-none">SV</span>
                    <span className="font-cinzel text-[7px] uppercase tracking-[0.34em] text-white/80 -mt-0.5 leading-none">GRANITES</span>
                  </div>
                  <div className="h-5 w-[1px] bg-white/15"></div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#9ca3af]">Studio</span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 bg-[#090b0e]">
            <SidebarMenu className="px-2 py-3 gap-1">
              {menuItems.map(item => {
                const isActive = item.path === "/admin"
                  ? (location === "/admin" || location === "/admin/")
                  : item.path === "/admin/templates"
                  ? location.startsWith("/admin/templates")
                  : location === item.path;

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => {
                        if ((item as any).external) {
                          window.open(item.path, "_blank");
                        } else {
                          setLocation(item.path);
                        }
                      }}
                      tooltip={item.label}
                      className={`h-11 px-3 rounded-xl transition-all font-semibold text-xs tracking-wider uppercase ${
                        isActive
                          ? "bg-[#d4af37]/15 text-[#d4af37] border-l-2 border-[#d4af37]"
                          : "text-stone-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-[#d4af37]" : "text-stone-400"}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-white/10 bg-[#090b0e]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none">
                  <Avatar className="h-9 w-9 border border-[#d4af37]/40 bg-[#13161b] shrink-0 text-[#d4af37]">
                    <AvatarFallback className="text-xs font-bold bg-[#13161b] text-[#d4af37]">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium text-white truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-stone-400 truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#13161b] border-white/10 text-white">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-500/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#d4af37]/30 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="bg-[#0d0f12] text-white">
        {isMobile && (
          <div className="flex border-b border-white/10 h-14 items-center justify-between bg-[#090b0e] px-4 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-9 w-9 rounded-lg text-white hover:bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-sm font-bold tracking-widest text-[#d4af37]">
                  {activeMenuItem?.label ?? "Menu"}
                </span>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-0 bg-[#0d0f12] text-white">{children}</main>
      </SidebarInset>
    </>
  );
}
