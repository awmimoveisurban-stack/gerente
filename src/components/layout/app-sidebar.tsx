import { useState } from "react";
import { 
  Home, 
  Users, 
  Building2, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  MessageSquare
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";

const corretorItems = [
  { title: "Dashboard", url: "/corretor", icon: BarChart3 },
  { title: "Meus Leads", url: "/leads", icon: Users },
  { title: "Kanban", url: "/kanban", icon: LayoutGrid },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
];

const gerenteItems = [
  { title: "Dashboard Geral", url: "/gerente", icon: BarChart3 },
  { title: "Todos os Leads", url: "/todos-leads", icon: Users },
  { title: "Kanban", url: "/kanban", icon: LayoutGrid },
  { title: "WhatsApp", url: "/gerente-whatsapp", icon: MessageSquare },
  { title: "Equipe", url: "/gerente/equipe", icon: Building2 },
  { title: "Relatórios", url: "/gerente/relatorios", icon: BarChart3 },
];

interface AppSidebarProps {
  userType?: "corretor" | "gerente";
  userEmail?: string;
}

export function AppSidebar({ userType = "corretor", userEmail = "" }: AppSidebarProps) {
  const { signOut } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const items = userType === "gerente" ? gerenteItems : corretorItems;

  const handleSignOut = async () => {
    await signOut();
  };

  // Get initials from email
  const getInitials = (email: string) => {
    if (!email) return "U";
    const parts = email.split("@")[0].split(".");
    return parts.map(part => part[0]?.toUpperCase() || "").join("").slice(0, 2) || "U";
  };

  return (
    <Sidebar className={`${isCollapsed ? "w-16" : "w-64"} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700`} collapsible="icon">
      <SidebarHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                URBAN CRM
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Sistema de Gestão
              </p>
            </div>
          )}
          {isCollapsed && (
            <div className="flex-1" />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={`${isCollapsed ? "sr-only" : "text-gray-500 dark:text-gray-400 text-xs font-medium px-3 py-2 uppercase tracking-wider"}`}>
            {userType === "gerente" ? "Gestão" : "Corretor"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive 
                            ? "bg-blue-600 text-white" 
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`
                      }
                      aria-current={location.pathname === item.url ? "page" : undefined}
                      title={item.title}
                    >
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-4" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => console.log("Configurações clicadas")}
                  aria-label="Configurações da aplicação"
                  title="Configurações da aplicação"
                >
                  <Settings className="h-4 w-4" />
                  {!isCollapsed && <span>Configurações</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
              {getInitials(userEmail)}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">{userEmail}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium">{userType}</p>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 w-9 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors" 
            onClick={handleSignOut}
            aria-label="Sair da aplicação"
            title="Sair da aplicação"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full h-9 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}