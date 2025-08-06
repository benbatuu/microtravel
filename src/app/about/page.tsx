"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Target, Award, Users, Heart, Compass, ArrowLeft } from "lucide-react";
import Image from "next/image";

const teamMembers = [
    {
        name: "Sarah Johnson",
        role: "CEO & Founder",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
        bio: "Travel enthusiast with 15+ years in the tourism industry"
    },
    {
        name: "Michael Chen",
        role: "CTO",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
        bio: "Tech innovator passionate about creating seamless travel experiences"
    },
    {
        name: "Emma Rodriguez",
        role: "Head of Operations",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
        bio: "Operations expert ensuring every micro-trip is perfectly executed"
    }
];

const values = [
    {
        icon: <Heart className="w-8 h-8" />,
        title: "Authentic Experiences",
        description: "We believe in genuine, local experiences that connect travelers with the heart of each destination."
    },
    {
        icon: <Compass className="w-8 h-8" />,
        title: "Sustainable Travel",
        description: "Our commitment to responsible tourism ensures that every trip benefits local communities and preserves natural beauty."
    },
    {
        icon: <Users className="w-8 h-8" />,
        title: "Community First",
        description: "We foster a community of like-minded travelers who share stories, tips, and unforgettable moments."
    },
    {
        icon: <Globe className="w-8 h-8" />,
        title: "Global Accessibility",
        description: "Making travel accessible to everyone, regardless of time constraints or budget limitations."
    }
];

const milestones = [
    { year: "2020", event: "MicroTravel founded with a vision to revolutionize short-term travel" },
    { year: "2021", event: "Launched our first 50 micro-travel experiences across 5 countries" },
    { year: "2022", event: "Reached 10,000 happy travelers and expanded to 15 countries" },
    { year: "2023", event: "Introduced AI-powered personalized travel recommendations" },
    { year: "2024", event: "Achieved carbon-neutral operations and 25,000+ community members" }
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-6 py-4">
                    <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 space-y-20">
                {/* Hero Section */}
                <section className="text-center max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
                        About MicroTravel
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                        We're on a mission to make authentic travel experiences accessible to everyone,
                        one micro-adventure at a time. Discover the world without the constraints of time or budget.
                    </p>
                    <div className="flex justify-center">
                        <Image
                            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop"
                            alt="Team collaboration"
                            width={800}
                            height={400}
                            className="rounded-2xl shadow-2xl"
                        />
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                        <CardContent className="p-8">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                To democratize travel by creating meaningful, short-duration experiences that fit into busy lifestyles.
                                We believe that everyone deserves to explore the world, regardless of their schedule or budget constraints.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                        <CardContent className="p-8">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                                    <Award className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Vision</h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                To become the world's most trusted platform for micro-travel experiences,
                                fostering a global community of conscious travelers who value quality over quantity
                                and authentic connections over tourist traps.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Values */}
                <section className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                            Our Values
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            The principles that guide everything we do
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {values.map((value, index) => (
                            <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                                <CardContent className="p-8">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                                            {value.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                                {value.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                                {value.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Team */}
                <section className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                            Meet Our Team
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            The passionate people behind MicroTravel
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {teamMembers.map((member, index) => (
                            <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                                <CardContent className="p-8 text-center">
                                    <div className="relative w-32 h-32 mx-auto mb-6">
                                        <Image
                                            src={member.image}
                                            alt={member.name}
                                            fill
                                            className="rounded-full object-cover"
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {member.name}
                                    </h3>
                                    <p className="text-purple-600 dark:text-purple-400 font-medium mb-4">
                                        {member.role}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                        {member.bio}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Timeline */}
                <section className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                            Our Journey
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            Key milestones in our mission to revolutionize travel
                        </p>
                    </div>

                    <div className="space-y-8">
                        {milestones.map((milestone, index) => (
                            <div key={index} className="flex items-start space-x-6">
                                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {milestone.year}
                                </div>
                                <Card className="flex-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-lg">
                                    <CardContent className="p-6">
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {milestone.event}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center max-w-4xl mx-auto">
                    <Card className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-lg border-0 shadow-xl">
                        <CardContent className="p-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                Ready to Start Your Micro-Adventure?
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
                                Join thousands of travelers who have discovered the joy of micro-travel.
                                Your next adventure is just a click away.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/getstarted">
                                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-full shadow-lg transform transition-all hover:scale-105">
                                        Get Started
                                    </Button>
                                </Link>
                                <Link href="/contact">
                                    <Button variant="outline" className="px-8 py-3 rounded-full border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                                        Contact Us
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}