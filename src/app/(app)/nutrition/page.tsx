
"use client";

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Target,
  Flame,
  Zap,
  Droplets,
  Carrot,
  Apple,
  Leaf,
  Settings,
  HeartPulse,
  Pizza,
  Loader2
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, iconColor }) => (
  <Card className="shadow-md hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${iconColor || 'text-muted-foreground'}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-primary">{value}</div>
    </CardContent>
  </Card>
);

interface NutritionProgressProps {
  title: string;
  value: number;
  goal: number;
  unit: string;
  icon: React.ElementType;
  iconBgColor?: string;
}

const NutritionProgress: React.FC<NutritionProgressProps> = ({ title, value, goal, unit, icon: Icon, iconBgColor }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-full ${iconBgColor || 'bg-primary/10'}`}>
                    <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{title}</span>
            </div>
            <span className="text-sm text-muted-foreground">{value}/{goal}{unit}</span>
        </div>
        <Progress value={(value / goal) * 100} className="h-2" />
        <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground">{Math.round((value / goal) * 100)}% of goal</span>
            <span className="text-xs text-muted-foreground">{goal - value} {unit} left</span>
        </div>
    </div>
);

interface GoalProgressProps {
    title: string;
    value: number;
    goal: number;
    unit: string;
    icon: React.ElementType;
}

const GoalProgress: React.FC<GoalProgressProps> = ({ title, value, goal, unit, icon: Icon }) => (
    <div>
        <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-2">
                 <Icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{title}</span>
            </div>
            <span className="text-sm text-muted-foreground">{value}/{goal} {unit}</span>
        </div>
        <Progress value={(value/goal)*100} className="h-1.5" />
    </div>
);


export default function NutritionPage() {
  const { storedIngredients, isMounted, isContextLoading } = useAppContext();

  if (!isMounted || isContextLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const vegetableServings = storedIngredients.filter(item => item.category === 'vegetable').length;
  const fruitServings = storedIngredients.filter(item => item.category === 'fruit').length;


  const statCardsData = [
    { title: "Calories Today", value: "1,847", icon: TrendingUp, iconColor: "text-green-500" },
    { title: "Daily Goal", value: "92%", icon: Target, iconColor: "text-blue-500" },
    { title: "Day Streak", value: "7", icon: Flame, iconColor: "text-orange-500" },
    { title: "Protein Today", value: "85g", icon: Zap, iconColor: "text-purple-500" },
  ];

  const nutritionData = [
      { title: "Calories", value: 1847, goal: 2000, unit: "kcal", icon: Flame, iconBgColor: "bg-red-100" },
      { title: "Protein", value: 85, goal: 100, unit: "g", icon: Zap, iconBgColor: "bg-blue-100" },
      { title: "Carbs", value: 180, goal: 250, unit: "g", icon: Pizza, iconBgColor: "bg-yellow-100" },
      { title: "Fat", value: 65, goal: 80, unit: "g", icon: Droplets, iconBgColor: "bg-teal-100" },
  ]

  const dailyGoalsData = [
      { title: "Water Intake", value: 6, goal: 8, unit: "glasses", icon: Droplets },
      { title: "Vegetables", value: vegetableServings, goal: 5, unit: "servings", icon: Carrot },
      { title: "Fruits", value: fruitServings, goal: 3, unit: "servings", icon: Apple },
      { title: "Fiber", value: 18, goal: 25, unit: "g", icon: Leaf },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <HeartPulse className="mx-auto h-12 w-12 text-primary bg-primary/10 p-2 rounded-full" />
        <h1 className="text-3xl font-bold tracking-tight text-primary mt-4">
          Nutrition Dashboard
        </h1>
        <p className="text-muted-foreground mt-1 max-w-xl mx-auto">
          Track your daily nutrition intake and monitor your health goals with detailed insights.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCardsData.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary">Today's Nutrition</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {nutritionData.map(item => <NutritionProgress key={item.title} {...item} />)}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-xl font-semibold text-primary">Daily Goals</CardTitle>
            <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
             {dailyGoalsData.map(item => <GoalProgress key={item.title} {...item} />)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

