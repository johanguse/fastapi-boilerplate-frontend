import { BarChart3 } from 'lucide-react'

export function SalesChart() {
  return (
    <div className='h-[300px] w-full'>
      <div className='flex h-full items-center justify-center'>
        <div className='text-center'>
          <BarChart3 className='mx-auto h-12 w-12 text-muted-foreground' />
          <p className='mt-2 text-muted-foreground text-sm'>
            Sales analytics chart would be displayed here
          </p>
          <p className='text-muted-foreground text-xs'>
            Interactive bar chart with sales data over time
          </p>
        </div>
      </div>
    </div>
  )
}
