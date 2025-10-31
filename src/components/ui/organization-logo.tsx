import { Building2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OrganizationLogoProps {
  /**
   * Organization name for alt text
   */
  name?: string | null;
  /**
   * Logo image URL
   */
  logo?: string | null;
  /**
   * Fallback icon (defaults to Building2)
   */
  fallbackIcon?: LucideIcon;
  /**
   * Logo size
   */
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Shape: square or rounded
   */
  shape?: "square" | "rounded" | "circle";
}

const sizeClasses = {
  sm: "size-6",
  md: "size-8",
  lg: "size-10",
  xl: "size-12",
  "2xl": "size-16",
};

const iconSizeClasses = {
  sm: "size-3",
  md: "size-4",
  lg: "size-5",
  xl: "size-6",
  "2xl": "size-8",
};

const shapeClasses = {
  square: "rounded-none",
  rounded: "rounded-md",
  circle: "rounded-full",
};

export function OrganizationLogo({
  name,
  logo,
  fallbackIcon: FallbackIcon = Building2,
  size = "md",
  className,
  shape = "rounded",
}: OrganizationLogoProps) {
  if (logo) {
    return (
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden bg-muted",
          sizeClasses[size],
          shapeClasses[shape],
          className
        )}
      >
        <img
          src={logo}
          alt={name || "Organization logo"}
          className="size-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-primary/10 text-primary",
        sizeClasses[size],
        shapeClasses[shape],
        className
      )}
    >
      <FallbackIcon className={iconSizeClasses[size]} />
    </div>
  );
}
