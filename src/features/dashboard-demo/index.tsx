import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { TopNav } from "@/components/layout/top-nav";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConfigDrawer } from "@/components/config-drawer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  Users,
  TrendingUp,
  Activity,
  ShoppingCart,
  Package,
  CreditCard,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Download,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import { Overview } from "./components/overview";
import { RecentSales } from "./components/recent-sales";
import { SalesChart } from "./components/sales-chart";
import { TopProducts } from "./components/top-products";
import { RevenueChart } from "./components/revenue-chart";

export function DashboardDemo() {
  const { t } = useTranslation();

  const topNav = [
    {
      title: t("dashboard.tabs.overview", "Overview"),
      href: "/dashboard-demo",
      isActive: true,
    },
    {
      title: t("dashboard.tabs.analytics", "Analytics"),
      href: "/dashboard-demo/analytics",
      isActive: false,
    },
    {
      title: t("dashboard.tabs.reports", "Reports"),
      href: "/dashboard-demo/reports",
      isActive: false,
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
              {t("dashboard.demoTitle", "Dashboard Demo")}
            </h1>
            <p className="text-muted-foreground">
              {t("dashboard.demoSubtitle", "Static demo dashboard with sample data")}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {t("dashboard.filters", "Filters")}
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              {t("dashboard.export", "Export")}
            </Button>
            <Button>{t("dashboard.generateReport", "Generate Report")}</Button>
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
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
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
                    +20.1% from last month
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
                    +180.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    {t("dashboard.metrics.sales", "Sales")}
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">+12,234</div>
                  <p className="text-muted-foreground text-xs">
                    +19% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    {t("dashboard.metrics.activeNow", "Active Now")}
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">+573</div>
                  <p className="text-muted-foreground text-xs">
                    +201 since last hour
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
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

            {/* Additional Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    Orders
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">+573</div>
                  <p className="text-muted-foreground text-xs">
                    +201 since last hour
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    Products
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">+12,234</div>
                  <p className="text-muted-foreground text-xs">
                    +19% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    Conversion Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">3.2%</div>
                  <p className="text-muted-foreground text-xs">
                    +0.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    Avg. Order Value
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">$89.50</div>
                  <p className="text-muted-foreground text-xs">
                    +$2.50 from last month
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Sales Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SalesChart />
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Top Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TopProducts />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 lg:grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueChart />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    Monthly Report
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">Dec 2024</div>
                  <p className="text-muted-foreground text-xs">
                    Last generated: 2 hours ago
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    Export Status
                  </CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">Ready</div>
                  <p className="text-muted-foreground text-xs">
                    CSV, PDF, Excel available
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    Data Points
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">1,247</div>
                  <p className="text-muted-foreground text-xs">
                    Records processed
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    Schedule
                  </CardTitle>
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">Auto</div>
                  <p className="text-muted-foreground text-xs">
                    Weekly generation
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  );
}
