
"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  Clock3,
  LineChart,
  ShieldAlert,
  TriangleAlert,
  ShieldCheck,
  LayoutGrid,
  Archive,
  Snowflake,
  Circle,
  PlusCircle,
  ScanLine,
  ArrowRight,
  HandCoins,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendColor?: string;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendColor, description }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-primary">{value}</div>
      {trend && <p className={`text-xs ${trendColor || 'text-muted-foreground'} pt-1`}>{trend}</p>}
    </CardContent>
    <CardFooter className="text-xs text-muted-foreground pt-2">
        <p>{description}</p>
    </CardFooter>
  </Card>
);

interface OverviewItemProps {
  icon: React.ElementType;
  name: string;
  count: number;
  iconColor?: string;
}

const OverviewItem: React.FC<OverviewItemProps> = ({ icon: Icon, name, count, iconColor }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center">
      <Icon className={`h-5 w-5 mr-3 ${iconColor || 'text-muted-foreground'}`} />
      <span className="text-sm text-foreground">{name}</span>
    </div>
    <span className="text-sm font-medium text-primary">{count} items</span>
  </div>
);


export default function DashboardPage() {
  const { user } = useAuth();
  const { storedIngredients, isMounted, isContextLoading } = useAppContext();

  const getFirstName = () => {
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  if (!isMounted || isContextLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <LineChart className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  const statCardsData = [
    { title: "Total Items", value: storedIngredients.length, icon: Package, trend: "", description: "Items in your pantry" },
    { title: "Expiring Soon", value: 0, icon: Clock3, trend: "Next 3 days", description: "Items needing attention", trendColor: "text-orange-500" },
    { title: "Fresh Items", value: storedIngredients.length, icon: LineChart, trend: "Good condition", description: "Estimated fresh items", trendColor: "text-green-500" },
    { title: "Waste Saved (Est.)", value: "15%", icon: HandCoins, trend: "vs last month", description: "Contribution to less waste", trendColor: "text-purple-500" }
  ];

  const storageOverviewData = [
    { name: "Refrigerator", count: 4, icon: LayoutGrid, iconColor: "text-blue-500" },
    { name: "Pantry", count: storedIngredients.length > 6 ? storedIngredients.length - 6 : Math.max(0, storedIngredients.length - 4) , icon: Archive, iconColor: "text-orange-500" },
    { name: "Freezer", count: 2, icon: Snowflake, iconColor: "text-sky-500" },
  ];

  const topCategoriesData = [
    { name: "Protein", count: 2, color: "hsl(var(--chart-2))" }, // Teal/Green
    { name: "Vegetables", count: 2, color: "hsl(var(--chart-3))" }, // Dark Blue
    { name: "Grains", count: 1, color: "hsl(var(--chart-5))" }, // Orange
  ];


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Welcome back, {getFirstName()}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your food inventory and some personalized recommendations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCardsData.map(card => <StatCard key={card.title} {...card} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary flex items-center">
              <TriangleAlert className="mr-2 h-5 w-5" />
              Expiration Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center py-10">
            <ShieldCheck className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-lg font-medium text-foreground">All items are fresh!</p>
            <p className="text-sm text-muted-foreground">No items expiring in the next 3 days (placeholder).</p>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-1">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-primary">Storage Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {storageOverviewData.map(item => (
                <React.Fragment key={item.name}>
                  <OverviewItem {...item} />
                  <Separator className="last:hidden" />
                </React.Fragment>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-primary">Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {topCategoriesData.map(cat => (
                <div key={cat.name} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center">
                    <Circle className="h-3 w-3 mr-3" style={{ fill: cat.color, color: cat.color }} />
                    <span className="text-sm text-foreground">{cat.name}</span>
                  </div>
                  <span className="text-sm font-medium text-primary">{cat.count} items</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="secondary" className="w-full justify-start text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/30">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Ingredient
              </Button>
              <Button variant="secondary" className="w-full justify-start text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/30">
                <ScanLine className="mr-2 h-5 w-5" /> Scan Barcode (Coming Soon)
              </Button>
               <Button variant="secondary" className="w-full justify-start text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/30" onClick={() => alert("Feature coming soon!")}>
                <ArrowRight className="mr-2 h-5 w-5" /> View Full Inventory
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
