import { createFileRoute } from '@tanstack/react-router'
import { OAuthCallback } from '@/components/auth/oauth-callback'

export const Route = createFileRoute('/(auth)/oauth/microsoft/callback')({
  component: () => <OAuthCallback provider='microsoft' />,
})
