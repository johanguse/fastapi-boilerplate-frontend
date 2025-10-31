import { useNavigate } from "@tanstack/react-router";
import { Building2, ChevronsUpDown, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrganizationLogo } from "@/components/ui/organization-logo";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganizations } from "@/hooks/use-organizations";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    organizations,
    activeOrganization,
    setActiveOrganization,
    isLoading,
  } = useOrganizations();

  // Use active organization from React Query, or show placeholder
  const displayOrganization = activeOrganization || {
    id: "default",
    name: t("organizations.defaultOrganization"),
    slug: "default",
  };

  const handleCreateOrganization = () => {
    navigate({ to: "/organizations" });
  };

  const handleSelectOrganization = (orgId: string) => {
    setActiveOrganization(orgId);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <OrganizationLogo
                logo={displayOrganization.logo}
                name={displayOrganization.name}
                size="md"
                shape="rounded"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                {isLoading ? (
                  <>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-1 h-3 w-20" />
                  </>
                ) : (
                  <>
                    <span className="truncate font-semibold">
                      {displayOrganization.name}
                    </span>
                    <span className="truncate text-xs">
                      {organizations.length > 0
                        ? t("organizations.organizationCount", {
                            count: organizations.length,
                          })
                        : t("organizations.noOrganizations")}
                    </span>
                  </>
                )}
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              {t("organizations.title")}
            </DropdownMenuLabel>
            {isLoading ? (
              <>
                <div className="flex items-center gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Building2 className="size-4 shrink-0" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Building2 className="size-4 shrink-0" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
                <DropdownMenuSeparator />
              </>
            ) : organizations.length > 0 ? (
              <>
                {organizations.map((org) => (
                  <DropdownMenuItem
                    key={org.id}
                    className="gap-2 p-2"
                    onSelect={() => handleSelectOrganization(org.id)}
                  >
                    <OrganizationLogo
                      logo={org.logo}
                      name={org.name}
                      size="sm"
                      shape="rounded"
                    />
                    {org.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            ) : (
              <>
                <DropdownMenuItem className="gap-2 p-2" disabled>
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Building2 className="size-4 shrink-0" />
                  </div>
                  {t("organizations.noOrganizationsYet")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              className="gap-2 p-2"
              onSelect={handleCreateOrganization}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium">{t("organizations.createNew")}</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
