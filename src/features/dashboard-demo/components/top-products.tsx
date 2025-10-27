import { Badge } from '@/components/ui/badge'

const products = [
  { name: 'Premium Plan', sales: 234, revenue: '$12,345', growth: '+12%' },
  { name: 'Basic Plan', sales: 189, revenue: '$8,901', growth: '+8%' },
  { name: 'Enterprise Plan', sales: 156, revenue: '$23,456', growth: '+15%' },
  { name: 'Starter Plan', sales: 98, revenue: '$4,567', growth: '+5%' },
  { name: 'Pro Plan', sales: 87, revenue: '$6,789', growth: '+9%' },
]

export function TopProducts() {
  return (
    <div className='space-y-4'>
      {products.map((product, index) => (
        <div key={index} className='flex items-center justify-between'>
          <div className='space-y-1'>
            <p className='font-medium text-sm'>{product.name}</p>
            <p className='text-muted-foreground text-xs'>
              {product.sales} sales • {product.revenue}
            </p>
          </div>
          <Badge variant='secondary' className='text-xs'>
            {product.growth}
          </Badge>
        </div>
      ))}
    </div>
  )
}
