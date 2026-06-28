import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner"

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
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