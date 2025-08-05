'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Plus, X, Star, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from "sonner";
import Image from 'next/image';

// Trip interface with proper typing
interface Trip {
    title: string;
    date: Date | null;
    country: string;
    category: string;
    note: string;
    image_file: File | null;
    budget: string;
    accommodation: string;
    activities: string[];
    map_location: string;
    companions: string;
    rating: number;
}

// Trip data for database insertion
interface TripData {
    user_id: string;
    title: string;
    date: string;
    country: string;
    category: string | null;
    note: string | null;
    image_url: string | null;
    budget: number | null;
    accommodation: string | null;
    activities: string[] | null;
    map_location: string | null;
    companions: string | null;
    rating: number | null;
}

// Categories with better organization
const CATEGORIES = [
    'Tatil',
    'İş Seyahati',
    'Kültürel Gezi',
    'Macera',
    'Doğa',
    'Şehir Turu',
    'Romantik Kaçamak',
    'Aile Gezisi',
    'Solo Seyahat',
    'Eğitim',
    'Spor',
    'Festival/Etkinlik'
] as const;

type Category = typeof CATEGORIES[number];

interface TripModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTripAdded?: () => void;
}

const TripModal: React.FC<TripModalProps> = ({ open, onOpenChange, onTripAdded }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [imageUploading, setImageUploading] = useState<boolean>(false);
    const [currentActivity, setCurrentActivity] = useState<string>('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const user = useUser();
    const supabase = createClientComponentClient();

    const [formData, setFormData] = useState<Trip>({
        title: '',
        date: null,
        country: '',
        category: '',
        note: '',
        image_file: null,
        budget: '',
        accommodation: '',
        activities: [],
        map_location: '',
        companions: '',
        rating: 0
    });

    const handleInputChange = useCallback(<K extends keyof Trip>(field: K, value: Trip[K]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const handleImageUpload = useCallback(async (file: File) => {
        if (!user || !file) return null;

        setImageUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('trip-images')
                .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('trip-images')
                .getPublicUrl(data.path);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error("Fotoğraf yüklenemedi");
            return null;
        } finally {
            setImageUploading(false);
        }
    }, [user, supabase]);

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Lütfen geçerli bir resim dosyası seçin");
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Dosya boyutu 5MB'dan küçük olmalıdır");
            return;
        }

        handleInputChange('image_file', file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    }, [handleInputChange]);

    const addActivity = useCallback(() => {
        const trimmedActivity = currentActivity.trim();
        if (trimmedActivity && !formData.activities.includes(trimmedActivity)) {
            setFormData(prev => ({
                ...prev,
                activities: [...prev.activities, trimmedActivity]
            }));
            setCurrentActivity('');
        }
    }, [currentActivity, formData.activities]);

    const removeActivity = useCallback((activity: string) => {
        setFormData(prev => ({
            ...prev,
            activities: prev.activities.filter(a => a !== activity)
        }));
    }, []);

    const handleRatingClick = useCallback((rating: number) => {
        setFormData(prev => ({
            ...prev,
            rating: prev.rating === rating ? 0 : rating
        }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData({
            title: '',
            date: null,
            country: '',
            category: '',
            note: '',
            image_file: null,
            budget: '',
            accommodation: '',
            activities: [],
            map_location: '',
            companions: '',
            rating: 0
        });
        setCurrentActivity('');
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!user) {
            toast.error("Giriş yapmanız gerekiyor");
            return;
        }

        if (!formData.title || !formData.date || !formData.country) {
            toast.error("Başlık, tarih ve ülke/şehir alanları zorunludur");
            return;
        }

        setLoading(true);

        try {
            let imageUrl: string | null = null;

            // Upload image if exists
            if (formData.image_file) {
                imageUrl = await handleImageUpload(formData.image_file);
            }

            const tripData: TripData = {
                user_id: user.id,
                title: formData.title,
                date: formData.date.toISOString().split('T')[0],
                country: formData.country,
                category: formData.category || null,
                note: formData.note || null,
                image_url: imageUrl,
                budget: formData.budget ? parseFloat(formData.budget) : null,
                accommodation: formData.accommodation || null,
                activities: formData.activities.length > 0 ? formData.activities : null,
                map_location: formData.map_location || null,
                companions: formData.companions || null,
                rating: formData.rating > 0 ? formData.rating : null
            };

            const { error } = await supabase
                .from('trips')
                .insert([tripData])
                .select();

            if (error) {
                throw error;
            }

            toast.success("Seyahat başarıyla kaydedildi");
            resetForm();
            onOpenChange(false);
            onTripAdded?.();

        } catch (error) {
            console.error('Error saving trip:', error);
            toast.error("Seyahat kaydedilirken bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addActivity();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl w-full max-h-[95vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-xl font-semibold">Yeni Seyahat Ekle</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto px-1">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Başlık</Label>
                                <Input
                                    id="title"
                                    placeholder="Seyahat başlığı"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    required
                                />
                            </div>

                            {/* Date and Country */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tarih</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.date ? format(formData.date, 'dd MMMM yyyy', { locale: tr }) : 'Tarih seçin'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formData.date || undefined}
                                                onSelect={(date) => handleInputChange('date', date || null)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="country">Ülke/Şehir</Label>
                                    <Input
                                        id="country"
                                        placeholder="Konum"
                                        value={formData.country}
                                        onChange={(e) => handleInputChange('country', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Category and Budget */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Kategori</Label>
                                    <Select value={formData.category} onValueChange={(value: Category) => handleInputChange('category', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Kategori seçin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="budget">Bütçe (₺)</Label>
                                    <Input
                                        id="budget"
                                        type="number"
                                        placeholder="0"
                                        value={formData.budget}
                                        onChange={(e) => handleInputChange('budget', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Image Upload */}
                        <div className="space-y-4">
                            <Label>Fotoğraf</Label>
                            <div className="flex flex-col space-y-4">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-32 border-2 border-dashed"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={imageUploading}
                                >
                                    <div className="flex flex-col items-center space-y-2">
                                        {imageUploading ? (
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        ) : (
                                            <Upload className="h-8 w-8" />
                                        )}
                                        <span className="text-sm text-muted-foreground">
                                            {imageUploading ? 'Yükleniyor...' : 'Fotoğraf seçin'}
                                        </span>
                                    </div>
                                </Button>

                                {imagePreview && (
                                    <div className="relative">
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded-md border"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-2 right-2"
                                            onClick={() => {
                                                setImagePreview(null);
                                                handleInputChange('image_file', null);
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = '';
                                                }
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Additional Details */}
                        <div className="space-y-4">
                            {/* Accommodation and Companions */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="accommodation">Konaklama</Label>
                                    <Input
                                        id="accommodation"
                                        placeholder="Otel, Airbnb vb."
                                        value={formData.accommodation}
                                        onChange={(e) => handleInputChange('accommodation', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="companions">Beraberindekiler</Label>
                                    <Input
                                        id="companions"
                                        placeholder="Arkadaşlar, aile vb."
                                        value={formData.companions}
                                        onChange={(e) => handleInputChange('companions', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Map Location */}
                            <div className="space-y-2">
                                <Label htmlFor="map_location">Harita Konumu</Label>
                                <Input
                                    id="map_location"
                                    placeholder="Google Maps URL veya koordinat"
                                    value={formData.map_location}
                                    onChange={(e) => handleInputChange('map_location', e.target.value)}
                                />
                            </div>

                            {/* Activities */}
                            <div className="space-y-3">
                                <Label>Aktiviteler</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Aktivite ekle"
                                        value={currentActivity}
                                        onChange={(e) => setCurrentActivity(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="flex-1"
                                    />
                                    <Button type="button" onClick={addActivity} variant="outline" size="icon">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                {formData.activities.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.activities.map((activity, index) => (
                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                {activity}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-auto p-0 hover:bg-transparent ml-1"
                                                    onClick={() => removeActivity(activity)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Rating and Notes in Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Rating */}
                                <div className="space-y-3">
                                    <Label>Değerlendirme</Label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Button
                                                    key={star}
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="p-1"
                                                    onClick={() => handleRatingClick(star)}
                                                >
                                                    <Star
                                                        className={`h-5 w-5 ${star <= formData.rating
                                                            ? 'fill-primary text-primary'
                                                            : 'text-muted-foreground'
                                                            }`}
                                                    />
                                                </Button>
                                            ))}
                                        </div>
                                        {formData.rating > 0 && (
                                            <span className="text-sm text-muted-foreground">
                                                {formData.rating}/5
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <Label htmlFor="note">Notlar</Label>
                                    <Textarea
                                        id="note"
                                        placeholder="Seyahat notlarınız..."
                                        value={formData.note}
                                        onChange={(e) => handleInputChange('note', e.target.value)}
                                        rows={3}
                                        className="resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t bg-background">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                                className="order-3 sm:order-1"
                            >
                                İptal
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={resetForm}
                                disabled={loading}
                                className="order-2"
                            >
                                Temizle
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || imageUploading}
                                className="order-1 sm:order-3"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    'Kaydet'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TripModal;