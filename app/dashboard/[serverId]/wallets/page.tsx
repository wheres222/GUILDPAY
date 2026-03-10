"use client"

import { Plus, Wallet, CreditCard, Bitcoin, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const wallets = [
  {
    id: "1",
    name: "Primary Wallet",
    type: "Crypto",
    balance: "$12,450.00",
    address: "0x1234...5678",
    icon: Bitcoin,
    change: "+12.5%",
    positive: true,
  },
  {
    id: "2",
    name: "PayPal Business",
    type: "PayPal",
    balance: "$3,280.50",
    address: "payments@guildpay.io",
    icon: DollarSign,
    change: "+8.2%",
    positive: true,
  },
  {
    id: "3",
    name: "Stripe Account",
    type: "Stripe",
    balance: "$8,920.00",
    address: "acct_1234567890",
    icon: CreditCard,
    change: "-2.1%",
    positive: false,
  },
]

const transactions = [
  {
    id: "1",
    type: "incoming",
    amount: "+$44.00",
    description: "Payment received for Ancient - ARC Raiders",
    wallet: "Stripe Account",
    date: "2 hours ago",
  },
  {
    id: "2",
    type: "incoming",
    amount: "+$29.99",
    description: "Payment received for Premium License Key",
    wallet: "PayPal Business",
    date: "5 hours ago",
  },
  {
    id: "3",
    type: "outgoing",
    amount: "-$150.00",
    description: "Withdrawal to bank account",
    wallet: "Primary Wallet",
    date: "1 day ago",
  },
  {
    id: "4",
    type: "incoming",
    amount: "+$99.00",
    description: "Payment received for VIP Membership",
    wallet: "Primary Wallet",
    date: "2 days ago",
  },
]

export default function WalletsPage() {
  const totalBalance = wallets.reduce((sum, wallet) => {
    const amount = parseFloat(wallet.balance.replace(/[$,]/g, ""))
    return sum + amount
  }, 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Wallets
          </h1>
          <p className="mt-1 font-sans text-sm font-normal text-muted-foreground">
            Manage your payment methods and view transactions
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Wallet
        </Button>
      </div>

      {/* Total balance */}
      <Card className="mb-6 border-border/60 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-sans text-sm font-normal text-muted-foreground">
                Total Balance
              </p>
              <p
                className="text-3xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallets grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wallets.map((wallet) => (
          <Card key={wallet.id} className="border-border/60 transition-all hover:border-primary/40">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <wallet.icon className="h-5 w-5 text-primary" />
                </div>
                <span
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-sans text-xs font-medium ${
                    wallet.positive
                      ? "bg-green-500/10 text-green-600"
                      : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {wallet.positive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {wallet.change}
                </span>
              </div>
              <h3 className="font-sans text-sm font-medium text-foreground">
                {wallet.name}
              </h3>
              <p
                className="mt-1 text-2xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {wallet.balance}
              </p>
              <p className="mt-2 truncate font-sans text-xs text-muted-foreground">
                {wallet.address}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent transactions */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle
            className="text-lg font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      transaction.type === "incoming"
                        ? "bg-green-500/10"
                        : "bg-red-500/10"
                    }`}
                  >
                    {transaction.type === "incoming" ? (
                      <ArrowDownRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-sans text-sm font-medium text-foreground">
                      {transaction.description}
                    </p>
                    <p className="font-sans text-xs text-muted-foreground">
                      {transaction.wallet} • {transaction.date}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-sans text-sm font-medium ${
                    transaction.type === "incoming"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.amount}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
