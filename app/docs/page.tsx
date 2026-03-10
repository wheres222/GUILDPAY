import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground">Documentation</h1>
        <p className="mt-4 text-muted-foreground">
          Docs hub for bot setup, product management, checkout flow, and webhook events.
        </p>
      </main>
      <Footer />
    </div>
  )
}
