import { Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTasks } from './tasks-provider'
import { useTranslation } from 'react-i18next'

export function TasksPrimaryButtons() {
  const { setOpen } = useTasks()
  const { t } = useTranslation()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('import')}
      >
        <span>{t('tasks.import.title', 'Import')}</span> <Download size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>{t('tasks.import.title', 'Import')}</span> <Plus size={18} />
      </Button>
    </div>
  )
}
