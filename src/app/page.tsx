"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureGrid } from "@/components/landing/FeaturesSection";

import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { DestinationsSection } from "@/components/landing/DestinationsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { NewsletterSignup } from "@/components/landing/NewsletterSignup";
import { StatisticsSection } from "@/components/landing/Statistics";
import { PricingSection } from "@/components/landing/PricingSection";
import { BlogSection } from "@/components/landing/BlogSection";

export default function Home() {

  const handleHeroSearch = (query: string) => {
    // Handle search from hero section
    alert(`Searching for: ${query}y}`);
  };

  return (
    <div className="min-h-screen">
      <HeroSection onSearch={handleHeroSearch} />
      <FeatureGrid />
      <PricingSection />
      <StatisticsSection />
      <DestinationsSection />
      <TestimonialsSection />
      <BlogSection />
      <FAQSection />
    </div>
  );
}