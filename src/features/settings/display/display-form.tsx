import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { showSubmittedData } from '@/lib/show-submitted-data'

const getItems = (t: (key: string, defaultValue: string) => string) => [
  {
    id: 'recents',
    label: t('settings.display.items.recents', 'Recents'),
  },
  {
    id: 'home',
    label: t('settings.display.items.home', 'Home'),
  },
  {
    id: 'applications',
    label: t('settings.display.items.applications', 'Applications'),
  },
  {
    id: 'desktop',
    label: t('settings.display.items.desktop', 'Desktop'),
  },
  {
    id: 'downloads',
    label: t('settings.display.items.downloads', 'Downloads'),
  },
  {
    id: 'documents',
    label: t('settings.display.items.documents', 'Documents'),
  },
] as const

const createDisplayFormSchema = (t: (key: string, defaultValue: string) => string) => z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: t('settings.display.validation.atLeastOne', 'You have to select at least one item.'),
  }),
})

// This can come from your database or API.
const defaultValues: Partial<{ items: string[] }> = {
  items: ['recents', 'home'],
}

export function DisplayForm() {
  const { t } = useTranslation()
  const displayFormSchema = createDisplayFormSchema(t)
  const items = getItems(t)
  
  type DisplayFormValues = z.infer<typeof displayFormSchema>
  
  const form = useForm<DisplayFormValues>({
    resolver: zodResolver(displayFormSchema),
    defaultValues,
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => showSubmittedData(data))}
        className='space-y-8'
      >
        <FormField
          control={form.control}
          name='items'
          render={() => (
            <FormItem>
              <div className='mb-4'>
                <FormLabel className='text-base'>{t('settings.display.sidebarLabel', 'Sidebar')}</FormLabel>
                <FormDescription>
                  {t('settings.display.sidebarDescription', 'Select the items you want to display in the sidebar.')}
                </FormDescription>
              </div>
              {items.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name='items'
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.id}
                        className='flex flex-row items-start'
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.id
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className='font-normal'>
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit'>{t('settings.display.updateButton', 'Update display')}</Button>
      </form>
    </Form>
  )
}
