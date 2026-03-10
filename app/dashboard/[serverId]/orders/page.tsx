"use client"

import { useState } from "react"
import { Search, MoreHorizontal, Eye, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const orders = [
  {
    id: "ORD-001",
    product: "Ancient - ARC Raiders",
    customer: "burhan.goliqi5@hotmail.com",
    amount: "$44.00",
    status: "Completed",
    paymentMethod: "Stripe",
    date: "Mar 8, 2026",
  },
  {
    id: "ORD-002",
    product: "Premium License Key",
    customer: "john.doe@gmail.com",
    amount: "$29.99",
    status: "Completed",
    paymentMethod: "PayPal",
    date: "Mar 7, 2026",
  },
  {
    id: "ORD-003",
    product: "VIP Membership",
    customer: "crypto.user@proton.me",
    amount: "$99.00",
    status: "Pending",
    paymentMethod: "Crypto",
    date: "Mar 6, 2026",
  },
  {
    id: "ORD-004",
    product: "Discord Nitro Gift",
    customer: "alex.smith@outlook.com",
    amount: "$9.99",
    status: "Refunded",
    paymentMethod: "Stripe",
    date: "Mar 5, 2026",
  },
  {
    id: "ORD-005",
    product: "Custom Bot Development",
    customer: "dev.studio@gmail.com",
    amount: "$199.00",
    status: "Completed",
    paymentMethod: "PayPal",
    date: "Mar 4, 2026",
  },
]

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Orders
          </h1>
          <p className="mt-1 font-sans text-sm font-normal text-muted-foreground">
            View and manage all orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border/60">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="border-border/60">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border/60 bg-card py-2.5 pl-10 pr-4 font-sans text-sm font-normal text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <select className="rounded-lg border border-border/60 bg-card px-4 py-2.5 font-sans text-sm font-normal text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
            <option>All Status</option>
            <option>Completed</option>
            <option>Pending</option>
            <option>Refunded</option>
          </select>
          <select className="rounded-lg border border-border/60 bg-card px-4 py-2.5 font-sans text-sm font-normal text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
            <option>All Payment Methods</option>
            <option>Stripe</option>
            <option>PayPal</option>
            <option>Crypto</option>
          </select>
        </div>
      </div>

      {/* Orders table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border/50 transition-colors hover:bg-muted/50"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-primary">
                        {order.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-sans text-sm font-medium text-foreground">
                        {order.product}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-sans text-sm text-muted-foreground">
                        {order.customer}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-sans text-sm font-medium text-foreground">
                        {order.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-sans text-sm text-muted-foreground">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-sans text-xs font-medium ${
                          order.status === "Completed"
                            ? "bg-green-500/10 text-green-600"
                            : order.status === "Pending"
                            ? "bg-yellow-500/10 text-yellow-600"
                            : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-sans text-sm text-muted-foreground">
                        {order.date}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Resend Delivery
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
