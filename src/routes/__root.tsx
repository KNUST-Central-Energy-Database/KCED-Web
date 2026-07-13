import { createRootRoute, Outlet, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Toaster } from "@/components/ui/sonner"

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const router = useRouter()

  // Re-run route guards (beforeLoad) when the user actually signs in or out, so
  // a protected page can't linger after sign-out. Mirrors the mobile router's
  // refreshListenable.
  //
  // Supabase re-emits SIGNED_IN every time the tab regains focus, so we can't
  // invalidate on the event alone — that would re-run guards (and their network
  // calls) on every tab switch, flashing a reload. Instead we track the current
  // user id and only invalidate when the identity genuinely changes.
  useEffect(() => {
    let currentUserId: string | null | undefined // undefined = not yet seen

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUserId = session?.user?.id ?? null
      if (currentUserId === undefined) {
        currentUserId = nextUserId // seed on the first (INITIAL_SESSION) event
        return
      }
      if (nextUserId !== currentUserId) {
        currentUserId = nextUserId
        router.invalidate()
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  return (
    <>
      <main>
        <Outlet />
      </main>

      <Toaster
        richColors
        toastOptions={{
          classNames: {
            error: '!text-red-700 !border-red-200 !bg-red-50 !border',
            success: '!bg-emerald-50 !text-emerald-900 !border-emerald-200',
            warning: '!bg-amber-50 !text-amber-900 !border-amber-200',
            info: '!bg-blue-50 !text-blue-900 !border-blue-200',
          },
        }}
        position="top-center"
      />
    </>
  )
}