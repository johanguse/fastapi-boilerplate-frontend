import { LanguageSwitcher } from '@/components/language-switcher'

export function AuthHeader() {
  return (
    <div className="flex justify-end p-4">
      <LanguageSwitcher />
    </div>
  )
}