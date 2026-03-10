import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CTASection } from "@/components/cta-section"

const team = [
  {
    name: "Alex Chen",
    role: "Founder & CEO",
    bio: "Former Discord engineer with 8+ years of experience building scalable platforms.",
  },
  {
    name: "Sarah Kim",
    role: "CTO",
    bio: "Blockchain expert and full-stack developer passionate about decentralized commerce.",
  },
  {
    name: "Marcus Johnson",
    role: "Head of Product",
    bio: "Product leader with experience at major fintech companies and crypto startups.",
  },
  {
    name: "Elena Rodriguez",
    role: "Head of Design",
    bio: "Award-winning designer focused on creating intuitive user experiences.",
  },
]

const milestones = [
  {
    year: "2022",
    title: "Founded",
    description: "Guild Pay was born from the idea of bringing seamless commerce to Discord communities.",
  },
  {
    year: "2023",
    title: "10K Servers",
    description: "Reached 10,000 active Discord servers using Guild Pay for their marketplace needs.",
  },
  {
    year: "2024",
    title: "$50M Processed",
    description: "Processed over $50 million in transactions across all marketplace channels.",
  },
  {
    year: "2025",
    title: "Enterprise Launch",
    description: "Launched enterprise solutions for large-scale marketplace operations.",
  },
]

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 lg:py-28">
          {/* Background gradient */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-medium text-primary">About Us</span>
              <h1 className="mt-2 text-balance font-mono text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Building the Future of Discord Commerce
              </h1>
              <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
                We believe communities should be able to transact as easily as they communicate. 
                Guild Pay makes that possible.
              </p>
            </div>

            {/* Mission section */}
            <div className="mt-20 grid gap-8 lg:grid-cols-2">
              <div className="rounded-2xl border border-border/40 bg-card/30 p-8">
                <h2 className="font-mono text-2xl font-bold text-foreground">Our Mission</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  To empower Discord communities with the tools they need to create thriving marketplaces. 
                  We&apos;re building infrastructure that makes buying and selling as natural as chatting, 
                  enabling creators, businesses, and communities to monetize their presence effectively.
                </p>
              </div>
              <div className="rounded-2xl border border-border/40 bg-card/30 p-8">
                <h2 className="font-mono text-2xl font-bold text-foreground">Our Vision</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  A world where every Discord server can become a marketplace. Where trust is built into 
                  the platform, transactions are instant, and community commerce is accessible to everyone 
                  regardless of technical expertise or resources.
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-20">
              <h2 className="text-center font-mono text-2xl font-bold text-foreground">Our Journey</h2>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="relative rounded-2xl border border-border/40 bg-card/30 p-6"
                  >
                    <span className="font-mono text-3xl font-bold text-primary">
                      {milestone.year}
                    </span>
                    <h3 className="mt-2 font-mono font-semibold text-foreground">
                      {milestone.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {milestone.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Team */}
            <div className="mt-20">
              <h2 className="text-center font-mono text-2xl font-bold text-foreground">
                Meet the Team
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
                We&apos;re a small but mighty team of engineers, designers, and product experts 
                passionate about building great tools for communities.
              </p>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {team.map((member, index) => (
                  <div
                    key={index}
                    className="group rounded-2xl border border-border/40 bg-card/30 p-6 transition-all hover:border-primary/30 hover:bg-card/50"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                      <span className="font-mono text-xl font-bold text-primary">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <h3 className="mt-4 font-mono font-semibold text-foreground">
                      {member.name}
                    </h3>
                    <p className="text-sm text-primary">{member.role}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{member.bio}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Values */}
            <div className="mt-20 rounded-2xl border border-border/40 bg-gradient-to-br from-primary/5 to-accent/5 p-8 lg:p-12">
              <h2 className="text-center font-mono text-2xl font-bold text-foreground">
                Our Values
              </h2>
              <div className="mt-10 grid gap-8 md:grid-cols-3">
                <div className="text-center">
                  <h3 className="font-mono font-semibold text-foreground">Community First</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Every feature we build starts with the community in mind. We listen, learn, and iterate based on real feedback.
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="font-mono font-semibold text-foreground">Trust & Security</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We take security seriously. From encryption to escrow, we build trust into every transaction.
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="font-mono font-semibold text-foreground">Simplicity</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Complex under the hood, simple to use. We believe powerful tools shouldn&apos;t require a manual.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
