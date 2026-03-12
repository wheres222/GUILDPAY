import Link from "next/link"
import { Button } from "@/components/ui/button"
import { computeReadiness } from "@/lib/readiness"

const ERROR_COPY: Record<string, string> = {
  Configuration: "Auth provider configuration is invalid or missing.",
  AccessDenied: "Access was denied by the provider.",
  Verification: "Verification failed. Try again.",
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const code = params?.error || "Unknown"
  const message = ERROR_COPY[code] || "Authentication failed. Please try again."
  const readiness = await computeReadiness()

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-4">
      <div className="w-full rounded-xl border border-border/60 bg-card p-6 text-center shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Sign-in Error</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <p className="mt-1 text-xs text-muted-foreground">Error code: {code}</p>

        {readiness.notes.length ? (
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-left text-xs text-amber-200">
            <p className="font-medium">Readiness checks:</p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {readiness.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-2">
          <Button asChild>
            <Link href="/signin">Try Again</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/select-server?demo=1">Continue in Demo Mode</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
