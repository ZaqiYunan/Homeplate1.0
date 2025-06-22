
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MealLog, UserProfile } from '@/lib/types';
import { format, isToday, parseISO } from 'date-fns';


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
  BookUser,
  FileText,
  Moon,
  Sunrise,
  Sun,
  Cookie,
  History,
  Info,
} from 'lucide-react';

const personalizeFormSchema = z.object({
  height: z.coerce.number().min(50, "Height must be at least 50cm.").max(250, "Height seems too high."),
  weight: z.coerce.number().min(20, "Weight must be at least 20kg.").max(300, "Weight seems too high."),
});


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
            <span className="text-sm text-muted-foreground">{Math.round(value)}/{goal}{unit}</span>
        </div>
        <Progress value={(value / goal) * 100} className="h-2" />
        <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground">{Math.round((value / goal) * 100)}% of goal</span>
            <span className="text-xs text-muted-foreground">{Math.max(0, goal - Math.round(value))} {unit} left</span>
        </div>
    </div>
);

const MealItem = ({ meal }: { meal: MealLog }) => {
    const mealIcon = () => {
        const hour = parseISO(meal.loggedAt).getHours();
        if (hour < 11) return Sunrise;
        if (hour < 17) return Sun;
        if (hour < 21) return Moon;
        return Cookie;
    }
    const mealType = () => {
        const hour = parseISO(meal.loggedAt).getHours();
        if (hour < 11) return "Breakfast";
        if (hour < 17) return "Lunch";
        if (hour < 21) return "Dinner";
        return "Snack";
    }

    return (
        <li className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
                <Image
                    src={`https://placehold.co/64x64.png`}
                    alt={meal.name}
                    width={56}
                    height={56}
                    className="rounded-lg object-cover"
                    data-ai-hint={meal.name.split(' ').slice(0, 2).join(' ')}
                />
                <div className="space-y-1">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">{React.createElement(mealIcon(), {className:"h-4 w-4 text-muted-foreground"})} {meal.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {mealType()} &middot; {format(parseISO(meal.loggedAt), "h:mm a")} &middot; <span className="font-medium text-primary">{meal.calories} cal</span>
                    </p>
                </div>
            </div>
            <div className="text-right text-xs text-muted-foreground space-y-0.5">
                <p>P: {meal.protein}g</p>
                <p>C: {meal.carbs}g</p>
                <p>F: {meal.fat}g</p>
            </div>
        </li>
    );
}

export default function NutritionPage() {
  const { 
    isMounted, 
    isContextLoading,
    nutritionalGoals,
    dailyIntake,
    userProfile,
    updateUserProfileAndGoals,
    recentMeals,
  } = useAppContext();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof personalizeFormSchema>>({
    resolver: zodResolver(personalizeFormSchema),
    defaultValues: {
      height: userProfile?.height || 170,
      weight: userProfile?.weight || 70,
    },
  });

  React.useEffect(() => {
    if (userProfile) {
        form.reset({
            height: userProfile.height || 170,
            weight: userProfile.weight || 70,
        });
    }
  }, [userProfile, form]);

  async function onPersonalizeSubmit(values: z.infer<typeof personalizeFormSchema>) {
    await updateUserProfileAndGoals(values);
    setIsDialogOpen(false);
  }

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const statCardsData = [
    { title: "Calories Today", value: `${Math.round(dailyIntake.calories)}`, icon: TrendingUp, iconColor: "text-green-500" },
    { title: "Daily Goal", value: `${Math.round((dailyIntake.calories / nutritionalGoals.calories) * 100)}%`, icon: Target, iconColor: "text-blue-500" },
    { title: "Protein Today", value: `${Math.round(dailyIntake.protein)}g`, icon: Zap, iconColor: "text-purple-500" },
    { title: "Day Streak", value: "0", icon: Flame, iconColor: "text-orange-500" },
  ];

  const nutritionData = [
      { title: "Calories", value: dailyIntake.calories, goal: nutritionalGoals.calories, unit: "kcal", icon: Flame, iconBgColor: "bg-red-100" },
      { title: "Protein", value: dailyIntake.protein, goal: nutritionalGoals.protein, unit: "g", icon: Zap, iconBgColor: "bg-blue-100" },
      { title: "Carbs", value: dailyIntake.carbs, goal: nutritionalGoals.carbs, unit: "g", icon: Pizza, iconBgColor: "bg-yellow-100" },
      { title: "Fat", value: dailyIntake.fat, goal: nutritionalGoals.fat, unit: "g", icon: Droplets, iconBgColor: "bg-teal-100" },
  ];

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

      {!userProfile.height && !isContextLoading && (
        <Alert className="max-w-2xl mx-auto bg-primary/10 border-primary/30">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary font-semibold">Personalize Your Goals!</AlertTitle>
          <AlertDescription>
            Update your profile to get AI-powered nutritional goals tailored just for you.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCardsData.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        <div className="lg:col-span-3 space-y-6">
           <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-primary">Today's Nutrition</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {nutritionData.map(item => <NutritionProgress key={item.title} {...item} />)}
              </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary flex items-center">
                        <History className="mr-2 h-5 w-5"/>
                        Today's Meals
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                   {isContextLoading ? (
                     <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                     </div>
                   ) : recentMeals.filter(m => isToday(parseISO(m.loggedAt))).length > 0 ? (
                    <ul className="divide-y px-6">
                        {recentMeals.filter(m => isToday(parseISO(m.loggedAt))).slice(0, 4).map((meal) => <MealItem key={meal.id} meal={meal} />)}
                    </ul>
                   ) : (
                    <p className="text-sm text-muted-foreground italic text-center py-10 px-6">No meals logged today. Find a recipe and log it!</p>
                   )}
                </CardContent>
                <CardFooter className="pt-4">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="w-full" disabled={recentMeals.length === 0}>View Full History</Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[90vh] flex flex-col">
                            <SheetHeader className="text-left">
                                <SheetTitle className="text-2xl font-bold text-primary">Full Meal History</SheetTitle>
                                <SheetDescription>
                                    A complete log of your recently consumed meals.
                                </SheetDescription>
                            </SheetHeader>
                            <ScrollArea className="flex-grow">
                                <ul className="divide-y pr-6">
                                    {recentMeals.map((meal) => <MealItem key={meal.id} meal={meal} />)}
                                </ul>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                </CardFooter>
            </Card>
            
            <Card className="shadow-lg bg-primary text-primary-foreground">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button variant="secondary" className="w-full justify-start text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/30"><BookUser className="mr-2 h-5 w-5"/> Log a Meal</Button>
                     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="secondary" className="w-full justify-start text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/30"><Target className="mr-2 h-5 w-5"/> Update Goals</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Personalize Your Goals</DialogTitle>
                                <DialogDescription>
                                    Provide your height and weight to get personalized daily nutritional recommendations from our AI.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onPersonalizeSubmit)} className="space-y-4">
                                     <FormField
                                        control={form.control}
                                        name="height"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Height (cm)</FormLabel>
                                            <FormControl>
                                            <Input type="number" placeholder="e.g., 175" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="weight"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Weight (kg)</FormLabel>
                                            <FormControl>
                                            <Input type="number" placeholder="e.g., 70" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" variant="ghost">Cancel</Button>
                                        </DialogClose>
                                        <Button type="submit" disabled={isContextLoading}>
                                            {isContextLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save & Get Goals
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                    <Button variant="secondary" className="w-full justify-start text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/30"><FileText className="mr-2 h-5 w-5"/> View Report</Button>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}
