"use client"

import { useState } from "react"
import {
  DollarSign,
  ShoppingCart,
  Users,
  Info,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DiscordIcon } from "@/components/discord-icon"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts"

const chartData = [
  { time: "00:00", revenue: 0, orders: 0 },
  { time: "02:00", revenue: 0.2, orders: 0.1 },
  { time: "04:00", revenue: 0.5, orders: 0.3 },
  { time: "06:00", revenue: 0.8, orders: 0.4 },
  { time: "08:00", revenue: 1.2, orders: 0.6 },
  { time: "10:00", revenue: 1.5, orders: 0.8 },
  { time: "12:00", revenue: 1.8, orders: 1.0 },
  { time: "14:00", revenue: 2.0, orders: 1.2 },
  { time: "16:00", revenue: 1.8, orders: 1.0 },
  { time: "18:00", revenue: 1.5, orders: 0.9 },
  { time: "20:00", revenue: 1.2, orders: 0.7 },
  { time: "22:00", revenue: 0.8, orders: 0.5 },
]

const announcements = [
  {
    title: "Platform Update - January 2026",
    description: "Categories & Search, New Payment Methods...",
    date: "2 months ago",
  },
  {
    title: "Platform Update - September 2025",
    description: "New Payment Methods, Security Improvements",
    date: "6 months ago",
  },
  {
    title: "Platform Update - July 2025",
    description: "Blog, Affiliate, Addons, Manual Payment Methods",
    date: "8 months ago",
  },
]

const recentOrders = [
  {
    product: "Ancient - ARC Raiders",
    price: "$44.00",
    paid: "+$44.00",
    method: "Stripe",
    email: "burhan.goliqi5@hotmail.com",
    time: "2 days ago",
  },
  {
    product: "Premium License Key",
    price: "$29.99",
    paid: "+$29.99",
    method: "PayPal",
    email: "john.doe@gmail.com",
    time: "3 days ago",
  },
  {
    product: "VIP Membership",
    price: "$99.00",
    paid: "+$99.00",
    method: "Crypto",
    email: "crypto.user@proton.me",
    time: "4 days ago",
  },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"revenue" | "traffic">("revenue")

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1
          className="text-xl sm:text-2xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Dashboard
        </h1>
        <p className="mt-1 font-sans text-sm font-normal text-muted-foreground">
          Discover the latest updates and insights regarding your store today.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-4 overflow-x-auto border-b border-border">
        <button
          onClick={() => setActiveTab("revenue")}
          className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
            activeTab === "revenue"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Revenue & Orders
        </button>
        <button
          onClick={() => setActiveTab("traffic")}
          className={`flex items-center gap-2 whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
            activeTab === "traffic"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Traffic & Visitors
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
            NEW!
          </span>
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Main content area */}
        <div className="space-y-6 xl:col-span-2">
          {/* Stats cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-sans text-sm font-medium text-muted-foreground">
                  Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className="text-xl sm:text-2xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  $0.00
                </div>
                <p className="mt-1 font-sans text-xs font-normal text-muted-foreground">
                  — 0.00%
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-sans text-sm font-medium text-muted-foreground">
                  New Orders
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className="text-xl sm:text-2xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  0
                </div>
                <p className="mt-1 font-sans text-xs font-normal text-muted-foreground">
                  — 0.00%
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-sans text-sm font-medium text-muted-foreground">
                  New Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className="text-xl sm:text-2xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  0
                </div>
                <p className="mt-1 font-sans text-xs font-normal text-muted-foreground">
                  — 0.00%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle
                className="text-base sm:text-lg font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Revenue & Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11 }}
                      stroke="var(--muted-foreground)"
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      stroke="var(--muted-foreground)"
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={false}
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                      name="Orders"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle
                className="text-base sm:text-lg font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Latest Completed Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Products
                      </th>
                      <th className="pb-3 font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Price
                      </th>
                      <th className="pb-3 font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Paid
                      </th>
                      <th className="pb-3 font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Payment
                      </th>
                      <th className="pb-3 font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        E-mail
                      </th>
                      <th className="pb-3 font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="py-3 font-sans text-sm font-medium text-foreground">
                          {order.product}
                        </td>
                        <td className="py-3 font-sans text-sm text-muted-foreground">
                          {order.price}
                        </td>
                        <td className="py-3">
                          <span className="rounded bg-green-500/10 px-2 py-0.5 font-sans text-sm font-medium text-green-600">
                            {order.paid}
                          </span>
                        </td>
                        <td className="py-3 font-sans text-sm text-muted-foreground">
                          {order.method}
                        </td>
                        <td className="py-3 font-sans text-sm text-muted-foreground truncate max-w-[150px]">
                          {order.email}
                        </td>
                        <td className="py-3 font-sans text-sm text-muted-foreground whitespace-nowrap">
                          {order.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Stay up to date */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle
                className="text-base sm:text-lg font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Stay Up To Date With{" "}
                <span className="text-primary">Guild Pay</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row xl:flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-border/60"
                >
                  <DiscordIcon className="mr-2 h-4 w-4" />
                  Join Discord
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-border/60"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  Join Telegram
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle
                className="text-base sm:text-lg font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span className="text-primary">Guild Pay</span> Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Info className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                        <h4 className="font-sans text-sm font-medium text-foreground">
                          {announcement.title}
                        </h4>
                        <span className="flex-shrink-0 font-sans text-xs text-muted-foreground">
                          {announcement.date}
                        </span>
                      </div>
                      <p className="mt-0.5 font-sans text-xs text-muted-foreground">
                        {announcement.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
