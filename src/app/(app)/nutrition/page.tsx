
"use client";

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';

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
  Loader2,
  BarChart3,
  CalendarDays,
  BookUser,
  FileText,
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
  ];

  const dailyGoalsData = [
      { title: "Water Intake", value: 6, goal: 8, unit: "glasses", icon: Droplets },
      { title: "Vegetables", value: vegetableServings, goal: 5, unit: "servings", icon: Carrot },
      { title: "Fruits", value: fruitServings, goal: 3, unit: "servings", icon: Apple },
      { title: "Fiber", value: 18, goal: 25, unit: "g", icon: Leaf },
  ];

  const weeklyNutritionData = [
    { day: 'Mon', protein: 90, carbs: 220, fat: 75, calories: 1950 },
    { day: 'Tue', protein: 95, carbs: 250, fat: 82, calories: 2100 },
    { day: 'Wed', protein: 85, carbs: 200, fat: 68, calories: 1800 },
    { day: 'Thu', protein: 92, carbs: 240, fat: 78, calories: 2050 },
    { day: 'Fri', protein: 88, carbs: 210, fat: 72, calories: 1900 },
    { day: 'Sat', protein: 98, carbs: 260, fat: 85, calories: 2200 },
    { day: 'Sun', protein: 85, carbs: 180, fat: 65, calories: 1847 },
  ];

  const weeklySummary = weeklyNutritionData.reduce((acc, curr) => {
      acc.totalCalories += curr.calories;
      acc.totalProtein += curr.protein;
      return acc;
    }, { totalCalories: 0, totalProtein: 0 });

  const avgCalories = Math.round(weeklySummary.totalCalories / weeklyNutritionData.length);
  const avgProtein = Math.round(weeklySummary.totalProtein / weeklyNutritionData.length);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle className="text-xl font-semibold text-primary flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Weekly Nutrition Trends
            </CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 sm:mt-0">
                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'hsl(var(--destructive))' }} /> Protein</div>
                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'hsl(var(--primary))' }} /> Carbs</div>
                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} /> Fat</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
             {weeklyNutritionData.map((item) => {
                const totalMacros = item.protein + item.carbs + item.fat;
                const proteinWidth = (item.protein / totalMacros) * 100;
                const carbsWidth = (item.carbs / totalMacros) * 100;
                const fatWidth = (item.fat / totalMacros) * 100;

                return (
                  <div key={item.day} className="grid grid-cols-[40px_1fr_80px] items-center gap-4">
                    <div className="text-sm font-medium text-muted-foreground">{item.day}</div>
                    <div className="w-full">
                      <div className="w-full bg-muted rounded-full h-3.5 flex overflow-hidden">
                        <div style={{ width: `${proteinWidth}%`, backgroundColor: 'hsl(var(--destructive))' }}></div>
                        <div style={{ width: `${carbsWidth}%`, backgroundColor: 'hsl(var(--primary))' }}></div>
                        <div style={{ width: `${fatWidth}%`, backgroundColor: 'hsl(var(--chart-2))' }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1.5 px-1">
                          <span>P: {item.protein}g</span>
                          <span>C: {item.carbs}g</span>
                          <span>F: {item.fat}g</span>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-primary text-right">{item.calories} cal</div>
                  </div>
                );
             })}
          </CardContent>
           <CardFooter className="bg-muted/50 p-4 mt-4">
              <div className="flex justify-around w-full">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Avg. Calories</p>
                    <p className="font-bold text-primary">{avgCalories}</p>
                </div>
                 <div className="text-center">
                    <p className="text-sm text-muted-foreground">Avg. Protein</p>
                    <p className="font-bold text-primary">{avgProtein}g</p>
                </div>
              </div>
           </CardFooter>
        </Card>
        
        <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary flex items-center"><CalendarDays className="mr-2 h-5 w-5"/>Weekly Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {weeklyNutritionData.map(item => (
                            <li key={item.day} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 text-primary font-bold h-7 w-7 flex items-center justify-center rounded-full text-xs">{item.day.slice(0,1)}</div>
                                    <span>{item.calories} cal</span>
                                </div>
                                <div className="h-2 w-2 rounded-full" style={{backgroundColor: 'hsl(var(--chart-2))'}} />
                            </li>
                        ))}
                    </ul>
                     <Alert className="mt-6 bg-primary/10 border-primary/20 text-primary">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <AlertTitle className="font-semibold">Great progress this week!</AlertTitle>
                      <AlertDescription>
                        You've maintained your nutrition goals for 6 days straight.
                      </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <Card className="shadow-lg bg-primary text-primary-foreground">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button variant="secondary" className="w-full justify-start text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/30"><BookUser className="mr-2 h-5 w-5"/> Log a Meal</Button>
                    <Button variant="secondary" className="w-full justify-start text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/30"><Target className="mr-2 h-5 w-5"/> Update Goals</Button>
                    <Button variant="secondary" className="w-full justify-start text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/30"><FileText className="mr-2 h-5 w-5"/> View Report</Button>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}

    