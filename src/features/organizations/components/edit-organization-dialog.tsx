import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod/v4";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { api, type Organization, organizationApi } from "@/lib/api";

const getFormSchema = (t: (key: string, defaultValue: string) => string) =>
  z.object({
    name: z
      .string()
      .min(1, t("organizations.nameRequired", "Name is required"))
      .max(100, t("organizations.nameTooLong", "Name is too long")),
    slug: z.string().optional(),
  });

type FormData = z.infer<ReturnType<typeof getFormSchema>>;

interface EditOrganizationDialogProps {
  organization: Organization;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditOrganizationDialog({
  organization,
  open,
  onOpenChange,
}: Readonly<EditOrganizationDialogProps>) {
  const [error, setError] = useState<string | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(getFormSchema(t)),
    defaultValues: {
      name: organization.name,
      slug: organization.slug,
    },
  });

  // Update form when organization changes
  useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name,
        slug: organization.slug,
      });
    }
  }, [organization, form]);

  const updateMutation = useMutation({
    mutationFn: (data: FormData) =>
      organizationApi.update(organization.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toast.success(
        t("organizations.updateSuccess", "Organization updated successfully")
      );
      setError(null);
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { detail?: { message?: string } } };
      };
      const errorMessage =
        axiosError.response?.data?.detail?.message ||
        t("organizations.updateError", "Failed to update organization");
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);

    try {
      // Generate slug from name if not provided
      const slug =
        data.slug ||
        data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      // Update organization data first
      updateMutation.mutate({
        name: data.name,
        slug,
      });

      // Upload logo if changed
      if (logo) {
        const formData = new FormData();
        formData.append("file", logo);
        await api.post(
          `/organizations/${organization.id}/upload-logo`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        // Invalidate queries to refetch with new logo
        queryClient.invalidateQueries({ queryKey: ["organizations"] });
      }
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { detail?: { message?: string } } };
      };
      const errorMessage =
        axiosError.response?.data?.detail?.message ||
        t("organizations.updateError", "Failed to update organization");
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !updateMutation.isPending) {
      form.reset({
        name: organization.name,
        slug: organization.slug,
      });
      setError(null);
      setLogo(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {t("organizations.editOrganization", "Edit Organization")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "organizations.editDescription",
              "Update your organization details"
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("organizations.name", "Name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "organizations.namePlaceholder",
                        "Enter organization name"
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>
                {t("organizations.logo", "Organization Logo")}{" "}
                {t("common.optional", "(Optional)")}
              </FormLabel>
              <FormControl>
                <ImageUpload
                  value={organization.logo}
                  onChange={setLogo}
                  type="logo"
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">
                {t(
                  "organizations.logoUpdateDescription",
                  "Upload a new logo to replace the current one, or leave empty to keep existing"
                )}
              </p>
            </FormItem>

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("organizations.slug", "Slug")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "organizations.slugPlaceholder",
                        "Enter organization slug"
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-muted-foreground text-xs">
                    {t(
                      "organizations.slugDescription",
                      "A URL-friendly version of the name"
                    )}
                  </p>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending
                  ? t("organizations.updating", "Updating...")
                  : t(
                      "organizations.updateOrganization",
                      "Update Organization"
                    )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
