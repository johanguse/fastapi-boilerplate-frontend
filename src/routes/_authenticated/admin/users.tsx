import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  CheckCircle,
  Crown,
  Edit,
  MoreHorizontal,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchBar } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  adminApi,
  type User,
  type UserInvite,
  type UserUpdateAdmin,
} from '@/lib/api'
import { useAuth } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: AdminUsersPage,
})

function AdminUsersPage() {
  const { t } = useTranslation()
  const { isAdmin, user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState<UserUpdateAdmin>({
    name: '',
    role: 'user',
    status: 'active',
    is_verified: true,
  })
  const [inviteForm, setInviteForm] = useState<UserInvite>({
    email: '',
    name: '',
    role: 'member',
  })

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users', page, pageSize, search],
    queryFn: async () => {
      const result = await adminApi.getAllUsers({
        page,
        size: pageSize,
        search: search || undefined,
      })
      return result
    },
    enabled: isAdmin,
  })

  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats(),
    enabled: isAdmin,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdateAdmin }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      setEditUser(null)
      toast.success('User updated successfully')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } }
      toast.error(err.response?.data?.detail || 'Failed to update user')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      setDeleteUser(null)
      toast.success('User deleted successfully')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } }
      toast.error(err.response?.data?.detail || 'Failed to delete user')
    },
  })

  const inviteMutation = useMutation({
    mutationFn: (data: UserInvite) => adminApi.inviteUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      setInviteDialogOpen(false)
      setInviteForm({ email: '', name: '', role: 'user' })
      toast.success('User invited successfully')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } }
      toast.error(err.response?.data?.detail || 'Failed to invite user')
    },
  })

  const handleEditClick = (user: User) => {
    setEditUser(user)
    setEditForm({
      name: user.name || undefined,
      role: user.role || 'user',
      status: user.status || 'active',
      is_verified: user.is_verified ?? false,
    })
  }

  const handleEditSubmit = () => {
    if (editUser) updateMutation.mutate({ id: editUser.id, data: editForm })
  }
  const handleDeleteConfirm = () => {
    if (deleteUser) deleteMutation.mutate(deleteUser.id)
  }
  const handleInviteSubmit = () => {
    if (!inviteForm.email || !inviteForm.name) {
      toast.error('Email and name are required')
      return
    }
    inviteMutation.mutate(inviteForm)
  }

  if (!isAdmin) {
    return (
      <>
        <Header fixed>
          <SearchBar />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>

        <Main>
          <div className='flex h-full items-center justify-center'>
            <div className='text-center'>
              <Shield className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
              <h1 className='font-bold text-2xl'>
                {t('admin.accessDeniedTitle', 'Access Denied')}
              </h1>
              <p className='mt-2 text-muted-foreground'>
                {t(
                  'admin.accessDeniedDescription',
                  "You don't have permission to access this page."
                )}
              </p>
            </div>
          </div>
        </Main>
      </>
    )
  }

  const totalPages = usersData ? Math.ceil(usersData.total / pageSize) : 1

  return (
    <>
      <Header fixed>
        <SearchBar />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='flex items-center gap-2 font-bold text-3xl'>
                <Users className='h-8 w-8' />
                {t('admin.users.title', 'User Management')}
              </h1>
              <p className='mt-2 text-muted-foreground'>
                {t('admin.users.subtitle', 'Manage all users in your platform')}
              </p>
            </div>
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className='mr-2 h-4 w-4' />
              {t('admin.users.invite', 'Invite User')}
            </Button>
          </div>
          <div className='grid gap-4 md:grid-cols-3'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='font-medium text-sm'>
                  {t('admin.users.total', 'Total Users')}
                </CardTitle>
                <Users className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                {stats ? (
                  <>
                    <div className='font-bold text-2xl'>
                      {stats.total_users}
                    </div>
                    <p className='text-muted-foreground text-xs'>
                      {t('admin.users.allRegistered', 'All registered users')}
                    </p>
                  </>
                ) : (
                  <>
                    <Skeleton className='mb-2 h-8 w-20' />
                    <Skeleton className='h-3 w-32' />
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='font-medium text-sm'>
                  {t('admin.users.active', 'Active Users')}
                </CardTitle>
                <CheckCircle className='h-4 w-4 text-green-600' />
              </CardHeader>
              <CardContent>
                {stats ? (
                  <>
                    <div className='font-bold text-2xl'>
                      {stats.active_users}
                    </div>
                    <p className='text-muted-foreground text-xs'>
                      {t('admin.users.currentlyActive', 'Currently active')}
                    </p>
                  </>
                ) : (
                  <>
                    <Skeleton className='mb-2 h-8 w-20' />
                    <Skeleton className='h-3 w-32' />
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='font-medium text-sm'>
                  {t('admin.users.verified', 'Verified Users')}
                </CardTitle>
                <Shield className='h-4 w-4 text-blue-600' />
              </CardHeader>
              <CardContent>
                {stats ? (
                  <>
                    <div className='font-bold text-2xl'>
                      {stats.verified_users}
                    </div>
                    <p className='text-muted-foreground text-xs'>
                      {t('admin.users.emailVerified', 'Email verified')}
                    </p>
                  </>
                ) : (
                  <>
                    <Skeleton className='mb-2 h-8 w-20' />
                    <Skeleton className='h-3 w-32' />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.users.users', 'Users')}</CardTitle>
              <CardDescription>
                {t(
                  'admin.users.searchAndManage',
                  'Search and manage user accounts'
                )}
              </CardDescription>
              <div className='flex items-center gap-2 pt-4'>
                <div className='relative flex-1'>
                  <Search className='absolute top-2.5 left-2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder={t(
                      'admin.users.searchPlaceholder',
                      'Search users...'
                    )}
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    className='pl-8'
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className='space-y-3'>
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('admin.users.name', 'Name')}</TableHead>
                          <TableHead>
                            {t('admin.users.email', 'Email')}
                          </TableHead>
                          <TableHead>{t('admin.users.role', 'Role')}</TableHead>
                          <TableHead>
                            {t('admin.users.status', 'Status')}
                          </TableHead>
                          <TableHead>
                            {t('admin.users.verified', 'Verified')}
                          </TableHead>
                          <TableHead className='text-right'>
                            {t('admin.users.actions', 'Actions')}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Skeleton className='h-5 w-32' />
                            </TableCell>
                            <TableCell>
                              <Skeleton className='h-5 w-48' />
                            </TableCell>
                            <TableCell>
                              <Skeleton className='h-6 w-16' />
                            </TableCell>
                            <TableCell>
                              <Skeleton className='h-6 w-20' />
                            </TableCell>
                            <TableCell>
                              <Skeleton className='h-6 w-24' />
                            </TableCell>
                            <TableCell className='text-right'>
                              <Skeleton className='ml-auto h-8 w-8' />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className='flex items-center justify-between'>
                    <Skeleton className='h-4 w-48' />
                    <div className='flex gap-2'>
                      <Skeleton className='h-9 w-20' />
                      <Skeleton className='h-9 w-20' />
                    </div>
                  </div>
                </div>
              ) : !usersData?.items?.length ? (
                <div className='py-8 text-center text-muted-foreground'>
                  <p>{t('admin.users.noUsersFound', 'No users found')}</p>
                  {usersData && (
                    <p className='mt-2 text-xs'>
                      Response structure:{' '}
                      {JSON.stringify(Object.keys(usersData))}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('admin.users.name', 'Name')}</TableHead>
                          <TableHead>
                            {t('admin.users.email', 'Email')}
                          </TableHead>
                          <TableHead>{t('admin.users.role', 'Role')}</TableHead>
                          <TableHead>
                            {t('admin.users.status', 'Status')}
                          </TableHead>
                          <TableHead>
                            {t('admin.users.verified', 'Verified')}
                          </TableHead>
                          <TableHead className='text-right'>
                            {t('admin.users.actions', 'Actions')}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usersData.items.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                {user.name || t('admin.users.na', 'N/A')}
                                {user.role === 'admin' && (
                                  <Crown className='h-4 w-4 text-yellow-600' />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  user.role === 'admin'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {user.role || t('admin.users.user', 'user')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.status === 'active' ? (
                                <Badge
                                  variant='outline'
                                  className='border-green-600 text-green-600'
                                >
                                  <CheckCircle className='mr-1 h-3 w-3' />
                                  {t('admin.users.active', 'Active')}
                                </Badge>
                              ) : user.status === 'invited' ? (
                                <Badge
                                  variant='outline'
                                  className='border-blue-600 text-blue-600'
                                >
                                  <UserPlus className='mr-1 h-3 w-3' />
                                  {t('admin.users.invited', 'Invited')}
                                </Badge>
                              ) : user.status === 'suspended' ? (
                                <Badge
                                  variant='outline'
                                  className='border-red-600 text-red-600'
                                >
                                  <XCircle className='mr-1 h-3 w-3' />
                                  {t('admin.users.suspended', 'Suspended')}
                                </Badge>
                              ) : (
                                <Badge variant='outline'>
                                  {user.status ||
                                    t('admin.users.unknown', 'Unknown')}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {user.is_verified ? (
                                <Badge
                                  variant='outline'
                                  className='border-blue-600 text-blue-600'
                                >
                                  <Shield className='mr-1 h-3 w-3' />
                                  {t('admin.users.verified', 'Verified')}
                                </Badge>
                              ) : (
                                <Badge variant='outline'>
                                  {t('admin.users.unverified', 'Unverified')}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className='text-right'>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant='ghost' size='icon'>
                                    <MoreHorizontal className='h-4 w-4' />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                  <DropdownMenuLabel>
                                    {t('admin.users.actions', 'Actions')}
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleEditClick(user)}
                                  >
                                    <Edit className='mr-2 h-4 w-4' />
                                    {t('admin.users.edit', 'Edit')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setDeleteUser(user)}
                                    disabled={
                                      user.id === Number(currentUser?.id)
                                    }
                                    className='text-red-600'
                                  >
                                    <Trash2 className='mr-2 h-4 w-4' />
                                    {t('admin.users.delete', 'Delete')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className='mt-4 flex items-center justify-between'>
                    <p className='text-muted-foreground text-sm'>
                      {t('admin.users.showing', 'Showing')}{' '}
                      {(page - 1) * pageSize + 1} {t('admin.users.to', 'to')}{' '}
                      {Math.min(page * pageSize, usersData.total)}{' '}
                      {t('admin.users.of', 'of')} {usersData.total}{' '}
                      {t('admin.users.users', 'users')}
                    </p>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        {t('admin.users.previous', 'Previous')}
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page >= totalPages}
                      >
                        {t('admin.users.next', 'Next')}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t('admin.users.editUser', 'Edit User')}
                </DialogTitle>
                <DialogDescription>
                  {t(
                    'admin.users.updateUserInfo',
                    'Update user information and permissions'
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='edit-name'>
                    {t('admin.users.name', 'Name')}
                  </Label>
                  <Input
                    id='edit-name'
                    value={editForm.name || ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    placeholder={t(
                      'admin.users.userNamePlaceholder',
                      'User name'
                    )}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='edit-role'>
                    {t('admin.users.role', 'Role')}
                  </Label>
                  <Select
                    value={editForm.role}
                    onValueChange={(value) =>
                      setEditForm({
                        ...editForm,
                        role: value as 'user' | 'admin',
                      })
                    }
                  >
                    <SelectTrigger id='edit-role'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='member'>
                        {t('admin.users.member', 'Member')}
                      </SelectItem>
                      <SelectItem value='admin'>
                        {t('admin.users.admin', 'Admin')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='edit-status'>
                    {t('admin.users.status', 'Status')}
                  </Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) =>
                      setEditForm({
                        ...editForm,
                        status: value as 'active' | 'invited' | 'suspended',
                      })
                    }
                  >
                    <SelectTrigger id='edit-status'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='active'>
                        <div className='flex flex-col'>
                          <span>{t('admin.users.active', 'Active')}</span>
                          <span className='text-muted-foreground text-xs'>
                            {t(
                              'admin.users.activeDesc',
                              'User can access the system'
                            )}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value='invited'>
                        <div className='flex flex-col'>
                          <span>{t('admin.users.invited', 'Invited')}</span>
                          <span className='text-muted-foreground text-xs'>
                            {t(
                              'admin.users.invitedDesc',
                              'Awaiting user onboarding'
                            )}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value='suspended'>
                        <div className='flex flex-col'>
                          <span>{t('admin.users.suspended', 'Suspended')}</span>
                          <span className='text-muted-foreground text-xs'>
                            {t(
                              'admin.users.suspendedDesc',
                              'Cannot login or access system'
                            )}
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <Label htmlFor='edit-verified'>
                      {t('admin.users.emailVerified', 'Email Verified')}
                    </Label>
                    <p className='text-muted-foreground text-xs'>
                      {t(
                        'admin.users.emailVerifiedDesc',
                        'User has confirmed their email address'
                      )}
                    </p>
                  </div>
                  <Switch
                    id='edit-verified'
                    checked={editForm.is_verified}
                    onCheckedChange={(checked) =>
                      setEditForm({ ...editForm, is_verified: checked })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setEditUser(null)}
                  disabled={updateMutation.isPending}
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  onClick={handleEditSubmit}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending
                    ? t('admin.users.saving', 'Saving...')
                    : t('admin.users.saveChanges', 'Save Changes')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <AlertDialog
            open={!!deleteUser}
            onOpenChange={() => setDeleteUser(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t('admin.users.deleteConfirmTitle', 'Are you sure?')}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t(
                    'admin.users.deleteConfirmDesc',
                    'This will permanently delete the user account for'
                  )}{' '}
                  <strong>{deleteUser?.email}</strong>.{' '}
                  {t(
                    'admin.users.deleteConfirmDesc2',
                    'This action cannot be undone.'
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteMutation.isPending}>
                  {t('common.cancel', 'Cancel')}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  disabled={deleteMutation.isPending}
                  className='bg-red-600 hover:bg-red-700'
                >
                  {deleteMutation.isPending
                    ? t('admin.users.deleting', 'Deleting...')
                    : t('admin.users.deleteUser', 'Delete User')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t('admin.users.inviteNewUser', 'Invite New User')}
                </DialogTitle>
                <DialogDescription>
                  {t(
                    'admin.users.inviteNewUserDesc',
                    'Create a new user account. A temporary password will be generated.'
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='invite-email'>
                    {t('admin.users.email', 'Email')} *
                  </Label>
                  <Input
                    id='invite-email'
                    type='email'
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, email: e.target.value })
                    }
                    placeholder='user@example.com'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='invite-name'>
                    {t('admin.users.name', 'Name')} *
                  </Label>
                  <Input
                    id='invite-name'
                    value={inviteForm.name}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, name: e.target.value })
                    }
                    placeholder={t(
                      'admin.users.fullNamePlaceholder',
                      'Full name'
                    )}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='invite-role'>
                    {t('admin.users.role', 'Role')}
                  </Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value) =>
                      setInviteForm({
                        ...inviteForm,
                        role: value as 'user' | 'admin',
                      })
                    }
                  >
                    <SelectTrigger id='invite-role'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='member'>
                        {t('admin.users.member', 'Member')}
                      </SelectItem>
                      <SelectItem value='admin'>
                        {t('admin.users.admin', 'Admin')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => {
                    setInviteDialogOpen(false)
                    setInviteForm({ email: '', name: '', role: 'member' })
                  }}
                  disabled={inviteMutation.isPending}
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  onClick={handleInviteSubmit}
                  disabled={inviteMutation.isPending}
                >
                  {inviteMutation.isPending
                    ? t('admin.users.inviting', 'Inviting...')
                    : t('admin.users.inviteUser', 'Invite User')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Main>
    </>
  )
}
