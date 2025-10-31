import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuth, useAuthStore } from '@/stores/auth-store'
import { OnboardingComplete } from './components/onboarding-complete'
import { OnboardingOrganization } from './components/onboarding-organization'
import { OnboardingProfile } from './components/onboarding-profile'
import { OnboardingProvider } from './context/onboarding-context'

function OnboardingContent() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Set initial step from user data
  useEffect(() => {
    if (user) {
      const step = user.onboarding_step || 0
      setCurrentStep(step)
      setIsLoading(false)
    }
  }, [user])

  const handleStepComplete = async (step: number) => {
    // If completing step 2 (organization), move to step 3 (complete/welcome screen)
    // Step 2 already saved everything via save-all, so onboarding is complete
    if (step === 2) {
      // Refresh auth store to get updated user data
      const { checkSession } = useAuthStore.getState()
      await checkSession()
      // Move to step 3 (welcome screen)
      setCurrentStep(2)
    } else {
      setCurrentStep(step)
    }
  }

  const handleNavigateToDashboard = () => {
    navigate({ to: '/' })
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
                        onComplete={handleNavigateToDashboard}
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

export function Onboarding() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  )
}
