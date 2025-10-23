import { useTranslation } from 'react-i18next'
import { ContentSection } from '../components/content-section'
import { ProfileForm } from './profile-form'

export function SettingsProfile() {
  const { t } = useTranslation()

  return (
    <ContentSection
      title={t('settings.profile.title', 'Profile')}
      desc={t(
        'settings.profile.description',
        'This is how others will see you on the site.'
      )}
    >
      <ProfileForm />
    </ContentSection>
  )
}
