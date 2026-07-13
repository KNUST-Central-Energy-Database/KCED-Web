import type { ReactNode } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppSidebar } from '@/features/dashboard/components/AppSidebar'

/** Dashboard shell: the app sidebar plus a top bar with the collapse trigger. */
export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    // The sidebar menu buttons render tooltips (shown when collapsed to icons),
    // which need a TooltipProvider — this project's SidebarProvider omits one.
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className='flex h-14 shrink-0 items-center gap-2 border-b border-outline px-4'>
            <SidebarTrigger className='-ml-1' />
            {/* <Separator orientation='vertical' className='mx-1 h-5' /> */}
            <h1 className='text-sm font-medium'>Dashboard</h1>
          </header>
          <div className='flex-1 p-6'>{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
