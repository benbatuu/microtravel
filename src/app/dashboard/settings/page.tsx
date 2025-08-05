'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { User, CreditCard, Bell, Shield, Crown, Settings as SettingsIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ContentArea, { ResponsiveGrid, DashboardCard } from '@/components/Dashboard/ContentArea';
import SubscriptionStatus from '@/components/Dashboard/SubscriptionStatus';
import FeatureGate from '@/components/Dashboard/FeatureGate';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'profile';
    const { profile, subscription, isSubscribed } = useAuth();

    const [activeTab, setActiveTab] = useState(defaultTab);

    return (
        <ContentArea>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Settings
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your account preferences and subscription
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                        <TabsTrigger value="profile" className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">Profile</span>
                        </TabsTrigger>
                        <TabsTrigger value="subscription" className="flex items-center gap-2">
                            <Crown className="w-4 h-4" />
                            <span className="hidden sm:inline">Subscription</span>
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            <span className="hidden sm:inline">Notifications</span>
                        </TabsTrigger>
                        <TabsTrigger value="privacy" className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span className="hidden sm:inline">Privacy</span>
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="flex items-center gap-2">
                            <SettingsIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Preferences</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Settings */}
                    <TabsContent value="profile" className="space-y-6">
                        <DashboardCard title="Profile Information" description="Update your personal information">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            defaultValue={profile?.full_name || ''}
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            defaultValue={profile?.email || ''}
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Input
                                        id="bio"
                                        placeholder="Tell us about yourself"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button>Save Changes</Button>
                                </div>
                            </div>
                        </DashboardCard>

                        <DashboardCard title="Account Security" description="Manage your account security settings">
                            <div className="space-y-4">
                                <Button variant="outline" className="w-full sm:w-auto">
                                    Change Password
                                </Button>
                                <Button variant="outline" className="w-full sm:w-auto">
                                    Enable Two-Factor Authentication
                                </Button>
                            </div>
                        </DashboardCard>
                    </TabsContent>

                    {/* Subscription Settings */}
                    <TabsContent value="subscription" className="space-y-6">
                        <ResponsiveGrid cols={{ default: 1, lg: 2 }}>
                            <SubscriptionStatus showDetails />

                            <DashboardCard title="Billing Information" description="Manage your payment methods">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="w-5 h-5" />
                                            <div>
                                                <p className="font-medium">•••• •••• •••• 4242</p>
                                                <p className="text-sm text-muted-foreground">Expires 12/25</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Edit</Button>
                                    </div>

                                    <Button variant="outline" className="w-full">
                                        Add Payment Method
                                    </Button>
                                </div>
                            </DashboardCard>
                        </ResponsiveGrid>

                        {/* Subscription Plans */}
                        <DashboardCard title="Available Plans" description="Choose the plan that works best for you">
                            <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }}>
                                {/* Free Plan */}
                                <Card className={`${!isSubscribed ? 'ring-2 ring-primary' : ''}`}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            Free
                                            {!isSubscribed && <Badge>Current</Badge>}
                                        </CardTitle>
                                        <div className="text-2xl font-bold">$0<span className="text-sm font-normal">/month</span></div>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2 text-sm">
                                            <li>• 5 experiences</li>
                                            <li>• 50MB storage</li>
                                            <li>• Basic features</li>
                                        </ul>
                                        <Button
                                            variant={!isSubscribed ? "default" : "outline"}
                                            className="w-full mt-4"
                                            disabled={!isSubscribed}
                                        >
                                            {!isSubscribed ? "Current Plan" : "Downgrade"}
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Explorer Plan */}
                                <Card className={`${subscription?.name === 'Explorer' ? 'ring-2 ring-primary' : ''}`}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            Explorer
                                            {subscription?.name === 'Explorer' && <Badge>Current</Badge>}
                                        </CardTitle>
                                        <div className="text-2xl font-bold">$9<span className="text-sm font-normal">/month</span></div>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2 text-sm">
                                            <li>• 50 experiences</li>
                                            <li>• 500MB storage</li>
                                            <li>• Advanced analytics</li>
                                            <li>• Data export</li>
                                        </ul>
                                        <Button className="w-full mt-4">
                                            {subscription?.name === 'Explorer' ? "Current Plan" : "Upgrade"}
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Traveler Plan */}
                                <Card className={`${subscription?.name === 'Traveler' ? 'ring-2 ring-primary' : ''}`}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            Traveler
                                            {subscription?.name === 'Traveler' && <Badge>Current</Badge>}
                                        </CardTitle>
                                        <div className="text-2xl font-bold">$19<span className="text-sm font-normal">/month</span></div>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2 text-sm">
                                            <li>• Unlimited experiences</li>
                                            <li>• 5GB storage</li>
                                            <li>• All Explorer features</li>
                                            <li>• Priority support</li>
                                            <li>• Collaboration tools</li>
                                        </ul>
                                        <Button className="w-full mt-4">
                                            {subscription?.name === 'Traveler' ? "Current Plan" : "Upgrade"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </ResponsiveGrid>
                        </DashboardCard>
                    </TabsContent>

                    {/* Notification Settings */}
                    <TabsContent value="notifications" className="space-y-6">
                        <DashboardCard title="Email Notifications" description="Choose what emails you'd like to receive">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">New experiences from followed users</p>
                                        <p className="text-sm text-muted-foreground">Get notified when users you follow share new experiences</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Weekly digest</p>
                                        <p className="text-sm text-muted-foreground">A summary of popular experiences and recommendations</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Marketing emails</p>
                                        <p className="text-sm text-muted-foreground">Updates about new features and special offers</p>
                                    </div>
                                    <Switch />
                                </div>
                            </div>
                        </DashboardCard>

                        <FeatureGate feature="priority_support">
                            <DashboardCard title="Push Notifications" description="Manage mobile and desktop notifications">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Real-time updates</p>
                                            <p className="text-sm text-muted-foreground">Instant notifications for important updates</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </div>
                            </DashboardCard>
                        </FeatureGate>
                    </TabsContent>

                    {/* Privacy Settings */}
                    <TabsContent value="privacy" className="space-y-6">
                        <DashboardCard title="Profile Visibility" description="Control who can see your profile and experiences">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Public profile</p>
                                        <p className="text-sm text-muted-foreground">Allow others to find and view your profile</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Show experiences publicly</p>
                                        <p className="text-sm text-muted-foreground">Make your experiences discoverable in explore section</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </div>
                        </DashboardCard>

                        <DashboardCard title="Data & Privacy" description="Manage your data and privacy preferences">
                            <div className="space-y-4">
                                <Button variant="outline" className="w-full sm:w-auto">
                                    Download My Data
                                </Button>
                                <Button variant="outline" className="w-full sm:w-auto">
                                    Delete Account
                                </Button>
                            </div>
                        </DashboardCard>
                    </TabsContent>

                    {/* Preferences */}
                    <TabsContent value="preferences" className="space-y-6">
                        <DashboardCard title="Display Preferences" description="Customize how the app looks and feels">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Dark mode</p>
                                        <p className="text-sm text-muted-foreground">Use dark theme throughout the app</p>
                                    </div>
                                    <Switch />
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label>Language</Label>
                                    <select className="w-full p-2 border rounded-md">
                                        <option>English</option>
                                        <option>Spanish</option>
                                        <option>French</option>
                                        <option>German</option>
                                    </select>
                                </div>
                            </div>
                        </DashboardCard>

                        <FeatureGate feature="custom_themes">
                            <DashboardCard title="Custom Themes" description="Personalize your experience with custom themes">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 border rounded-lg cursor-pointer hover:border-primary">
                                        <div className="w-full h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded mb-2"></div>
                                        <p className="text-sm text-center">Ocean</p>
                                    </div>
                                    <div className="p-4 border rounded-lg cursor-pointer hover:border-primary">
                                        <div className="w-full h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded mb-2"></div>
                                        <p className="text-sm text-center">Forest</p>
                                    </div>
                                    <div className="p-4 border rounded-lg cursor-pointer hover:border-primary">
                                        <div className="w-full h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded mb-2"></div>
                                        <p className="text-sm text-center">Sunset</p>
                                    </div>
                                </div>
                            </DashboardCard>
                        </FeatureGate>
                    </TabsContent>
                </Tabs>
            </div>
        </ContentArea>
    );
}