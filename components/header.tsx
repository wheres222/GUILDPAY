"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { DiscordIcon } from "@/components/discord-icon"
import { siteConfig } from "@/lib/site-config"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 overflow-hidden rounded-lg">
            <Image
              src="/guildpay-logo.png"
              alt="Guild Pay logo"
              width={36}
              height={36}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <span
            className="text-xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Guild Pay
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link-hover relative px-4 py-2 text-sm font-medium text-muted-foreground transition-colors"
            >
              {item.label}
              <span className="nav-underline absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-primary transition-all duration-300 ease-out" />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/signin">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <a href={siteConfig.discordInviteUrl} target="_blank" rel="noopener noreferrer">
              <DiscordIcon className="mr-2 h-4 w-4" />
              Add to Discord
            </a>
          </Button>
        </div>

        <button
          className="rounded-lg p-2 text-foreground transition-colors hover:bg-secondary md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border/40 bg-background md:hidden">
          <nav className="flex flex-col p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2 border-t border-border/40 pt-4">
              <Link href="/signin">
                <Button variant="ghost" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <a href={siteConfig.discordInviteUrl} target="_blank" rel="noopener noreferrer">
                  <DiscordIcon className="mr-2 h-4 w-4" />
                  Add to Discord
                </a>
              </Button>
            </div>
          </nav>
        </div>
      )}

      <style jsx>{`
        .nav-link-hover:hover {
          color: var(--primary);
        }
        .nav-link-hover:hover .nav-underline {
          width: 100%;
        }
      `}</style>
    </header>
  )
}
