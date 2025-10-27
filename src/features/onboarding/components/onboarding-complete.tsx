import { BarChart3, CheckCircle, Rocket, Users, Zap } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import type { User as UserType } from '@/lib/auth'

interface OnboardingCompleteProps {
  onComplete: () => void
  user: UserType | null
}

export function OnboardingComplete({
  onComplete,
  user,
}: OnboardingCompleteProps) {
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
      description: t(
        'onboarding.complete.features.team.description',
        'Invite team members and work together seamlessly'
      ),
    },
    {
      icon: BarChart3,
      title: t(
        'onboarding.complete.features.analytics.title',
        'Analytics Dashboard'
      ),
      description: t(
        'onboarding.complete.features.analytics.description',
        'Track your progress with detailed insights'
      ),
    },
    {
      icon: Zap,
      title: t(
        'onboarding.complete.features.automation.title',
        'AI-Powered Tools'
      ),
      description: t(
        'onboarding.complete.features.automation.description',
        'Leverage AI to boost your productivity'
      ),
    },
  ]

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
          <CheckCircle className='h-8 w-8 text-green-600' />
        </div>
        <h3 className='mb-2 font-semibold text-xl'>
          {t('onboarding.complete.title', "You're All Set!")}
        </h3>
        <p className='text-muted-foreground'>
          {t(
            'onboarding.complete.description',
            "Welcome to your new workspace. Let's explore what you can do!"
          )}
        </p>
      </div>

      {/* Welcome Message */}
      <div className='rounded-lg border border-primary/20 bg-primary/5 p-6'>
        <div className='flex items-start space-x-3'>
          <Rocket className='mt-1 h-6 w-6 text-primary' />
          <div>
            <h4 className='mb-2 font-semibold text-primary'>
              {t('onboarding.complete.welcome.title', 'Welcome, {name}!', {
                name: user?.name || 'User',
              })}
            </h4>
            <p className='text-muted-foreground text-sm'>
              {t(
                'onboarding.complete.welcome.description',
                'Your workspace is ready. You can now start collaborating with your team and exploring all the features we have to offer.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className='space-y-4'>
        <h4 className='text-center font-semibold'>
          {t('onboarding.complete.features.title', 'What you can do now:')}
        </h4>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {features.map((feature, index) => (
            <div key={index} className='rounded-lg border p-4 text-center'>
              <feature.icon className='mx-auto mb-3 h-8 w-8 text-primary' />
              <h5 className='mb-2 font-medium'>{feature.title}</h5>
              <p className='text-muted-foreground text-sm'>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className='rounded-lg bg-muted/50 p-4'>
        <h4 className='mb-3 font-medium'>
          {t('onboarding.complete.nextSteps.title', 'Next Steps:')}
        </h4>
        <ul className='space-y-2 text-muted-foreground text-sm'>
          <li className='flex items-center space-x-2'>
            <CheckCircle className='h-4 w-4 text-green-600' />
            <span>
              {t(
                'onboarding.complete.nextSteps.profile',
                'Complete your profile'
              )}
            </span>
          </li>
          <li className='flex items-center space-x-2'>
            <CheckCircle className='h-4 w-4 text-green-600' />
            <span>
              {t(
                'onboarding.complete.nextSteps.organization',
                'Create your organization'
              )}
            </span>
          </li>
          <li className='flex items-center space-x-2'>
            <div className='h-4 w-4 rounded-full border-2 border-primary'></div>
            <span>
              {t(
                'onboarding.complete.nextSteps.explore',
                'Explore your dashboard'
              )}
            </span>
          </li>
          <li className='flex items-center space-x-2'>
            <div className='h-4 w-4 rounded-full border-2 border-muted-foreground/30'></div>
            <span>
              {t('onboarding.complete.nextSteps.invite', 'Invite team members')}
            </span>
          </li>
        </ul>
      </div>

      <div className='flex justify-center pt-4'>
        <Button onClick={handleComplete} disabled={isCompleting} size='lg'>
          {isCompleting ? (
            <>
              <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent' />
              {t('onboarding.complete.finishing', 'Finishing setup...')}
            </>
          ) : (
            <>
              <Rocket className='mr-2 h-4 w-4' />
              {t('onboarding.complete.getStarted', 'Get Started')}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
