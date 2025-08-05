"use client";

import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { Pencil, PlusCircle, Trash2, Crown, AlertTriangle, Filter } from "lucide-react";
import AddExperienceDialog from "@/components/AddExperienceDialog";
import ContentArea, { ResponsiveGrid, DashboardCard } from "@/components/Dashboard/ContentArea";
import FeatureGate from "@/components/Dashboard/FeatureGate";
import { UsageIndicator } from "@/components/Dashboard/SubscriptionStatus";
import { useAuth } from "@/contexts/AuthContext";
import { checkUsageLimits } from "@/lib/feature-gating";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Experience = {
    id: number;
    title: string;
    date: string;
    category?: string;
    country: string;
    note?: string;
    image_url?: string;
};

export default function MyExperiencesPage() {
    const { profile, subscription, isSubscribed } = useAuth();
    const [openDialog, setOpenDialog] = useState(false);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
    // Get usage limits
    const usageLimits = checkUsageLimits(profile, subscription, {
        experiences: experiences.length,
        exports: 0, // Assuming exports are not tracked here
        storage: profile?.storage_used || 0, // Assuming storage is tracked in profile
    });

    const fetchExperiences = async () => {
        const { data, error } = await supabase
            .from("trips")
            .select("*")
            .order("date", { ascending: false });

        if (!error && data) {
            setExperiences(data);
        } else {
            console.error("Veri alınamadı:", error?.message);
        }
    };

    const handleDelete = async (id: number) => {
        const { error } = await supabase.from("trips").delete().eq("id", id);
        if (error) {
            alert("Silme hatası: " + error.message);
        } else {
            fetchExperiences();
        }
    };

    const handleEdit = (exp: Experience) => {
        setSelectedExperience(exp);
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setSelectedExperience(null);
        setOpenDialog(false);
    };

    useEffect(() => {
        fetchExperiences();
    }, [openDialog]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = experiences.filter((e) => new Date(e.date) >= today);
    const past = experiences.filter((e) => new Date(e.date) < today);

    const canAddExperience = usageLimits.experiences.canAdd;
    const isNearLimit = usageLimits.experiences.limit !== -1 &&
        (usageLimits.experiences.current / usageLimits.experiences.limit) > 0.8;

    return (
        <ContentArea >
            <div className="space-y-6">
                {/* Header with Usage Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                            My Travel Experiences
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage and organize your travel memories
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Usage indicator */}
                        {subscription && (
                            <div className="flex items-center gap-2 text-sm">
                                <Badge variant={isSubscribed ? "default" : "secondary"}>
                                    {isSubscribed && <Crown className="w-3 h-3 mr-1" />}
                                    {subscription.name}
                                </Badge>
                                <span className="text-muted-foreground">
                                    {usageLimits.experiences.current}
                                    {usageLimits.experiences.limit === -1 ? ' experiences' : ` / ${usageLimits.experiences.limit}`}
                                </span>
                            </div>
                        )}

                        <Button
                            onClick={() => {
                                setSelectedExperience(null);
                                setOpenDialog(true);
                            }}
                            disabled={!canAddExperience}
                            className="min-h-[44px] touch-manipulation"
                        >
                            <PlusCircle className="mr-2 w-4 h-4" />
                            Add Experience
                        </Button>
                    </div>
                </div>

                {/* Usage Warnings */}
                {isNearLimit && (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            You are approaching your experience limit ({usageLimits.experiences.current} / {usageLimits.experiences.limit}).
                            {!isSubscribed && " Upgrade to add unlimited experiences."}
                        </AlertDescription>
                    </Alert>
                )}

                {!canAddExperience && (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            You have reached your experience limit.
                            {!isSubscribed ? " Upgrade your plan to add more experiences." : " Please delete some experiences to add new ones."}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Usage Stats */}
                {subscription && (
                    <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }}>
                        <DashboardCard title="Experience Usage" padding="sm">
                            <UsageIndicator
                                label="Experiences"
                                current={usageLimits.experiences.current}
                                limit={usageLimits.experiences.limit}
                            />
                            <UsageIndicator
                                label="Exports"
                                current={usageLimits.exports.current}
                                limit={usageLimits.exports.limit}
                            />
                            <UsageIndicator
                                label="Storage"
                                current={Number(((profile?.storage_used || 0) / (1024 * 1024)).toFixed(1))}
                                limit={Number(((subscription.limits.storage) / (1024 * 1024)).toFixed(1))}
                                unit=" MB"
                            />
                        </DashboardCard>

                        <DashboardCard title="Storage Usage" padding="sm">
                            <UsageIndicator
                                label="Storage"
                                current={Math.round((profile?.storage_used || 0) / (1024 * 1024))}
                                limit={subscription.limits.storage}
                                unit=" MB"
                            />
                        </DashboardCard>

                        <FeatureGate feature="advanced_analytics">
                            <DashboardCard title="Analytics" padding="sm">
                                <p className="text-sm text-muted-foreground mb-2">
                                    View detailed insights about your travels
                                </p>
                                <Button size="sm" className="w-full">View Analytics</Button>
                            </DashboardCard>
                        </FeatureGate>
                    </ResponsiveGrid>
                )}
            </div>

            <AddExperienceDialog
                open={openDialog}
                onClose={handleDialogClose}
                initialData={selectedExperience}
            />

            <div className="space-y-6">
                <Tabs defaultValue="upcoming" className="w-full space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <TabsList>
                            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                            <TabsTrigger value="past">Past</TabsTrigger>
                        </TabsList>

                        <FeatureGate
                            feature="advanced_search"
                            fallback={
                                <Button variant="outline" disabled className="min-h-[44px]">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Advanced Filter (Premium)
                                </Button>
                            }
                        >
                            <Button variant="outline" className="min-h-[44px] touch-manipulation">
                                <Filter className="w-4 h-4 mr-2" />
                                Advanced Filter
                            </Button>
                        </FeatureGate>
                    </div>

                    <TabsContent value="upcoming">
                        <ExperienceGrid
                            data={upcoming}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            canEdit={true}
                            canDelete={true}
                        />
                    </TabsContent>

                    <TabsContent value="past">
                        <ExperienceGrid
                            data={past}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            canEdit={true}
                            canDelete={true}
                        />
                    </TabsContent>
                </Tabs>

                {/* Premium Features Section */}
                <DashboardCard
                    title="Premium Features"
                    description="Unlock advanced capabilities for your travel experiences"
                >
                    <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }}>
                        <FeatureGate feature="export_data">
                            <DashboardCard title="Export Data" className="border-blue-200">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Export your experiences in PDF, CSV, or JSON format.
                                </p>
                                <Button className="w-full">Export Experiences</Button>
                            </DashboardCard>
                        </FeatureGate>

                        <FeatureGate feature="bulk_operations">
                            <DashboardCard title="Bulk Operations" className="border-green-200">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Edit, delete, or organize multiple experiences at once.
                                </p>
                                <Button className="w-full">Bulk Edit</Button>
                            </DashboardCard>
                        </FeatureGate>

                        <FeatureGate feature="collaboration">
                            <DashboardCard title="Share & Collaborate" className="border-purple-200">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Share your experiences with friends and collaborate on trips.
                                </p>
                                <Button className="w-full">Share Experiences</Button>
                            </DashboardCard>
                        </FeatureGate>
                    </ResponsiveGrid>
                </DashboardCard>
            </div>
        </ContentArea>
    );
}

