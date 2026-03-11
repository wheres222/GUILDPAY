import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const pathname = req.nextUrl.pathname

  const protectedPath = pathname.startsWith("/dashboard") || pathname.startsWith("/select-server")
  if (!protectedPath) return NextResponse.next()

  if (!req.auth) {
    const signInUrl = new URL("/signin", req.nextUrl.origin)
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/select-server"],
}
