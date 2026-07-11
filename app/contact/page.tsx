"use client"

import { useState } from "react"
import { Mail, MessageSquare, Clock, MapPin } from "lucide-react"
import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const contactInfo = [
  { icon: Mail, title: "Email", description: "We typically respond within 24 hours", value: "support@guildpay.io" },
  { icon: MessageSquare, title: "Discord", description: "Join our community for instant support", value: "discord.gg/guildpay" },
  { icon: Clock, title: "Response time", description: "We aim to respond as quickly as possible", value: "< 24 hours" },
  { icon: MapPin, title: "Location", description: "Remote-first company", value: "Global" },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader
        eyebrow="Contact"
        title="Get in touch"
        subtitle="Have questions? Send us a message and we'll respond as soon as possible."
      />

      <main className="mx-auto -mt-16 max-w-6xl px-4 pb-24 sm:-mt-20 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
              Send us a message
            </h2>
            <p className="mt-2 text-sm text-slate-500">Fill out the form and we&apos;ll get back to you shortly.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
                  <Input id="name" placeholder="Your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                  <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-slate-700">Subject</label>
                <Input id="subject" placeholder="How can we help?" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
              </div>
              <div>
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-slate-700">Message</label>
                <Textarea id="message" placeholder="Tell us more about your inquiry…" rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="resize-none" />
              </div>
              <Button type="submit" className="w-full">
                Send message
              </Button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-4">
            {contactInfo.map((item) => (
              <div key={item.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  <p className="mt-2 font-medium text-primary">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
