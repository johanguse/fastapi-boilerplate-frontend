import { TrendingUp } from 'lucide-react'

export function Overview() {
  return (
    <div className='h-[300px] w-full'>
      <div className='flex h-full items-center justify-center'>
        <div className='text-center'>
          <TrendingUp className='mx-auto h-12 w-12 text-muted-foreground' />
          <p className='mt-2 text-muted-foreground text-sm'>
            Business overview chart would be displayed here
          </p>
          <p className='text-muted-foreground text-xs'>
            This is a demo dashboard with static data
          </p>
        </div>
      </div>
    </div>
  )
}
