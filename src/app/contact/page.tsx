"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    Mail,
    Phone,
    MapPin,
    MessageSquare,
    Send,
    Loader2,
    Clock,
    CheckCircle,
} from "lucide-react";

interface ContactMethod {
    icon: React.ReactNode;
    title: string;
    description: string;
    contact: string;
    href: string;
}

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    message: string;
    priority: string;
    agreeToTerms: boolean;
}

interface OfficeHours {
    day: string;
    hours: string;
}

const contactMethods: ContactMethod[] = [
    {
        icon: <Mail className="h-6 w-6" />,
        title: "Email",
        description: "Get a response within 24 hours",
        contact: "hello@company.com",
        href: "mailto:hello@company.com",
    },
    {
        icon: <MessageSquare className="h-6 w-6" />,
        title: "Live Chat",
        description: "Instant support available now",
        contact: "Start chatting",
        href: "#",
    },
    {
        icon: <Phone className="h-6 w-6" />,
        title: "Phone",
        description: "Mon-Fri, 9AM-6PM EST",
        contact: "+1 (555) 123-4567",
        href: "tel:+15551234567",
    },
    {
        icon: <MapPin className="h-6 w-6" />,
        title: "Office",
        description: "Schedule an in-person meeting",
        contact: "123 Innovation St, Tech City",
        href: "#",
    },
];

const officeHours: OfficeHours[] = [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM EST" },
    { day: "Saturday", hours: "10:00 AM - 4:00 PM EST" },
    { day: "Sunday", hours: "Closed" },
];

const contactInfo = [
    { label: "Email", value: "hello@company.com" },
    { label: "Phone", value: "+1 (555) 123-4567" },
    { label: "Address", value: "123 Innovation St, Tech City" },
];

