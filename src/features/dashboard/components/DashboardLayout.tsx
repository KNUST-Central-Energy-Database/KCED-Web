import type { ReactNode } from 'react'
import { AppSidebar } from '@/features/dashboard/components/AppSidebar'
import { UserMenu } from '@/features/dashboard/components/UserMenu'
import { Link } from '@tanstack/react-router'

/** Dashboard shell: a full-width header, with the nav sidebar and content below it. */
export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className='relative h-svh overflow-hidden'>
      <header className='fixed inset-x-0 top-0 flex h-24 items-center justify-between border-b border-outline bg-background/5 backdrop-blur-md'>
        <Link to='/dashboard' className='flex items-center gap-0.5 px-4 md:px-6'>
          <img
            src='/assets/images/knust-logo.png'
            alt='KNUST Crest'
            className='size-14 shrink-0 object-contain'
          />
          <div className='flex flex-col leading-2 pt-2'>
            <span className='font-garamond font-semibold text-lg tracking-tight'>KNUST</span>
            <span className='text-[0.65rem] font-medium text-muted-foreground'>
              Central Energy Database
            </span>
          </div>
        </Link>

        <div className='px-4 md:px-6'>
          <UserMenu />
        </div>
      </header>

      <div className='flex h-full pt-24'>
        <AppSidebar />
        <main className='flex-1 overflow-y-auto p-6'>{children}</main>
      </div>
    </div>
  )
}
