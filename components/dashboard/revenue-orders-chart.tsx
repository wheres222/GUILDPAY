"use client"

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type ChartPoint = {
  label: string
  revenue: number
  orders: number
}

export function RevenueOrdersChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="h-[260px] w-full sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
          <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={36} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} dot={false} name="Revenue ($)" />
          <Line type="monotone" dataKey="orders" stroke="#ef4444" strokeWidth={2} dot={false} name="Orders" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
