import {
  BarChart3,
  BookOpen,
  FileText,
  History,
  Plus,
  Settings,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ContentHistory } from './components/content-history'
import { ContentSettings } from './components/content-settings'
import { ContentTemplates } from './components/content-templates'
import { ContentWizard } from './components/content-wizard'

export default function AIContentPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('wizard')

  return (
    <div className='container mx-auto space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-bold text-3xl tracking-tight'>
            {t('aiContent.title', 'AI Content Studio')}
          </h1>
          <p className='text-muted-foreground'>
            {t(
              'aiContent.description',
              'Generate high-quality content with AI-powered templates and tools'
            )}
          </p>
        </div>
        <Button size='lg' className='gap-2'>
          <Plus className='h-4 w-4' />
          {t('aiContent.createContent', 'Create Content')}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <FileText className='h-5 w-5 text-blue-600' />
              <div>
                <p className='font-medium text-muted-foreground text-sm'>
                  {t('aiContent.totalGenerated', 'Total Generated')}
                </p>
                <p className='font-bold text-2xl'>0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <Sparkles className='h-5 w-5 text-purple-600' />
              <div>
                <p className='font-medium text-muted-foreground text-sm'>
                  {t('aiContent.templatesUsed', 'Templates Used')}
                </p>
                <p className='font-bold text-2xl'>0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <BookOpen className='h-5 w-5 text-green-600' />
              <div>
                <p className='font-medium text-muted-foreground text-sm'>
                  {t('aiContent.wordsGenerated', 'Words Generated')}
                </p>
                <p className='font-bold text-2xl'>0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5 text-orange-600' />
              <div>
                <p className='font-medium text-muted-foreground text-sm'>
                  {t('aiContent.creditsUsed', 'Credits Used')}
                </p>
                <p className='font-bold text-2xl'>0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-6'
      >
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='wizard' className='gap-2'>
            <Wand2 className='h-4 w-4' />
            {t('aiContent.wizard', 'Wizard')}
          </TabsTrigger>
          <TabsTrigger value='templates' className='gap-2'>
            <FileText className='h-4 w-4' />
            {t('aiContent.templates', 'Templates')}
          </TabsTrigger>
          <TabsTrigger value='history' className='gap-2'>
            <History className='h-4 w-4' />
            {t('aiContent.history', 'History')}
          </TabsTrigger>
          <TabsTrigger value='settings' className='gap-2'>
            <Settings className='h-4 w-4' />
            {t('aiContent.settings', 'Settings')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='wizard' className='space-y-6'>
          <ContentWizard />
        </TabsContent>

        <TabsContent value='templates' className='space-y-6'>
          <ContentTemplates />
        </TabsContent>

        <TabsContent value='history' className='space-y-6'>
          <ContentHistory />
        </TabsContent>

        <TabsContent value='settings' className='space-y-6'>
          <ContentSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
