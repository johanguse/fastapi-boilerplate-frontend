import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod/v4";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useAuth } from "@/stores/auth-store";

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Australia",
  "Japan",
  "South Korea",
  "Singapore",
  "India",
  "Brazil",
  "Mexico",
  "Argentina",
  "Other",
];

const createProfileFormSchema = (
  t: (key: string, defaultValue: string) => string
) =>
  z.object({
    name: z
      .string()
      .min(
        2,
        t(
          "settings.profile.validation.nameMinLength",
          "Name must be at least 2 characters."
        )
      )
      .max(
        100,
        t(
          "settings.profile.validation.nameMaxLength",
          "Name must not be longer than 100 characters."
        )
      ),
    email: z
      .string()
      .email(t("settings.profile.validation.emailInvalid", "Invalid email")),
    bio: z
      .string()
      .max(
        500,
        t(
          "settings.profile.validation.bioMaxLength",
          "Bio must be less than 500 characters."
        )
      )
      .optional(),
    company: z.string().optional(),
    job_title: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
    website: z
      .string()
      .url(
        t("settings.profile.validation.websiteInvalid", "Invalid website URL")
      )
      .optional()
      .or(z.literal("")),
  });

type ProfileFormValues = z.infer<ReturnType<typeof createProfileFormSchema>>;

export function ProfileForm() {
  const { t } = useTranslation();
  const { user, checkSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const profileFormSchema = createProfileFormSchema(t);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      bio: "",
      company: "",
      job_title: "",
      country: "",
      phone: "",
      website: "",
    },
    mode: "onChange",
  });

  // Fetch user profile data - update form when user data changes
  useEffect(() => {
    if (!user) {
      setIsFetching(true);
      return;
    }

    setIsFetching(true);

    // Reset form with current user data
    form.reset({
      name: user.name || "",
      email: user.email || "",
      bio: user.bio || "",
      company: user.company || "",
      job_title: user.job_title || "",
      country: user.country || "",
      phone: user.phone || "",
      website: user.website || "",
    });

    setIsFetching(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only re-run when user object changes

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);

    try {
      // Upload image first if changed
      if (profileImage) {
        const formData = new FormData();
        formData.append("file", profileImage);
        await api.post("/users/me/upload-image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        // Clear the profile image state after upload
        setProfileImage(null);
      }

      // Update profile data
      await api.patch("/users/me", data);

      // Refresh session to get updated user data
      await checkSession();

      toast.success(
        t("settings.profile.updateSuccess", "Profile updated successfully!")
      );
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(
        t(
          "settings.profile.updateError",
          "Failed to update profile. Please try again."
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Profile Image */}
        <div className="space-y-2">
          <FormLabel>
            {t("settings.profile.profileImage", "Profile Image")}
          </FormLabel>
          <ImageUpload
            type="avatar"
            value={user?.image}
            onChange={setProfileImage}
            size="lg"
            name={form.watch("name") || user?.name}
          />
          <FormDescription>
            {t(
              "settings.profile.profileImageDescription",
              "Upload a profile picture. Max 5MB."
            )}
          </FormDescription>
        </div>

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.profile.name", "Full Name")} *</FormLabel>
              <FormControl>
                <Input
                  placeholder={t(
                    "settings.profile.namePlaceholder",
                    "Enter your full name"
                  )}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t(
                  "settings.profile.nameDescription",
                  "This is your public display name."
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email (read-only for now) */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.profile.email", "Email")} *</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormDescription>
                {t(
                  "settings.profile.emailDescription",
                  "Your email address cannot be changed."
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company & Job Title */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("settings.profile.company", "Company")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      "settings.profile.companyPlaceholder",
                      "Your company name"
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="job_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("settings.profile.jobTitle", "Job Title")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      "settings.profile.jobTitlePlaceholder",
                      "e.g., Software Engineer"
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Country & Phone */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("settings.profile.country", "Country")}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          "settings.profile.countryPlaceholder",
                          "Select your country"
                        )}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.profile.phone", "Phone")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      "settings.profile.phonePlaceholder",
                      "+1 (555) 123-4567"
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Website */}
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.profile.website", "Website")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t(
                    "settings.profile.websitePlaceholder",
                    "https://yourwebsite.com"
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bio */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.profile.bio", "Bio")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t(
                    "settings.profile.bioPlaceholder",
                    "Tell us a little bit about yourself..."
                  )}
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t(
                  "settings.profile.bioDescription",
                  "Brief description for your profile. Max 500 characters."
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("settings.profile.updating", "Updating...")}
            </>
          ) : (
            t("settings.profile.updateProfile", "Update Profile")
          )}
        </Button>
      </form>
    </Form>
  );
}
