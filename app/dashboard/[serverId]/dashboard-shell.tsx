"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState } from "react"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
  Store,
  Settings,
  User,
  ChevronDown,
  Bell,
  LogOut,
  Webhook,
  Receipt,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: { label: string; href: string }[]
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "", icon: LayoutDashboard },
  { label: "Products", href: "/products", icon: Package },
  {
    label: "Orders",
    href: "/orders",
    icon: ShoppingCart,
    children: [
      { label: "All Orders", href: "/orders" },
      { label: "Pending", href: "/orders/pending" },
      { label: "Completed", href: "/orders/completed" },
    ],
  },
  { label: "Transactions", href: "/transactions", icon: Receipt },
  { label: "Wallets", href: "/wallets", icon: Wallet },
  { label: "Customize", href: "/storefront", icon: Store },
  { label: "Webhooks", href: "/webhooks", icon: Webhook },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Account", href: "/account", icon: User },
]

function SidebarNavItem({ item, serverId, onNavigate }: { item: NavItem; serverId: string; onNavigate?: () => void }) {
  const pathname = usePathname()
  const baseHref = `/dashboard/${serverId}${item.href}`
  // The Dashboard index (href "") would otherwise match every sub-route as a
  // prefix, so it needs an exact-path check; other items can match sub-routes.
  const isIndex = item.href === ""
  const isActive = isIndex
    ? pathname === baseHref
    : pathname === baseHref || pathname.startsWith(baseHref + "/")
  const hasChildren = item.children && item.children.length > 0
  const [isOpen, setIsOpen] = useState(false)
  const open = isOpen || isActive

  return (
    <div>
      {hasChildren ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
      ) : (
        <Link
          href={baseHref}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      )}

      {hasChildren && (
        <div
          className={cn(
            "grid transition-all duration-200 ease-out",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="ml-4 mt-1 space-y-1 border-l border-border pl-4">
              {item.children!.map((child) => {
                const childHref = `/dashboard/${serverId}${child.href}`
                const isChildActive = pathname === childHref
                return (
                  <Link
                    key={child.href}
                    href={childHref}
                    onClick={onNavigate}
                    className={cn(
                      "block rounded-lg px-3 py-1.5 text-sm transition-colors",
                      isChildActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {child.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function DashboardShell({
  serverId,
  serverName,
  children,
}: {
  serverId: string
  serverName: string
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-card transition-transform duration-300 lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo - links back to dashboard */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link
            href={`/dashboard/${serverId}`}
            className="flex items-center gap-2"
            onClick={closeMobileMenu}
          >
            <div className="h-8 w-8 overflow-hidden rounded-lg">
              <Image
                src="/guildpay-logo.png"
                alt="Guild Pay logo"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
            <span
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Guild Pay
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle className="h-8 w-8" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  title="Notifications"
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Bell className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                  You&apos;re all caught up. New orders and payouts will show up here.
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
              onClick={closeMobileMenu}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Server selector */}
        <div className="border-b border-border p-3">
          <Link href="/select-server" onClick={closeMobileMenu}>
            <Button
              variant="outline"
              className="w-full justify-between border-border/60 text-left"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
                  {serverName?.charAt(0)?.toUpperCase() || "S"}
                </div>
                <span className="truncate text-sm">{serverName}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.label}
              item={item}
              serverId={serverId}
              onNavigate={closeMobileMenu}
            />
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              U
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-foreground">
                Connected account
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background px-4 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            href={`/dashboard/${serverId}`}
            className="flex items-center gap-2"
          >
            <div className="h-6 w-6 overflow-hidden rounded">
              <Image
                src="/guildpay-logo.png"
                alt="Guild Pay logo"
                width={24}
                height={24}
                className="h-full w-full object-cover"
              />
            </div>
            <span
              className="text-base font-bold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Guild Pay
            </span>
          </Link>
        </div>
        {children}
      </main>
    </div>
  )
}
