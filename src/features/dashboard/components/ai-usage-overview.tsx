import { BarChart3, Brain, FileText, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function AIUsageOverview() {
  const usageData = {
    totalCredits: 1000,
    usedCredits: 247,
    features: [
      { name: 'Documents', used: 89, total: 200, icon: FileText },
      { name: 'Content', used: 156, total: 300, icon: MessageSquare },
      { name: 'Analytics', used: 23, total: 100, icon: BarChart3 },
    ],
  }

  const usagePercentage = (usageData.usedCredits / usageData.totalCredits) * 100

  return (
    <div className='space-y-4'>
      {/* Overall Usage */}
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 font-medium text-sm'>
            <Brain className='h-4 w-4' />
            AI Credits Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span>
                {usageData.usedCredits} / {usageData.totalCredits} credits
              </span>
              <span className='text-muted-foreground'>
                {usagePercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={usagePercentage} className='h-2' />
          </div>
        </CardContent>
      </Card>

      {/* Feature Breakdown */}
      <div className='space-y-2'>
        {usageData.features.map((feature) => {
          const Icon = feature.icon
          const percentage = (feature.used / feature.total) * 100

          return (
            <Card key={feature.name}>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Icon className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium text-sm'>{feature.name}</span>
                  </div>
                  <Badge variant='outline' className='text-xs'>
                    {feature.used}/{feature.total}
                  </Badge>
                </div>
                <Progress value={percentage} className='mt-2 h-1' />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