function ExperienceGrid({
    data,
    onDelete,
    onEdit,
    canEdit = true,
    canDelete = true,
}: {
    data: Experience[];
    onDelete: (id: number) => void;
    onEdit: (exp: Experience) => void;
    canEdit?: boolean;
    canDelete?: boolean;
}) {
    if (data.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <PlusCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg mb-2">No experiences yet</p>
                <p className="text-sm text-muted-foreground">
                    Start documenting your travel memories by adding your first experience.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((exp) => (
                <Card
                    key={exp.id}
                    className="overflow-hidden hover:shadow-md transition relative"
                >
                    <div className="relative h-40 w-full bg-muted">
                        {exp.image_url ? (
                            <Image
                                src={exp.image_url}
                                alt={exp.title}
                                fill
                                className="object-cover transition-transform hover:scale-105"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                Görsel yok
                            </div>
                        )}
                    </div>

                    <CardHeader>
                        <CardTitle>{exp.title}</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-1">
                        {exp.category && (
                            <p className="text-xs font-medium text-primary/70">
                                {exp.category}
                            </p>
                        )}
                        <p className="text-sm text-muted-foreground">{exp.date}</p>
                        <p className="text-sm">{exp.country}</p>
                        {exp.note && (
                            <p className="text-sm mt-1 text-gray-600 line-clamp-3">
                                {exp.note}
                            </p>
                        )}

                        <div className="flex gap-2 mt-4">
                            {canEdit && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(exp)}
                                    className="min-h-[44px] touch-manipulation"
                                >
                                    <Pencil className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                            )}
                            {canDelete && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onDelete(exp.id)}
                                    className="min-h-[44px] touch-manipulation"
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
