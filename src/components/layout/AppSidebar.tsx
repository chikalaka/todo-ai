"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ListTodo, Archive, Plus, LogOut, User, Menu, Mic } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/components/auth/AuthProvider"
import { CreateTodoDialog } from "@/components/todos/CreateTodoDialog"
import { RecordTodoDialog } from "@/components/todos/RecordTodoDialog"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"

const navigationItems = [
  {
    title: "Active Todos",
    url: "/",
    icon: ListTodo,
  },
  {
    title: "Archived Todos",
    url: "/archive",
    icon: Archive,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, signOut, loading } = useAuth()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [recordDialogOpen, setRecordDialogOpen] = useState(false)

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center justify-between px-2 py-4">
            <div className="flex items-center gap-2">
              <ListTodo className="h-6 w-6 flex-shrink-0" />
              <span className="text-lg font-semibold truncate">Todo App</span>
            </div>
            <SidebarTrigger className="h-6 w-6 flex-shrink-0" />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setCreateDialogOpen(true)}
                    tooltip="Create New Todo"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Todo</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setRecordDialogOpen(true)}
                    tooltip="Record Todo with Voice"
                  >
                    <Mic className="h-4 w-4" />
                    <span>Record Todo</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={user?.email || "User Profile"}>
                    <User className="h-4 w-4" />
                    <span className="truncate">{user?.email || "User"}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip={loading ? "Loading..." : "Sign Out"}
                  >
                    <Button
                      onClick={signOut}
                      disabled={loading}
                      variant="ghost"
                      className="w-full justify-start p-0 h-8"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{loading ? "Loading..." : "Sign Out"}</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>

      <CreateTodoDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <RecordTodoDialog
        open={recordDialogOpen}
        onOpenChange={setRecordDialogOpen}
      />
    </>
  )
}

function MobileHeader() {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-8 w-8"
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="flex items-center gap-2">
        <ListTodo className="h-5 w-5" />
        <span className="font-semibold">Todo App</span>
      </div>
    </header>
  )
}

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {isMobile && <MobileHeader />}
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
