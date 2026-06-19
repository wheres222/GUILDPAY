import { LandingHero } from "@/components/landing-hero"
import { LandingBody } from "@/components/landing-body"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <LandingHero />
      <LandingBody />
    </main>
  )
}
