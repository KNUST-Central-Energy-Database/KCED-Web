import { Link, useLocation } from '@tanstack/react-router'
import {
  Home,
  LayoutDashboard,
  FilePlus2,
  ClipboardList,
  Wrench,
  Boxes,
  Users,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

/** Primary dashboard navigation. `to` values must be real, existing routes. */
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/service-requests', label: 'Service Requests', icon: ClipboardList },
  { to: '/dashboard/work-orders', label: 'Work Orders', icon: Wrench },
  { to: '/dashboard/assets', label: 'Assets', icon: Boxes },
  { to: '/dashboard/users', label: 'Users', icon: Users },
  { to: '/service-request-form', label: 'New Request', icon: FilePlus2 },
  { to: '/', label: 'Public Site', icon: Home },
] as const

export function AppSidebar() {
  const { pathname } = useLocation()

  return (
    // collapsible="icon" keeps a slim rail (icons + crest) when collapsed;
    // the default "offcanvas" would slide the whole sidebar off-screen.
    <Sidebar collapsible='icon'>
      <SidebarHeader className='p-4 group-data-[collapsible=icon]:p-2'>
        <Link
          to='/dashboard'
          className='flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0'
        >
          <img
            src='/assets/images/knust-logo.png'
            alt='KNUST Crest'
            className='size-10 shrink-0 object-contain'
          />
          <div className='flex flex-col leading-tight transition-all duration-300 ease-in-out origin-left overflow-hidden group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none max-w-[200px] opacity-100'>
            <span className='font-garamond font-semibold text-lg tracking-tight whitespace-nowrap'>
              KNUST
            </span>
            <span className='text-[0.65rem] font-medium text-muted-foreground whitespace-nowrap'>
              Central Energy Database
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={pathname === item.to} tooltip={item.label}>
                    <Link to={item.to}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Account info + sign out moved to the top bar's UserMenu. */}

      <SidebarRail />
    </Sidebar>
  )
}
