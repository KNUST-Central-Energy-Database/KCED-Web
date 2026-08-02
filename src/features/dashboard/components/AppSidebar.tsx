import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { LogOut, UserRound, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/UserAvatar'
import { signOut } from '@/features/auth/services/auth.service'
import {
  fetchProfile,
  ROLE_LABELS,
  type Profile,
} from '@/features/profile/services/profile.service'

/** Primary dashboard navigation. `to` values must be real, existing routes. */
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', img: '/assets/images/dashboard/dashboard.webp' },
  { to: '/dashboard/service-requests', label: 'Service Requests', img: '/assets/images/dashboard/service-requests.webp' },
  { to: '/dashboard/work-orders', label: 'Work Orders', img: '/assets/images/dashboard/work-orders.webp' },
  { to: '/dashboard/assets', label: 'Assets', img: '/assets/images/dashboard/assets.webp' },
  { to: '/dashboard/users', label: 'Users', img: '/assets/images/dashboard/users.webp' },
  { to: '/dashboard/map', label: 'Map', img: '/assets/images/dashboard/map.webp' },
] as const

export function AppSidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    fetchProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate({ to: '/login' })
  }

  return (
    <nav className='flex w-1/5 shrink-0 flex-col gap-1 overflow-hidden border-r border-outline'>
      <div className='flex flex-col gap-1 p-4'>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'flex items-center gap-2.5 rounded-4xl px-3 py-2 font-medium transition-colors',
              pathname === item.to
                ? 'bg-primary-soft text-on-soft'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            <img src={item.img} alt='' className='size-6 shrink-0' />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div className='mt-auto p-4 border-t'>
        <DropdownMenu>
          <DropdownMenuTrigger
            className='flex w-full items-center gap-3 rounded-4xl p-2 text-left outline-none transition-colors hover:bg-muted'
            aria-label='Account menu'
          >
            <UserAvatar seed={profile?.id ?? 'anonymous'} avatarUrl={profile?.avatarUrl} size={36} />
            <span className='flex min-w-0 flex-col leading-tight'>
              <span className='truncate text-base font-semibold text-foreground'>
                {profile?.fullName || 'User'}
              </span>
              <span className='truncate text-xs text-muted-foreground'>
                {profile ? ROLE_LABELS[profile.role] : '—'}
              </span>
            </span>
            <ChevronUp className='size-4 shrink-0 ml-auto mr-4' />
          </DropdownMenuTrigger>

          <DropdownMenuContent align='end' side='top'>
            <DropdownMenuItem onSelect={() => navigate({ to: '/dashboard/profile' })}>
              <UserRound />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem variant='destructive' onSelect={handleSignOut}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
