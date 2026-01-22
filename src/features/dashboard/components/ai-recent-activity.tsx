import { BarChart3, Clock, FileText, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function AIRecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'document',
      title: 'Processed contract.pdf',
      timestamp: '2 minutes ago',
      credits: 15,
      icon: FileText,
      status: 'completed',
    },
    {
      id: 2,
      type: 'content',
      title: 'Generated blog post',
      timestamp: '5 minutes ago',
      credits: 8,
      icon: MessageSquare,
      status: 'completed',
    },
    {
      id: 3,
      type: 'analytics',
      title: 'Sales analysis query',
      timestamp: '12 minutes ago',
      credits: 12,
      icon: BarChart3,
      status: 'completed',
    },
    {
      id: 4,
      type: 'document',
      title: 'Processing report.docx',
      timestamp: '18 minutes ago',
      credits: 20,
      icon: FileText,
      status: 'processing',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <div className='space-y-3'>
      {activities.map((activity) => {
        const Icon = activity.icon

        return (
          <Card key={activity.id}>
            <CardContent className='p-4'>
              <div className='flex items-start justify-between'>
                <div className='flex items-start gap-3'>
                  <div className='rounded-lg bg-muted p-2'>
                    <Icon className='h-4 w-4' />
                  </div>
                  <div className='space-y-1'>
                    <p className='font-medium text-sm'>{activity.title}</p>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-3 w-3 text-muted-foreground' />
                      <span className='text-muted-foreground text-xs'>
                        {activity.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='text-xs'>
                    {activity.credits} credits
                  </Badge>
                  <Badge
                    variant='secondary'
                    className={`text-xs ${getStatusColor(activity.status)}`}
                  >
                    {activity.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
