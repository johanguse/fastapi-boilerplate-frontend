import {
  ArrowRightLeft,
  Building2,
  Edit,
  MoreHorizontal,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrganizationLogo } from "@/components/ui/organization-logo";
import { useOrganizations } from "@/hooks/use-organizations";
import { type Organization } from "@/lib/api";
import { useAuth } from "@/stores/auth-store";
import { CreateOrganizationDialog } from "./create-organization-dialog";
import { EditOrganizationDialog } from "./edit-organization-dialog";

export function OrganizationsList() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const {
    organizations,
    isLoading,
    isDeleting,
    setActiveOrganization,
    deleteOrganization,
  } = useOrganizations();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);

  const handleEdit = (organization: Organization) => {
    setSelectedOrganization(organization);
    setEditDialogOpen(true);
  };

  const handleDelete = (organization: Organization) => {
    setSelectedOrganization(organization);
    setDeleteDialogOpen(true);
  };

  const handleSwitch = (organization: Organization) => {
    // Use the centralized React Query hook method
    setActiveOrganization(organization.id);
  };

  const confirmDelete = () => {
    if (selectedOrganization) {
      deleteOrganization(selectedOrganization.id);
      setDeleteDialogOpen(false);
      setSelectedOrganization(null);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className="ms-auto flex items-center space-x-4">
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>

        <Main>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-3xl">
                {t("organizations.title", "Organizations")}
              </h1>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <Card key={`skeleton-${i + 1}`} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 w-3/4 rounded bg-muted"></div>
                    <div className="h-3 w-1/2 rounded bg-muted"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-16 rounded bg-muted"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Main>
      </>
    );
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-3xl">{t("organizations.title")}</h1>
              <p className="text-muted-foreground">
                {t(
                  "organizations.manageDescription",
                  "Manage your organizations and settings"
                )}
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("organizations.createOrganization", "Create Organization")}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {organizations.map((organization) => (
              <Card
                key={organization.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    <OrganizationLogo
                      logo={organization.logo}
                      name={organization.name}
                      size="sm"
                      shape="rounded"
                    />
                    <CardTitle className="font-medium text-sm">
                      {organization.name}
                    </CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">
                          {t("common.openMenu", "Open menu")}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleSwitch(organization)}
                      >
                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                        {t("organizations.switch", "Switch")}
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleEdit(organization)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            {t("common.edit", "Edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            {t("organizations.settings", "Settings")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(organization)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("common.delete", "Delete")}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {organization.slug && (
                      <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                        {organization.slug}
                      </span>
                    )}
                    {organization.plan && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                          {t("organizations.plan", "Plan")}:
                        </span>
                        <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
                          {organization.plan}
                        </span>
                      </div>
                    )}
                  </div>
                  {organization.createdAt && (
                    <p className="mt-2 text-muted-foreground text-xs">
                      {t("organizations.created", "Created")}{" "}
                      {new Date(organization.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}

            {organizations.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-medium text-lg">
                    {t(
                      "organizations.noOrganizationsYet",
                      "No organizations yet"
                    )}
                  </h3>
                  <p className="mb-4 text-center text-muted-foreground">
                    {t(
                      "organizations.createFirstDescription",
                      "Get started by creating your first organization"
                    )}
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t(
                      "organizations.createOrganization",
                      "Create Organization"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <CreateOrganizationDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
          />

          {selectedOrganization && (
            <EditOrganizationDialog
              organization={selectedOrganization}
              open={editDialogOpen}
              onOpenChange={(open: boolean) => {
                setEditDialogOpen(open);
                if (!open) setSelectedOrganization(null);
              }}
            />
          )}

          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("organizations.deleteOrganization", "Delete Organization")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("organizations.deleteConfirmation", {
                    name: selectedOrganization?.name,
                  })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {t("common.cancel", "Cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting
                    ? t("organizations.deleting", "Deleting...")
                    : t("common.delete", "Delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Main>
    </>
  );
}
