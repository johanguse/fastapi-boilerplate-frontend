import { createFileRoute } from '@tanstack/react-router'
import SettingsFiscal from '@/features/settings/fiscal'

export const Route = createFileRoute('/_authenticated/settings/fiscal')({
  component: SettingsFiscal,
})
