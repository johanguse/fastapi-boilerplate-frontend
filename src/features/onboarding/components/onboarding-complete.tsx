import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { CheckCircle, Rocket, Users, BarChart3, Zap } from 'lucide-react'
import type { User as UserType } from '@/lib/auth'

interface OnboardingCompleteProps {
  onComplete: () => void
  user: UserType | null
}

export function OnboardingComplete({ onComplete, user }: OnboardingCompleteProps) {
  const { t } = useTranslation()
  const [isCompleting, setIsCompleting] = useState(false)

  const handleComplete = async () => {
    setIsCompleting(true)
    // Add a small delay for better UX
    setTimeout(() => {
      onComplete()
    }, 1000)
  }

  const features = [
    {
      icon: Users,
      title: t('onboarding.complete.features.team.title', 'Team Collaboration'),
      description: t('onboarding.complete.features.team.description', 'Invite team members and work together seamlessly'),
    },
    {
      icon: BarChart3,
      title: t('onboarding.complete.features.analytics.title', 'Analytics Dashboard'),
      description: t('onboarding.complete.features.analytics.description', 'Track your progress with detailed insights'),
    },
    {
      icon: Zap,
      title: t('onboarding.complete.features.automation.title', 'AI-Powered Tools'),
      description: t('onboarding.complete.features.automation.description', 'Leverage AI to boost your productivity'),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {t('onboarding.complete.title', 'You\'re All Set!')}
        </h3>
        <p className="text-muted-foreground">
          {t('onboarding.complete.description', 'Welcome to your new workspace. Let\'s explore what you can do!')}
        </p>
      </div>

      {/* Welcome Message */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Rocket className="w-6 h-6 text-primary mt-1" />
          <div>
            <h4 className="font-semibold text-primary mb-2">
              {t('onboarding.complete.welcome.title', 'Welcome, {name}!', { name: user?.name || 'User' })}
            </h4>
            <p className="text-sm text-muted-foreground">
              {t('onboarding.complete.welcome.description', 'Your workspace is ready. You can now start collaborating with your team and exploring all the features we have to offer.')}
            </p>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="space-y-4">
        <h4 className="font-semibold text-center">
          {t('onboarding.complete.features.title', 'What you can do now:')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-4 rounded-lg border">
              <feature.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <h5 className="font-medium mb-2">{feature.title}</h5>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">
          {t('onboarding.complete.nextSteps.title', 'Next Steps:')}
        </h4>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>{t('onboarding.complete.nextSteps.profile', 'Complete your profile')}</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>{t('onboarding.complete.nextSteps.organization', 'Create your organization')}</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full border-2 border-primary"></div>
            <span>{t('onboarding.complete.nextSteps.explore', 'Explore your dashboard')}</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30"></div>
            <span>{t('onboarding.complete.nextSteps.invite', 'Invite team members')}</span>
          </li>
        </ul>
      </div>

      <div className="flex justify-center pt-4">
        <Button onClick={handleComplete} disabled={isCompleting} size="lg">
          {isCompleting ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
              {t('onboarding.complete.finishing', 'Finishing setup...')}
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 mr-2" />
              {t('onboarding.complete.getStarted', 'Get Started')}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
