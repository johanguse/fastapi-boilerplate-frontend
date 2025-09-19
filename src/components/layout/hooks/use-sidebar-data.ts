import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  Building2,
} from 'lucide-react'
import { type SidebarData } from '../types'
import { useAuthStore } from '@/stores/auth-store'

export function useSidebarData(): SidebarData {
  const { t } = useTranslation()
  const { user, activeOrganization } = useAuthStore()

  return useMemo((): SidebarData => ({
    user: {
      name: user?.name || t('common.loading'),
      email: user?.email || t('common.loading'),
      avatar: '/avatars/shadcn.jpg',
    },
    teams: [
      {
        name: activeOrganization?.name || t('organizations.title'),
        logo: Building2,
        plan: 'Starter',
      },
    ],
    navGroups: [
      {
        title: t('common.general'),
        items: [
          {
            title: t('navigation.dashboard'),
            url: '/',
            icon: LayoutDashboard,
          },
          {
            title: t('navigation.organizations'),
            url: '/organizations',
            icon: Building2,
          },
          {
            title: t('navigation.tasks'),
            url: '/tasks',
            icon: ListTodo,
          },
          {
            title: t('navigation.apps'),
            url: '/apps',
            icon: Package,
          },
          {
            title: t('navigation.chats'),
            url: '/chats',
            badge: '3',
            icon: MessagesSquare,
          },
          {
            title: t('navigation.users'),
            url: '/users',
            icon: Users,
          },
        ],
      },
      {
        title: t('navigation.pages'),
        items: [
          {
            title: t('navigation.auth'),
            icon: ShieldCheck,
            items: [
              {
                title: t('auth.signIn'),
                url: '/sign-in',
              },
              {
                title: t('auth.signIn') + ' (2 Col)',
                url: '/sign-in-2',
              },
              {
                title: t('auth.signUp'),
                url: '/sign-up',
              },
              {
                title: t('auth.forgotPassword'),
                url: '/forgot-password',
              },
              {
                title: t('auth.otp'),
                url: '/otp',
              },
            ],
          },
          {
            title: t('navigation.errors'),
            icon: Bug,
            items: [
              {
                title: t('auth.unauthorized'),
                url: '/errors/unauthorized',
                icon: Lock,
              },
              {
                title: t('auth.forbidden'),
                url: '/errors/forbidden',
                icon: UserX,
              },
              {
                title: t('auth.notFound'),
                url: '/errors/not-found',
                icon: FileX,
              },
              {
                title: t('auth.internalServerError'),
                url: '/errors/internal-server-error',
                icon: ServerOff,
              },
              {
                title: t('auth.maintenanceError'),
                url: '/errors/maintenance-error',
                icon: Construction,
              },
            ],
          },
        ],
      },
      {
        title: t('navigation.other'),
        items: [
          {
            title: t('navigation.settings'),
            icon: Settings,
            items: [
              {
                title: t('settings.profile'),
                url: '/settings',
                icon: UserCog,
              },
              {
                title: t('settings.account'),
                url: '/settings/account',
                icon: Wrench,
              },
              {
                title: t('settings.appearance'),
                url: '/settings/appearance',
                icon: Palette,
              },
              {
                title: t('settings.notifications'),
                url: '/settings/notifications',
                icon: Bell,
              },
              {
                title: t('settings.display'),
                url: '/settings/display',
                icon: Monitor,
              },
            ],
          },
          {
            title: t('navigation.helpCenter'),
            url: '/help-center',
            icon: HelpCircle,
          },
        ],
      },
    ],
  }), [t, user, activeOrganization])
}