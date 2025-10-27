import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/stores/auth-store'
import { OnboardingComplete } from './components/onboarding-complete'
import { OnboardingOrganization } from './components/onboarding-organization'
import { OnboardingProfile } from './components/onboarding-profile'

export function Onboarding() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Set initial step from user data
  useEffect(() => {
    if (user) {
      setCurrentStep(user.onboarding_step || 0)
      setIsLoading(false)
    }
  }, [user])

  const handleStepComplete = (step: number) => {
    setCurrentStep(step)
  }

  const handleOnboardingComplete = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/onboarding/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ completed: true }),
        }
      )

      if (response.ok) {
        toast.success(
          t(
            'onboarding.success.completed',
            'Welcome! Your account is all set up.'
          )
        )
        navigate({ to: '/' })
      } else {
        throw new Error('Failed to complete onboarding')
      }
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Error logging for debugging
      console.error('Failed to complete onboarding:', error)
      toast.error(
        t('onboarding.error.complete', 'Failed to complete onboarding')
      )
    }
  }

  if (isLoading || !user) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2'></div>
          <p className='text-muted-foreground'>
            {t('onboarding.loading', 'Loading onboarding...')}
          </p>
        </div>
      </div>
    )
  }

  const steps = [
    {
      id: 'profile',
      title: t('onboarding.steps.profile.title', 'Complete Your Profile'),
      description: t(
        'onboarding.steps.profile.description',
        'Tell us a bit about yourself'
      ),
    },
    {
      id: 'organization',
      title: t(
        'onboarding.steps.organization.title',
        'Create Your Organization'
      ),
      description: t(
        'onboarding.steps.organization.description',
        'Set up your workspace'
      ),
    },
    {
      id: 'complete',
      title: t('onboarding.steps.complete.title', "You're All Set!"),
      description: t(
        'onboarding.steps.complete.description',
        'Welcome to your new workspace'
      ),
    },
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-8'>
        <div className='mx-auto max-w-2xl'>
          {/* Header */}
          <div className='mb-8 text-center'>
            <h1 className='mb-2 font-bold text-3xl'>
              {t('onboarding.title', 'Welcome to Your Workspace')}
            </h1>
            <p className='mb-6 text-muted-foreground'>
              {t(
                'onboarding.subtitle',
                "Let's get you set up in just a few steps"
              )}
            </p>

            {/* Progress */}
            <div className='space-y-2'>
              <div className='flex justify-between text-muted-foreground text-sm'>
                <span>{t('onboarding.progress', 'Progress')}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className='h-2' />
            </div>
          </div>

          {/* Steps */}
          <div className='space-y-6'>
            {steps.map((step, index) => (
              <Card
                key={step.id}
                className={`transition-all duration-200 ${
                  index === currentStep ? 'ring-2 ring-primary' : ''
                } ${index < currentStep ? 'opacity-60' : ''}`}
              >
                <CardHeader>
                  <div className='flex items-center space-x-3'>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full font-medium text-sm ${
                        index < currentStep
                          ? 'bg-primary text-primary-foreground'
                          : index === currentStep
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index < currentStep ? '✓' : index + 1}
                    </div>
                    <div>
                      <CardTitle className='text-lg'>{step.title}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                {index === currentStep && (
                  <CardContent>
                    {step.id === 'profile' && (
                      <OnboardingProfile
                        onComplete={() => handleStepComplete(1)}
                        user={user}
                      />
                    )}
                    {step.id === 'organization' && (
                      <OnboardingOrganization
                        onComplete={() => handleStepComplete(2)}
                      />
                    )}
                    {step.id === 'complete' && (
                      <OnboardingComplete
                        onComplete={handleOnboardingComplete}
                        user={user}
                      />
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
