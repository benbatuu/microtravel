"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    User,
    Mail,
    MapPin,
    Calendar,
    Camera,
    Edit,
    Save,
    X,
    Globe,
    Star,
    Plane,
    Heart
} from "lucide-react";
import ContentArea, { ResponsiveGrid, DashboardCard } from "@/components/Dashboard/ContentArea";
import { useAuth } from "@/contexts/AuthContext";

interface UserStats {
    totalTrips: number;
    countriesVisited: number;
    favoriteDestinations: number;
    totalRating: number;
}

const mockStats: UserStats = {
    totalTrips: 24,
    countriesVisited: 12,
    favoriteDestinations: 8,
    totalRating: 4.8
};

const recentTrips = [
    {
        id: 1,
        destination: "Paris, France",
        date: "2024-12-15",
        rating: 5,
        image: "https://images.unsplash.com/photo-1584266337361-679ae80c8519?w=100&h=100&fit=crop"
    },
    {
        id: 2,
        destination: "Tokyo, Japan",
        date: "2024-11-20",
        rating: 5,
        image: "https://images.unsplash.com/photo-1573985525948-591412799467?w=100&h=100&fit=crop"
    },
    {
        id: 3,
        destination: "New York, USA",
        date: "2024-10-10",
        rating: 4,
        image: "https://images.unsplash.com/photo-1580752300928-6e1d4ed200c0?w=100&h=100&fit=crop"
    }
];

export default function ProfilePage() {
    const { profile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: profile?.full_name || "",
        email: profile?.email || "",
        bio: "Travel enthusiast exploring the world one micro-adventure at a time.",
        location: "San Francisco, CA",
        website: "https://mytravel.blog"
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        // In a real implementation, this would save to the database
        console.log("Saving profile:", formData);
        setIsEditing(false);
        // Show success toast
        alert("Profile updated successfully!");
    };

    const handleCancel = () => {
        // Reset form data
        setFormData({
            fullName: profile?.full_name || "",
            email: profile?.email || "",
            bio: "Travel enthusiast exploring the world one micro-adventure at a time.",
            location: "San Francisco, CA",
            website: "https://mytravel.blog"
        });
        setIsEditing(false);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <ContentArea>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                            Profile
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your profile information and travel preferences
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </div>

                <ResponsiveGrid cols={{ default: 1, lg: 3 }}>
                    {/* Profile Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <DashboardCard title="Profile Information">
                            <div className="space-y-6">
                                {/* Avatar Section */}
                                <div className="flex items-center space-x-6">
                                    <div className="relative">
                                        <Avatar className="w-24 h-24">
                                            <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                                            <AvatarFallback className="text-lg">
                                                {getInitials(formData.fullName || "User")}
                                            </AvatarFallback>
                                        </Avatar>
                                        {isEditing && (
                                            <Button
                                                size="sm"
                                                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                                            >
                                                <Camera className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {formData.fullName || "Your Name"}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            Member since {new Date().getFullYear()}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="secondary">Explorer</Badge>
                                            <Badge variant="outline">Verified</Badge>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <Input
                                                id="fullName"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="pl-10"
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                disabled={true} // Email should not be editable
                                                className="pl-10"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <Input
                                                id="location"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="pl-10"
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="website">Website</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <Input
                                                id="website"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="pl-10"
                                                placeholder="https://yourwebsite.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                        disabled={!isEditing}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Tell us about yourself and your travel experiences..."
                                    />
                                </div>
                            </div>
                        </DashboardCard>

                        {/* Recent Trips */}
                        <DashboardCard title="Recent Trips" description="Your latest travel experiences">
                            <div className="space-y-4">
                                {recentTrips.map((trip) => (
                                    <div
                                        key={trip.id}
                                        className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={trip.image}
                                                alt={trip.destination}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                                {trip.destination}
                                            </h4>
                                            <div className="flex items-center gap-4 mt-1">
                                                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(trip.date).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < trip.rating
                                                                ? 'text-yellow-400 fill-current'
                                                                : 'text-gray-300 dark:text-gray-600'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            View
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </DashboardCard>
                    </div>

                    {/* Stats Sidebar */}
                    <div className="space-y-6">
                        {/* Travel Stats */}
                        <DashboardCard title="Travel Stats">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                            <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Total Trips</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {mockStats.totalTrips}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                            <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Countries</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {mockStats.countriesVisited}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                            <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Favorites</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {mockStats.favoriteDestinations}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                                            <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Avg Rating</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {mockStats.totalRating}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DashboardCard>

                        {/* Account Settings */}
                        <DashboardCard title="Account Settings">
                            <div className="space-y-3">
                                <Button variant="outline" className="w-full justify-start">
                                    <User className="w-4 h-4 mr-2" />
                                    Privacy Settings
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Mail className="w-4 h-4 mr-2" />
                                    Email Preferences
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Globe className="w-4 h-4 mr-2" />
                                    Language & Region
                                </Button>
                            </div>
                        </DashboardCard>
                    </div>
                </ResponsiveGrid>
            </div>
        </ContentArea>
    );
}