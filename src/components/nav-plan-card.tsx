import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export function NavPlanCard() {
  const { t } = useTranslation();
  const { state } = useSidebar();

  // Hide the card when sidebar is collapsed
  if (state === "collapsed") {
    return null;
  }

  // Mock plan data - replace with actual user plan data from your backend
  const plan = {
    name: "Free Trial",
    isTrial: true,
    usage: {
      current: 45,
      limit: 100,
      unit: "API calls",
    },
  };

  const usagePercentage = (plan.usage.current / plan.usage.limit) * 100;

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Card className="shadow-none py-3">
              <CardHeader className="px-4">
                <CardTitle className="text-sm font-medium">
                  {t("sidebar.currentPlan", "Current Plan")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {plan.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {t("sidebar.usage", "Usage")}
                    </span>
                    <span className="font-medium">
                      {plan.usage.current} / {plan.usage.limit}
                    </span>
                  </div>
                  <Progress value={usagePercentage} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">
                    {plan.usage.limit - plan.usage.current} {plan.usage.unit}{" "}
                    {t("sidebar.remaining", "remaining")}
                  </p>
                </div>

                {plan.isTrial && (
                  <Button size="sm" className="w-full" variant="default">
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t("sidebar.upgradeToPro", "Upgrade to Pro")}
                  </Button>
                )}
              </CardContent>
            </Card>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
