import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-4 text-muted-foreground">Draft privacy page. Replace with legal copy before launch.</p>
      </main>
      <Footer />
    </div>
  )
}
