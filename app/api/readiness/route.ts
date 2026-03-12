import { NextResponse } from "next/server"
import { computeReadiness } from "@/lib/readiness"

export async function GET() {
  const readiness = await computeReadiness()
  return NextResponse.json({ success: true, readiness })
}
