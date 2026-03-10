"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronDown, Plus, Check } from "lucide-react"

const mockServers = [
  {
    id: "1",
    name: "Cheatparadise",
    icon: null,
    hasBot: true,
  },
  {
    id: "2",
    name: "Crypto Trading Hub",
    icon: null,
    hasBot: true,
  },
  {
    id: "3",
    name: "NFT Marketplace",
    icon: null,
    hasBot: true,
  },
  {
    id: "4",
    name: "Digital Products Store",
    icon: null,
    hasBot: false,
  },
  {
    id: "5",
    name: "Gaming Community",
    icon: null,
    hasBot: false,
  },
]

export default function SelectServerPage() {
  const [isOpen, setIsOpen] = useState(true)
  const [selectedServer, setSelectedServer] = useState(mockServers[0])

  const serversWithBot = mockServers.filter((s) => s.hasBot)
  const serversWithoutBot = mockServers.filter((s) => !s.hasBot)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f1419]">
      <div className="w-full max-w-xs">
        {/* Server dropdown */}
        <div className="overflow-hidden rounded-xl border border-[#1e2730] bg-[#151c24]">
          {/* Selected server header */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex w-full items-center justify-between px-3 py-2.5 transition-colors hover:bg-[#1e2730]"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-xs font-bold text-primary">
                {selectedServer.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-white">
                {selectedServer.name}
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown content */}
          <div
            className={`grid transition-all duration-200 ease-out ${
              isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="border-t border-[#1e2730]">
                {/* Servers with bot */}
                {serversWithBot.map((server) => (
                  <Link
                    key={server.id}
                    href={`/dashboard/${server.id}`}
                    onClick={() => setSelectedServer(server)}
                    className={`flex items-center justify-between px-3 py-2.5 transition-colors hover:bg-[#1e2730] ${
                      selectedServer.id === server.id ? "bg-[#1e2730]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-xs font-bold text-primary">
                        {server.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-white">
                        {server.name}
                      </span>
                    </div>
                    {selectedServer.id === server.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </Link>
                ))}

                {/* Divider */}
                {serversWithoutBot.length > 0 && (
                  <div className="mx-3 my-2 border-t border-[#1e2730]" />
                )}

                {/* Servers without bot - add option */}
                {serversWithoutBot.map((server) => (
                  <button
                    key={server.id}
                    className="flex w-full items-center justify-between px-3 py-2.5 transition-colors hover:bg-[#1e2730]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-700 text-xs font-bold text-gray-400">
                        {server.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-400">
                        {server.name}
                      </span>
                    </div>
                    <Plus className="h-4 w-4 text-gray-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sign out link */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 transition-colors hover:text-gray-300"
          >
            Sign out
          </Link>
        </div>
      </div>
    </div>
  )
}
