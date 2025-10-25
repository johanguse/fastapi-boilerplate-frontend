import { useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ConfigDrawer } from "@/components/config-drawer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { TopNav } from "@/components/layout/top-nav";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  MessageSquare,
} from "lucide-react";
import { Overview } from "./components/overview";
import { RecentSales } from "./components/recent-sales";
import { AIUsageOverview } from "./components/ai-usage-overview";
import { AIRecentActivity } from "./components/ai-recent-activity";

export function Dashboard() {
  const { t } = useTranslation();
  const location = useLocation();
  const pathname = location.pathname;

  const topNav = [
    {
      title: t("dashboard.tabs.overview", "Overview"),
      href: "/",
      isActive: pathname === "/",
    },
    {
      title: t("dashboard.tabs.aiDocuments", "AI Documents"),
      href: "/ai-documents",
      isActive: pathname === "/ai-documents",
    },
    {
      title: t("dashboard.tabs.aiContent", "AI Content"),
      href: "/ai-content",
      isActive: pathname === "/ai-content",
    },
    {
      title: t("dashboard.tabs.aiAnalytics", "AI Analytics"),
      href: "/ai-analytics",
      isActive: pathname === "/ai-analytics",
    },
    {
      title: t("dashboard.tabs.analytics", "Analytics"),
      href: "/analytics",
      isActive: pathname === "/analytics",
      disabled: true,
    },
  ];

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className="ms-auto flex items-center space-x-4">
          <Search />
          <LanguageSwitcher />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h1 className="font-bold text-2xl tracking-tight">
              {t("dashboard.title", "AI-Powered Dashboard")}
            </h1>
            <p className="text-muted-foreground">
              {t("dashboard.subtitle", "Your comprehensive AI SaaS platform")}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="gap-2">
              <Brain className="h-4 w-4" />
              AI Features
            </Button>
            <Button>{t("dashboard.metrics.download", "Download")}</Button>
          </div>
        </div>
        <Tabs
          orientation="vertical"
          defaultValue="overview"
          className="space-y-4"
        >
          <div className="w-full overflow-x-auto pb-2">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ai-overview">AI Overview</TabsTrigger>
              <TabsTrigger value="analytics" disabled>
                Analytics
              </TabsTrigger>
              <TabsTrigger value="reports" disabled>
                Reports
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview" className="space-y-4">
            {/* Business Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    {t("dashboard.metrics.totalRevenue", "Total Revenue")}
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">$45,231.89</div>
                  <p className="text-muted-foreground text-xs">
                    {t("dashboard.metrics.fromLastMonth", "from last month")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    {t("dashboard.metrics.subscriptions", "Subscriptions")}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">+2,350</div>
                  <p className="text-muted-foreground text-xs">
                    {t("dashboard.metrics.newToday", "new today")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    {t("dashboard.metrics.sales", "Sales")}
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">+12,234</div>
                  <p className="text-muted-foreground text-xs">
                    {t("dashboard.metrics.newThisHour", "new this hour")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    {t("dashboard.metrics.activeNow", "Active Users")}
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">+573</div>
                  <p className="text-muted-foreground text-xs">
                    {t("dashboard.metrics.sinceLastHour", "since last hour")}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* AI Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    {t("dashboard.metrics.aiCredits", "AI Credits Used")}
                  </CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">1,247</div>
                  <p className="text-muted-foreground text-xs">
                    {t("dashboard.metrics.thisMonth", "this month")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    {t(
                      "dashboard.metrics.documentsProcessed",
                      "Documents Processed"
                    )}
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">89</div>
                  <p className="text-muted-foreground text-xs">
                    {t("dashboard.metrics.today", "today")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    {t(
                      "dashboard.metrics.contentGenerated",
                      "Content Generated"
                    )}
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">156</div>
                  <p className="text-muted-foreground text-xs">
                    {t("dashboard.metrics.thisWeek", "this week")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    {t(
                      "dashboard.metrics.analyticsQueries",
                      "Analytics Queries"
                    )}
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">23</div>
                  <p className="text-muted-foreground text-xs">
                    {t("dashboard.metrics.today", "today")}
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                  <CardTitle>Business Overview</CardTitle>
                </CardHeader>
                <CardContent className="ps-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                  <CardTitle>
                    {t("dashboard.metrics.recentSales", "Recent Sales")}
                  </CardTitle>
                  <CardDescription>
                    You made 265 sales this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-overview" className="space-y-4">
            {/* AI Feature Quick Access */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    {t(
                      "dashboard.aiFeatures.documents",
                      "Document Intelligence"
                    )}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "dashboard.aiFeatures.documentsDesc",
                      "Upload, process, and chat with documents using AI"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">89 documents</Badge>
                    <Button size="sm" variant="outline">
                      {t("dashboard.aiFeatures.open", "Open")}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    {t("dashboard.aiFeatures.content", "Content Generation")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "dashboard.aiFeatures.contentDesc",
                      "Generate high-quality content with AI-powered templates"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">156 generated</Badge>
                    <Button size="sm" variant="outline">
                      {t("dashboard.aiFeatures.open", "Open")}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    {t("dashboard.aiFeatures.analytics", "AI Analytics")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "dashboard.aiFeatures.analyticsDesc",
                      "Generate insights and visualizations from your data"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">23 queries</Badge>
                    <Button size="sm" variant="outline">
                      {t("dashboard.aiFeatures.open", "Open")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Usage Overview and Recent Activity */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Usage Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AIUsageOverview />
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent AI Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AIRecentActivity />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  );
}
