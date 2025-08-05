"use client";

import { useState } from "react";
import { FAQItem } from "./FAQItem";
import { HelpCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const faqs = [
    {
        question: "Mikro seyahat nedir?",
        answer: "Mikro seyahat, 1-4 gün arasında süren, kısa ama yoğun deneyimler sunan seyahat paketleridir. Hafta sonu kaçamakları veya kısa tatiller için idealdir. Her detay özenle planlanmış, yerel rehberler eşliğinde otantik deneyimler yaşamanızı sağlar."
    },
    {
        question: "Rezervasyon nasıl yapabilirim?",
        answer: "Web sitemiz üzerinden kolayca rezervasyon yapabilirsiniz. Paket seçimi, tarih belirleme ve ödeme işlemlerini online olarak tamamlayabilirsiniz. Mobil uygulamamız üzerinden de 24/7 rezervasyon yapma imkanınız bulunmaktadır."
    },
    {
        question: "İptal politikanız nedir?",
        answer: "Seyahat tarihinden 7 gün öncesine kadar ücretsiz iptal imkanı sunuyoruz. 7 günden az süre kala yapılan iptallerde kısmi ücret kesilir. Acil durumlar için esnek iptal seçeneklerimiz de mevcuttur."
    },
    {
        question: "Grup indirimleri var mı?",
        answer: "Evet! 6 kişi ve üzeri gruplar için özel indirimler sunuyoruz. Ayrıca kurumsal gruplar, okul gezileri ve özel etkinlikler için özelleştirilmiş paketler hazırlıyoruz. Detaylar için müşteri hizmetlerimizle iletişime geçebilirsiniz."
    },
    {
        question: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
        answer: "Kredi kartı, banka kartı, havale/EFT ve dijital cüzdan seçenekleri ile ödeme yapabilirsiniz. Tüm ödemeler SSL sertifikası ile güvence altındadır. Taksitli ödeme seçenekleri de mevcuttur."
    },
    {
        question: "Seyahat sigortası dahil mi?",
        answer: "Temel seyahat sigortası tüm paketlerimizde dahildir. Ek olarak kapsamlı sigorta seçenekleri de sunuyoruz. Sağlık, bagaj ve iptal sigortası gibi ek güvenceler için paket seçimi sırasında bilgi alabilirsiniz."
    },
    {
        question: "Rehberler nasıl seçiliyor?",
        answer: "Tüm rehberlerimiz deneyimli, sertifikalı ve yerel kültürü iyi bilen kişilerdir. Düzenli eğitimlerle kendilerini geliştirirler ve müşteri memnuniyeti odaklı hizmet verirler. Her rehber için müşteri değerlendirmeleri mevcuttur."
    },
    {
        question: "Özel diyet ihtiyaçlarım karşılanır mı?",
        answer: "Elbette! Vejetaryen, vegan, glutensiz, helal ve diğer özel diyet ihtiyaçlarınızı rezervasyon sırasında belirtebilirsiniz. Yerel mutfak deneyimlerinde de bu ihtiyaçlarınız göz önünde bulundurulur."
    }
];

interface FAQSectionProps {
    className?: string;
    maxItems?: number;
}

export function FAQSection({ className = "", maxItems }: FAQSectionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const displayFaqs = maxItems ? faqs.slice(0, maxItems) : faqs;

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className={`max-w-4xl mx-auto px-4 ${className}`}>
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-6">
                    <HelpCircle className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                    Sıkça Sorulan Sorular
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Mikro seyahatler hakkında merak ettiğiniz her şey. Sorunuzun cevabını bulamadınız mı?
                </p>
            </div>

            <div className="space-y-4 mb-12">
                {displayFaqs.map((faq, index) => (
                    <FAQItem
                        key={index}
                        question={faq.question}
                        answer={faq.answer}
                        isOpen={openIndex === index}
                        onToggle={() => toggleFAQ(index)}
                        className="animate-in fade-in-0 slide-in-from-bottom-4"
                        style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
                    />
                ))}
            </div>

            {/* Contact Support CTA */}
            <div className="text-center bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl p-8 backdrop-blur-lg border border-white/20 dark:border-gray-700/20">
                <MessageCircle className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Başka sorularınız mı var?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Uzman ekibimiz size yardımcı olmak için burada. 7/24 destek alabilirsiniz.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/contact">
                        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                            İletişime Geç
                        </Button>
                    </Link>
                    <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                        Canlı Destek
                    </Button>
                </div>
            </div>
        </section>
    );
}