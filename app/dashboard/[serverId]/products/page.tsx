"use client"

import { useState } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const products = [
  {
    id: "1",
    name: "Premium License Key",
    price: "$29.99",
    stock: 150,
    sold: 423,
    status: "Active",
    category: "Digital",
  },
  {
    id: "2",
    name: "VIP Membership - Monthly",
    price: "$9.99/mo",
    stock: "Unlimited",
    sold: 1205,
    status: "Active",
    category: "Subscription",
  },
  {
    id: "3",
    name: "Ancient - ARC Raiders",
    price: "$44.00",
    stock: 25,
    sold: 89,
    status: "Active",
    category: "Gaming",
  },
  {
    id: "4",
    name: "Discord Nitro Gift",
    price: "$9.99",
    stock: 0,
    sold: 567,
    status: "Out of Stock",
    category: "Digital",
  },
  {
    id: "5",
    name: "Custom Bot Development",
    price: "$199.00",
    stock: "Service",
    sold: 34,
    status: "Active",
    category: "Services",
  },
]

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            Products
          </h1>
          <p className="mt-1 font-sans text-sm font-normal text-muted-foreground">
            Manage your products, pricing, and inventory
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search and filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border/60 bg-card py-2.5 pl-10 pr-4 font-sans text-sm font-normal text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <select className="rounded-lg border border-border/60 bg-card px-4 py-2.5 font-sans text-sm font-normal text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
            <option>All Categories</option>
            <option>Digital</option>
            <option>Subscription</option>
            <option>Gaming</option>
            <option>Services</option>
          </select>
          <select className="rounded-lg border border-border/60 bg-card px-4 py-2.5 font-sans text-sm font-normal text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
            <option>All Status</option>
            <option>Active</option>
            <option>Out of Stock</option>
            <option>Draft</option>
          </select>
        </div>
      </div>

      {/* Products table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Sold
                  </th>
                  <th className="px-6 py-4 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border/50 transition-colors hover:bg-muted/50"
                  >
                    <td className="px-6 py-4">
                      <span className="font-sans text-sm font-medium text-foreground">
                        {product.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-sans text-sm text-foreground">
                        {product.price}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-sans text-sm text-muted-foreground">
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-sans text-sm text-muted-foreground">
                        {product.sold}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 font-sans text-xs font-medium text-secondary-foreground">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-sans text-xs font-medium ${
                          product.status === "Active"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {product.status}
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
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
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
