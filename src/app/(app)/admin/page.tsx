
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, FileText, Settings, ShieldAlert, BarChart3, Bug } from 'lucide-react';

const AdminStatCard = ({ title, value, description, icon: Icon, actionText }: { title: string, value: string, description: string, icon: React.ElementType, actionText: string }) => (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold text-primary">{value}</div>
            <p className="text-xs text-muted-foreground pt-1">{description}</p>
            <Button className="mt-4 w-full" variant="outline" disabled>
                {actionText}
            </Button>
        </CardContent>
    </Card>
);

export default function AdminPage() {
    const { userProfile, isContextLoading } = useAppContext();
    const router = useRouter();

    if (isContextLoading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    if (userProfile.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-4">
                <Card className="max-w-md w-full p-8 shadow-2xl bg-card">
                    <ShieldAlert className="mx-auto h-20 w-20 text-destructive mb-6" />
                    <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
                    <p className="text-muted-foreground mt-2 mb-6">You do not have the necessary permissions to view this page. Please contact an administrator if you believe this is an error.</p>
                    <Button onClick={() => router.replace('/dashboard')} size="lg">
                        Return to Dashboard
                    </Button>
                </Card>
            </div>
        );
    }

    const adminCards = [
        { title: "User Management", value: "N/A", description: "Total registered users", icon: Users, actionText: "Manage Users" },
        { title: "Content Overview", value: "N/A", description: "Recipes & Ingredients", icon: FileText, actionText: "View Content" },
        { title: "System Health", value: "Operational", description: "API and database status", icon: BarChart3, actionText: "View Status" },
        { title: "App Settings", value: "...", description: "Feature flags & config", icon: Settings, actionText: "Configure Settings" },
        { title: "Error Logs", value: "N/A", description: "Recent application errors", icon: Bug, actionText: "View Logs" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Welcome, Admin. Here you can manage users, content, and application settings.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {adminCards.map(card => (
                    <AdminStatCard key={card.title} {...card} />
                ))}
            </div>
        </div>
    );
}