export default function ContactPage() {
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        message: "",
        priority: "normal",
        agreeToTerms: false,
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            priority: value,
        }));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            agreeToTerms: checked,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.agreeToTerms) {
            alert("Please agree to the Terms of Service and Privacy Policy");
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            setIsSubmitted(true);
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                company: "",
                message: "",
                priority: "normal",
                agreeToTerms: false,
            });
        } catch (error) {
            console.error("Form submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setIsSubmitted(false);
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-16">
                {/* Hero Section */}
                <div className="mb-20">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-black dark:text-white">
                        Contact Us
                    </h1>
                    <div className="w-24 h-1 bg-black dark:bg-white mb-8"></div>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
                        Ready to start your next project? Our team is here to help you succeed.
                        Reach out and let`s discuss how we can bring your ideas to life.
                    </p>
                </div>

                <div className="grid gap-16 lg:grid-cols-2 max-w-7xl mx-auto">
                    {/* Contact Methods */}
                    <div className="space-y-6">
                        {contactMethods.map((method, index) => (
                            <Card
                                key={index}
                                className="border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-all duration-300 hover:shadow-lg group bg-white dark:bg-black"
                            >
                                <CardContent className="p-8">
                                    <div className="flex items-start gap-6">
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-none border-2 border-gray-200 dark:border-gray-800 group-hover:border-black dark:group-hover:border-white group-hover:bg-black dark:group-hover:bg-white transition-all duration-300">
                                            <div className="text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                                                {method.icon}
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-xl mb-2 text-black dark:text-white">{method.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm leading-relaxed">
                                                {method.description}
                                            </p>
                                            <a
                                                href={method.href}
                                                className="text-black dark:text-white font-medium border-b border-transparent hover:border-black dark:hover:border-white transition-all duration-200 pb-1"
                                            >
                                                {method.contact}
                                            </a>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <div>
                        <Card className="border-2 border-gray-200 dark:border-gray-800 shadow-2xl bg-white dark:bg-black">
                            <CardHeader className="pb-6 border-b border-gray-100 dark:border-gray-900">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold mb-3 text-black dark:text-white">Send us a message</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fill out the form below and we will get back to you within 24 hours.
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                {isSubmitted ? (
                                    <div className="text-center py-12">
                                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-black dark:border-white">
                                            <CheckCircle className="h-10 w-10 text-black dark:text-white" />
                                        </div>
                                        <h3 className="mb-4 text-2xl font-bold text-black dark:text-white">Message Sent Successfully!</h3>
                                        <p className="mb-8 text-gray-600 dark:text-gray-400">
                                            Thank you for contacting us. We will get back to you within 24 hours.
                                        </p>
                                        <Button
                                            onClick={resetForm}
                                            className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-8 py-3 font-medium"
                                        >
                                            Send Another Message
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label htmlFor="firstName" className="text-black dark:text-white font-medium">First Name *</Label>
                                                <Input
                                                    id="firstName"
                                                    name="firstName"
                                                    placeholder="John"
                                                    required
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    className="border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-black h-12 rounded-none"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label htmlFor="lastName" className="text-black dark:text-white font-medium">Last Name *</Label>
                                                <Input
                                                    id="lastName"
                                                    name="lastName"
                                                    placeholder="Doe"
                                                    required
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    className="border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-black h-12 rounded-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="email" className="text-black dark:text-white font-medium">Email Address *</Label>
                                            <Input
                                                type="email"
                                                id="email"
                                                name="email"
                                                placeholder="john@company.com"
                                                required
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-black h-12 rounded-none"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="company" className="text-black dark:text-white font-medium">Company</Label>
                                            <Input
                                                id="company"
                                                name="company"
                                                placeholder="Your Company"
                                                value={formData.company}
                                                onChange={handleInputChange}
                                                className="border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-black h-12 rounded-none"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="priority" className="text-black dark:text-white font-medium">Priority</Label>
                                            <Select value={formData.priority} onValueChange={handleSelectChange}>
                                                <SelectTrigger className="border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-black h-12 rounded-none">
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-gray-700">
                                                    <SelectItem value="low">Low Priority</SelectItem>
                                                    <SelectItem value="normal">Normal Priority</SelectItem>
                                                    <SelectItem value="high">High Priority</SelectItem>
                                                    <SelectItem value="urgent">Urgent</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="message" className="text-black dark:text-white font-medium">Message *</Label>
                                            <Textarea
                                                id="message"
                                                name="message"
                                                placeholder="Tell us about your project, goals, or how we can help..."
                                                rows={6}
                                                required
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                className="border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-black resize-none rounded-none"
                                            />
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <Checkbox
                                                id="agreeToTerms"
                                                checked={formData.agreeToTerms}
                                                onCheckedChange={handleCheckboxChange}
                                                className="mt-1 border-gray-300 dark:border-gray-700 data-[state=checked]:bg-black dark:data-[state=checked]:bg-white data-[state=checked]:border-black dark:data-[state=checked]:border-white"
                                            />
                                            <Label
                                                htmlFor="agreeToTerms"
                                                className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 cursor-pointer"
                                            >
                                                I agree to the{" "}
                                                <a href="#" className="text-black dark:text-white font-medium border-b border-transparent hover:border-black dark:hover:border-white">
                                                    Terms of Service
                                                </a>{" "}
                                                and{" "}
                                                <a href="#" className="text-black dark:text-white font-medium border-b border-transparent hover:border-black dark:hover:border-white">
                                                    Privacy Policy
                                                </a>
                                            </Label>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isSubmitting || !formData.agreeToTerms}
                                            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-14 font-medium text-lg rounded-none transition-all duration-200 disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                                    Sending Message...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-3 h-5 w-5" />
                                                    Submit Message
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Office Information */}
                <div className="mt-24 max-w-7xl mx-auto">
                    <Separator className="mb-16 bg-gray-200 dark:bg-gray-800" />
                    <Card className="border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                        <CardContent className="p-12">
                            <div className="grid gap-12 md:grid-cols-2">
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold flex items-center gap-3 text-black dark:text-white">
                                        <Clock className="h-6 w-6" />
                                        Office Hours
                                    </h3>
                                    <div className="space-y-4">
                                        {officeHours.map((schedule, index) => (
                                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                                <span className="font-medium text-black dark:text-white">{schedule.day}</span>
                                                <span className="text-gray-600 dark:text-gray-400">{schedule.hours}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold flex items-center gap-3 text-black dark:text-white">
                                        <Mail className="h-6 w-6" />
                                        Contact Information
                                    </h3>
                                    <div className="space-y-4">
                                        {contactInfo.map((info, index) => (
                                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                                <span className="font-medium text-black dark:text-white">{info.label}</span>
                                                <span className="text-gray-600 dark:text-gray-400">{info.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}