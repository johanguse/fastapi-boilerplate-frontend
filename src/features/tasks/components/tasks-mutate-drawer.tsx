import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { SelectDropdown } from '@/components/select-dropdown'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { type Task } from '../data/schema'

type TaskMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Task
}

const createFormSchema = (t: (key: string, defaultValue: string) => string) => z.object({
  title: z.string().min(1, t('tasks.form.validation.titleRequired', 'Title is required.')),
  status: z.string().min(1, t('tasks.form.validation.statusRequired', 'Please select a status.')),
  label: z.string().min(1, t('tasks.form.validation.labelRequired', 'Please select a label.')),
  priority: z.string().min(1, t('tasks.form.validation.priorityRequired', 'Please choose a priority.')),
})

export function TasksMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: TaskMutateDrawerProps) {
  const { t } = useTranslation()
  const formSchema = createFormSchema(t)
  const isUpdate = !!currentRow
  
  type TaskForm = z.infer<typeof formSchema>

  const form = useForm<TaskForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow ?? {
      title: '',
      status: '',
      label: '',
      priority: '',
    },
  })

  const onSubmit = (data: TaskForm) => {
    // do something with the form data
    onOpenChange(false)
    form.reset()
    showSubmittedData(data)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>
            {isUpdate 
              ? t('tasks.form.updateTitle', 'Update Task')
              : t('tasks.form.createTitle', 'Create Task')
            }
          </SheetTitle>
          <SheetDescription>
            {isUpdate
              ? t('tasks.form.updateDescription', 'Update the task by providing necessary info. Click save when you\'re done.')
              : t('tasks.form.createDescription', 'Add a new task by providing necessary info. Click save when you\'re done.')
            }
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='tasks-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('tasks.form.titleLabel', 'Title')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('tasks.form.titlePlaceholder', 'Enter a title')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('tasks.form.statusLabel', 'Status')}</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder={t('tasks.form.statusPlaceholder', 'Select status')}
                    items={[
                      { label: t('tasks.form.status.inProgress', 'In Progress'), value: 'in progress' },
                      { label: t('tasks.form.status.backlog', 'Backlog'), value: 'backlog' },
                      { label: t('tasks.form.status.todo', 'Todo'), value: 'todo' },
                      { label: t('tasks.form.status.canceled', 'Canceled'), value: 'canceled' },
                      { label: t('tasks.form.status.done', 'Done'), value: 'done' },
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='label'
              render={({ field }) => (
                <FormItem className='relative'>
                  <FormLabel>{t('tasks.form.labelLabel', 'Label')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className='flex flex-col space-y-1'
                    >
                      <FormItem className='flex items-center'>
                        <FormControl>
                          <RadioGroupItem value='documentation' />
                        </FormControl>
                        <FormLabel className='font-normal'>
                          {t('tasks.form.label.documentation', 'Documentation')}
                        </FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center'>
                        <FormControl>
                          <RadioGroupItem value='feature' />
                        </FormControl>
                        <FormLabel className='font-normal'>{t('tasks.form.label.feature', 'Feature')}</FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center'>
                        <FormControl>
                          <RadioGroupItem value='bug' />
                        </FormControl>
                        <FormLabel className='font-normal'>{t('tasks.form.label.bug', 'Bug')}</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='priority'
              render={({ field }) => (
                <FormItem className='relative'>
                  <FormLabel>{t('tasks.form.priorityLabel', 'Priority')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className='flex flex-col space-y-1'
                    >
                      <FormItem className='flex items-center'>
                        <FormControl>
                          <RadioGroupItem value='high' />
                        </FormControl>
                        <FormLabel className='font-normal'>{t('tasks.form.priority.high', 'High')}</FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center'>
                        <FormControl>
                          <RadioGroupItem value='medium' />
                        </FormControl>
                        <FormLabel className='font-normal'>{t('tasks.form.priority.medium', 'Medium')}</FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center'>
                        <FormControl>
                          <RadioGroupItem value='low' />
                        </FormControl>
                        <FormLabel className='font-normal'>{t('tasks.form.priority.low', 'Low')}</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>{t('common.close', 'Close')}</Button>
          </SheetClose>
          <Button form='tasks-form' type='submit'>
            {t('tasks.form.saveButton', 'Save changes')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
