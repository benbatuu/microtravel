"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

type Experience = {
    id?: number;
    title: string;
    date: string;
    category?: string;
    country: string;
    note?: string;
    image_url?: string;
};

type AddExperienceDialogProps = {
    open: boolean;
    onClose: () => void;
    initialData?: Experience | null;
};

export default function AddExperienceDialog({
    open,
    onClose,
    initialData,
}: AddExperienceDialogProps) {
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        country: "",
        note: "",
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

    // Formu initialData ile doldur
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                date: initialData.date || "",
                country: initialData.country || "",
                note: initialData.note || "",
            });
            setExistingImageUrl(initialData.image_url || null);
            setPreviewUrl(initialData.image_url || null);
            setImageFile(null);
        } else {
            setFormData({
                title: "",
                date: "",
                country: "",
                note: "",
            });
            setImageFile(null);
            setPreviewUrl(null);
            setExistingImageUrl(null);
        }
    }, [initialData]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        setLoading(true);

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("Kullanıcı oturumu yok.");
            setLoading(false);
            return;
        }

        let imageUrl: string | null = existingImageUrl;

        // Yeni görsel varsa yükle
        if (imageFile) {
            const fileExt = imageFile.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from("tripimages")
                .upload(fileName, imageFile);

            if (uploadError) {
                console.error("Görsel yüklenemedi:", uploadError.message);
                setLoading(false);
                return;
            }

            const {
                data: { publicUrl },
            } = supabase.storage.from("tripimages").getPublicUrl(fileName);

            imageUrl = publicUrl;
        }

        const payload = {
            title: formData.title,
            date: formData.date,
            country: formData.country,
            note: formData.note,
            user_id: user.id,
            image_url: imageUrl,
        };

        let dbError;
        if (initialData?.id) {
            // Güncelleme
            const { error } = await supabase
                .from("trips")
                .update(payload)
                .eq("id", initialData.id);
            dbError = error;
        } else {
            // Yeni kayıt
            const { error } = await supabase.from("trips").insert([payload]);
            dbError = error;
        }

        if (dbError) {
            console.error("Hata:", dbError.message);
        } else {
            onClose();
        }

        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Deneyimi Düzenle" : "Yeni Deneyim Ekle"}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Deneyim Başlığı</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="Örn: Kıbrıs Sahil Yürüyüşü"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="date">Tarih</Label>
                        <div className="relative flex items-center">
                            <Input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="pr-10"
                            />
                            <CalendarIcon className="absolute right-3 text-muted-foreground pointer-events-none w-4 h-4" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="country">Şehir / Ülke</Label>
                        <Input
                            id="country"
                            name="country"
                            placeholder="Örn: Girne, Kıbrıs"
                            value={formData.country}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="note">Deneyim Açıklaması</Label>
                        <Textarea
                            id="note"
                            name="note"
                            placeholder="Neler yaptın, ne önerirsin?"
                            value={formData.note}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="image">Fotoğraf</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        {previewUrl && (
                            <Image
                                src={previewUrl}
                                alt="Önizleme"
                                className="mt-2 rounded-md max-h-40 object-cover"
                                width={200}
                                height={200}
                            />
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        İptal
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading
                            ? "Kaydediliyor..."
                            : initialData ? "Güncelle" : "Kaydet"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
