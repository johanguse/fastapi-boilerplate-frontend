import {
  Activity,
  BarChart3,
  Bell,
  Bug,
  Building2,
  Construction,
  FileText,
  FileX,
  HelpCircle,
  LayoutDashboard,
  ListTodo,
  Lock,
  MessagesSquare,
  Monitor,
  Package,
  Palette,
  ServerOff,
  Settings,
  Shield,
  ShieldCheck,
  UserCog,
  Users,
  UserX,
  Wrench,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useOrganizations } from '@/hooks/use-organizations'
import { useAuth } from '@/stores/auth-store'
import { type SidebarData } from '../types'

export function useSidebarData(): SidebarData {
  const { t } = useTranslation()
  const { user, isAdmin } = useAuth()
  const { activeOrganization } = useOrganizations()

  return useMemo(
    (): SidebarData => ({
      user: {
        name: user?.name || t('common.loading', 'Loading...'),
        email: user?.email || t('common.loading', 'Loading...'),
        avatar: '/avatars/shadcn.jpg',
      },
      teams: [
        {
          name:
            activeOrganization?.name ||
            t('organizations.title', 'Organizations'),
          logo: Building2,
          plan: activeOrganization?.plan || 'Free',
        },
      ],
      navGroups: [
        {
          title: t('common.general', 'General'),
          items: [
            {
              title: t('navigation.dashboard', 'Dashboard'),
              url: '/',
              icon: LayoutDashboard,
            },
            {
              title: t('navigation.organizations', 'Organizations'),
              url: '/organizations',
              icon: Building2,
            },
          ],
        },
        {
          title: t('navigation.aiApplications', 'AI Applications'),
          items: [
            {
              title: t('navigation.aiDocuments', 'AI Documents'),
              url: '/ai-documents',
              icon: FileText,
            },
            {
              title: t('navigation.aiContent', 'AI Content'),
              url: '/ai-content',
              icon: MessagesSquare,
            },
            {
              title: t('navigation.aiAnalytics', 'AI Analytics'),
              url: '/ai-analytics',
              icon: BarChart3,
            },
          ],
        },
        {
          title: t('navigation.staticPages', 'Static Pages & Examples'),
          items: [
            {
              title: t('navigation.dashboardDemo', 'Dashboard Demo'),
              url: '/dashboard-demo',
              icon: LayoutDashboard,
            },
            {
              title: t('navigation.tasks', 'Tasks'),
              url: '/tasks',
              icon: ListTodo,
            },
            {
              title: t('navigation.apps', 'Apps'),
              url: '/apps',
              icon: Package,
            },
            {
              title: t('navigation.chats', 'Chats'),
              url: '/chats',
              badge: '3',
              icon: MessagesSquare,
            },
            {
              title: t('navigation.users', 'Users'),
              url: '/users',
              icon: Users,
            },
            {
              title: t('navigation.settings', 'Settings'),
              icon: Settings,
              items: [
                {
                  title: t('settings.nav.profile', 'Profile'),
                  url: '/settings',
                  icon: UserCog,
                },
                {
                  title: t('settings.nav.account', 'Account'),
                  url: '/settings/account',
                  icon: Wrench,
                },
                {
                  title: t('settings.nav.appearance', 'Appearance'),
                  url: '/settings/appearance',
                  icon: Palette,
                },
                {
                  title: t('settings.nav.notifications', 'Notifications'),
                  url: '/settings/notifications',
                  icon: Bell,
                },
                {
                  title: t('settings.nav.display', 'Display'),
                  url: '/settings/display',
                  icon: Monitor,
                },
              ],
            },
            {
              title: t('navigation.helpCenter', 'Help Center'),
              url: '/help-center',
              icon: HelpCircle,
            },
            {
              title: t('navigation.auth', 'Authentication'),
              icon: ShieldCheck,
              items: [
                {
                  title: t('auth.signIn', 'Sign In'),
                  url: '/sign-in',
                },
                {
                  title: t('auth.signIn', 'Sign In') + ' (2 Col)',
                  url: '/sign-in-2',
                },
                {
                  title: t('auth.signUp', 'Sign Up'),
                  url: '/sign-up',
                },
                {
                  title: t('auth.forgotPassword', 'Forgot Password'),
                  url: '/forgot-password',
                },
                {
                  title: t('auth.otp', 'OTP'),
                  url: '/otp',
                },
              ],
            },
            {
              title: t('navigation.errors', 'Errors'),
              icon: Bug,
              items: [
                {
                  title: t('auth.unauthorized', 'Unauthorized'),
                  url: '/errors/unauthorized',
                  icon: Lock,
                },
                {
                  title: t('auth.forbidden', 'Forbidden'),
                  url: '/errors/forbidden',
                  icon: UserX,
                },
                {
                  title: t('auth.notFound', 'Not Found'),
                  url: '/errors/not-found',
                  icon: FileX,
                },
                {
                  title: t('auth.internalServerError', 'Internal Server Error'),
                  url: '/errors/internal-server-error',
                  icon: ServerOff,
                },
                {
                  title: t('auth.maintenanceError', 'Maintenance Error'),
                  url: '/errors/maintenance-error',
                  icon: Construction,
                },
              ],
            },
          ],
        },
        // Admin section - only show for admins
        ...(isAdmin
          ? [
              {
                title: t('admin.sideMenu.admin', 'Admin'),
                items: [
                  {
                    title: t('admin.sideMenu.reports', 'Reports & Analytics'),
                    url: '/admin/reports',
                    icon: Shield,
                  },
                  {
                    title: t('admin.sideMenu.users', 'All Users'),
                    url: '/admin/users',
                    icon: Users,
                  },
                  {
                    title: t('admin.sideMenu.activity', 'Activity Logs'),
                    url: '/admin/activity-logs',
                    icon: Activity,
                  },
                ],
              },
            ]
          : []),
      ],
    }),
    [t, user, isAdmin, activeOrganization]
  )
}
