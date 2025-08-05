"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MapPin, Star, Plane, Globe, Calendar, Users, ArrowRight, Target, Award } from "lucide-react";
import Image from "next/image";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureGrid } from "@/components/landing/FeaturesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { NewsletterSignup } from "@/components/landing/NewsletterSignup";

const popularDestinations = [
  {
    name: "Paris",
    country: "France",
    img: "https://images.unsplash.com/photo-1584266337361-679ae80c8519?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.9,
    trips: 2847
  },
  {
    name: "Tokyo",
    country: "Japan",
    img: "https://images.unsplash.com/photo-1573985525948-591412799467?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.8,
    trips: 1923
  },
  {
    name: "New York",
    country: "USA",
    img: "https://images.unsplash.com/photo-1580752300928-6e1d4ed200c0?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.7,
    trips: 3251
  },
  {
    name: "Istanbul",
    country: "Turkey",
    img: "https://images.unsplash.com/photo-1710897248755-ea7a90a18e6a?q=80&w=853&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.9,
    trips: 1456
  },
];

const blogPosts = [
  {
    title: "Mikro Seyahatlerde Bütçe Planlaması",
    excerpt: "Kısa seyahatlerinizde bütçenizi nasıl optimize edersiniz? Pratik ipuçları ve öneriler...",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop",
    readTime: "5 dk"
  },
  {
    title: "En İyi 10 Hafta Sonu Kaçamağı",
    excerpt: "İstanbul'dan kolayca ulaşabileceğiniz, 2-3 günde keşfedebileceğiniz destinasyonlar...",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=250&fit=crop",
    readTime: "8 dk"
  },
  {
    title: "Doğa Fotoğrafçılığı İpuçları",
    excerpt: "Seyahatlerinizde çektiğiniz fotoğrafları nasıl daha profesyonel hale getirirsiniz...",
    image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=250&fit=crop",
    readTime: "6 dk"
  }
];

const stats = [
  { number: "25K+", label: "Mutlu Seyahatçi", icon: <Users className="w-6 h-6" /> },
  { number: "500+", label: "Mikro Seyahat Paketi", icon: <Plane className="w-6 h-6" /> },
  { number: "15+", label: "Ülkede Hizmet", icon: <Globe className="w-6 h-6" /> },
  { number: "4.9", label: "Ortalama Puan", icon: <Star className="w-6 h-6" /> }
];

export default function Home() {
  const handleHeroSearch = (query: string) => {
    // Handle search from hero section
    alert(`Arama yapılıyor: ${query}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection onSearch={handleHeroSearch} />

      <div className="relative z-10 space-y-20 px-4 py-12">
        {/* Features Section */}
        <FeatureGrid maxFeatures={3} />

        {/* Statistics Section */}
        <section className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white transform transition-all group-hover:scale-110 group-hover:shadow-xl">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Enhanced Features Section */}
        <FeatureGrid />

        {/* Pricing Section */}
        <PricingSection />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Popular Destinations */}
        <section className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
              Popüler Destinasyonlar
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">En çok tercih edilen seyahat noktaları</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {popularDestinations.map(({ name, country, img, rating, trips }, index) => (
              <Card
                key={name}
                className="group rounded-xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="relative overflow-hidden rounded-xl">
                  <Image
                    src={img}
                    alt={name}
                    className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    width={400}
                    height={220}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{rating}</span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{name}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{country}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{trips.toLocaleString()} seyahat</span>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <Button
                    variant="outline"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg transform transition-all hover:scale-105"
                  >
                    Detayları Gör
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>



        {/* Blog Section */}
        <section className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
              Seyahat Rehberi
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">İpuçları, rehberler ve seyahat hikayeleri</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <Card key={index} className="group overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transform transition-all hover:scale-105">
                <div className="relative overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {post.readTime}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{post.excerpt}</p>
                  <Button variant="ghost" className="text-purple-600 hover:text-purple-700 p-0 h-auto font-semibold">
                    Devamını Oku <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* About Us Section */}
        <section className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-3xl p-12 backdrop-blur-lg border border-white/20 dark:border-gray-700/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
                  Neden Mikro Seyahat?
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  Hayatın hızında kaybolmadan, kısa molalarla kendinizi yenilemenin gücüne inanıyoruz.
                  Her mikro seyahat, size büyük deneyimler yaşatmak için özenle tasarlanıyor.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">Uzman rehberlerle kişiselleştirilmiş deneyimler</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">Sürdürülebilir ve sorumlu turizm anlayışı</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">7/24 müşteri desteği ve güvence</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 rounded-2xl backdrop-blur-sm">
                  <Target className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Misyonumuz</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Herkesi seyahat etmeye teşvik etmek</p>
                </div>
                <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 rounded-2xl backdrop-blur-sm">
                  <Award className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Vizyonumuz</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Dünyanın en güvenilir seyahat platformu</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Map Section */}
        <section className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
              Keşfedilecek Yerler
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Size en yakın mikro seyahat deneyimleri</p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl border border-white/20 dark:border-gray-700/20 p-8">
            <div className="relative h-96">
              <Image
                src="https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=1200&h=800&fit=crop"
                alt="World Map"
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-3xl"
              />
              <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Tüm Dünyayı Keşfet</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-8 py-3 shadow-lg transform transition-all hover:scale-105"
              >
                Haritayı İncele
              </Button>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <NewsletterSignup />

        {/* FAQ Section */}
        <FAQSection />

        {/* Contact Section */}
        <section className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
              Bizimle İletişime Geçin
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Herhangi bir sorunuz veya öneriniz mi var?</p>
          </div>

          <form className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input type="text" placeholder="Adınız" required className="w-full bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 rounded-full px-4 py-3 focus:ring focus:ring-purple-500 focus:outline-none" />
              <Input type="email" placeholder="E-posta adresiniz" required className="w-full bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 rounded-full px-4 py-3 focus:ring focus:ring-purple-500 focus:outline-none" />
            </div>
            <Input type="text" placeholder="Konu" required className="w-full bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 rounded-full px-4 py-3 focus:ring focus:ring-purple-500 focus:outline-none" />
            <textarea placeholder="Mesajınız" required className="w-full h-32 bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 rounded-xl px-4 py-3 focus:ring focus:ring-purple-500 focus:outline-none"></textarea>
            <Button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-6 py-3 shadow-lg transform transition-all hover:scale-105">
              Gönder
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}