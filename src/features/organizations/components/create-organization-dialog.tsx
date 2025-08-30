import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { organizationApi } from '@/lib/api'
// import { useAuth } from '@/stores/auth-store' // TODO: Use when organization functionality is fully implemented
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Name must be less than 100 characters'),
  slug: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface CreateOrganizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateOrganizationDialog({ open, onOpenChange }: Readonly<CreateOrganizationDialogProps>) {
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  // const { user } = useAuth() // TODO: Use when organization functionality is fully implemented

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  })

  const createMutation = useMutation({
    mutationFn: organizationApi.create,
    onSuccess: (_newOrganization) => {
      // Update organizations list
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      
      // TODO: Add organization to auth store when organization plugin is properly configured
      // auth.addOrganization(newOrganization)
      
      toast.success('Organization created successfully')
      form.reset()
      setError(null)
      onOpenChange(false)
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { detail?: { message?: string } } } }
      const errorMessage = axiosError.response?.data?.detail?.message || 'Failed to create organization'
      setError(errorMessage)
      toast.error(errorMessage)
    },
  })

  const onSubmit = (data: FormData) => {
    setError(null)
    
    // Generate slug from name if not provided
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    createMutation.mutate({
      name: data.name,
      slug,
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !createMutation.isPending) {
      form.reset()
      setError(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Create a new organization to collaborate with your team.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="My Organization"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        // Auto-generate slug as user types
                        if (!form.getValues('slug')) {
                          const autoSlug = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)/g, '')
                          form.setValue('slug', autoSlug)
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (URL identifier)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="my-organization"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Used in URLs. Only lowercase letters, numbers, and hyphens allowed.
                  </p>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleOpenChange(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Organization'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}