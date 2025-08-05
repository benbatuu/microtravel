// app/auth/callback/page.tsx veya pages/auth/callback.tsx
'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Next.js 13+ için, Next.js 12 ve altı için 'next/router'
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function AuthCallback() {
    const router = useRouter();
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    const [message, setMessage] = useState('Giriş işlemi gerçekleştiriliyor...');

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // URL'den hash parametrelerini al
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');
                const type = hashParams.get('type'); // 'signup' veya 'recovery' vs.

                if (accessToken && refreshToken) {
                    // Supabase session'ını manuel olarak ayarla
                    const { data, error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    });

                    if (error) {
                        console.error('Session ayarlama hatası:', error);
                        setStatus('error');
                        setMessage('Giriş işlemi sırasında bir hata oluştu.');

                        // 3 saniye sonra login sayfasına yönlendir
                        setTimeout(() => {
                            router.push('/getstarted'); // veya ana sayfa
                        }, 3000);
                        return;
                    }

                    if (data.user) {
                        // Kullanıcı bilgilerini localStorage'a kaydet (opsiyonel)
                        localStorage.setItem('user', JSON.stringify(data.user));

                        setStatus('success');

                        if (type === 'signup') {
                            setMessage('E-posta doğrulama başarılı! Dashboard\'a yönlendiriliyorsunuz...');
                        } else if (type === 'recovery') {
                            setMessage('Şifre sıfırlama başarılı! Dashboard\'a yönlendiriliyorsunuz...');
                        } else {
                            setMessage('Giriş başarılı! Dashboard\'a yönlendiriliyorsunuz...');
                        }

                        // 2 saniye sonra dashboard'a yönlendir
                        setTimeout(() => {
                            router.push('/dashboard'); // Dashboard sayfanızın yolu
                        }, 2000);
                    }
                } else {
                    // Token bulunamazsa normal auth flow'u dene
                    const { data, error } = await supabase.auth.getSession();

                    if (error || !data.session) {
                        setStatus('error');
                        setMessage('Geçersiz doğrulama bağlantısı.');

                        setTimeout(() => {
                            router.push('/getstarted');
                        }, 3000);
                        return;
                    }

                    if (data.session.user) {
                        setStatus('success');
                        setMessage('Giriş başarılı! Dashboard\'a yönlendiriliyorsunuz...');

                        setTimeout(() => {
                            router.push('/dashboard');
                        }, 2000);
                    }
                }
            } catch (error) {
                console.error('Auth callback error:', error);
                setStatus('error');
                setMessage('Beklenmeyen bir hata oluştu.');

                setTimeout(() => {
                    router.push('/getstarted');
                }, 3000);
            }
        };

        // Sadece client-side'da çalıştır
        if (typeof window !== 'undefined') {
            handleAuthCallback();
        }
    }, [router]);

    const getIcon = () => {
        switch (status) {
            case 'loading':
                return <Loader2 className="h-8 w-8 animate-spin text-blue-600" />;
            case 'success':
                return <CheckCircle className="h-8 w-8 text-green-600" />;
            case 'error':
                return <AlertCircle className="h-8 w-8 text-red-600" />;
            default:
                return <Loader2 className="h-8 w-8 animate-spin text-blue-600" />;
        }
    };

    const getBackgroundColor = () => {
        switch (status) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" >
            <Card className={`w-full max-w-md ${getBackgroundColor()}`}>
                <CardHeader className="text-center" >
                    <div className="flex justify-center mb-4" >
                        {getIcon()}
                    </div>
                    < CardTitle className="text-2xl font-bold text-gray-900" >
                        {status === 'loading' && 'İşlem Gerçekleştiriliyor'
                        }
                        {status === 'success' && 'Başarılı!'}
                        {status === 'error' && 'Hata Oluştu'}
                    </CardTitle>
                </CardHeader>
                < CardContent className="text-center" >
                    <p className="text-gray-600 mb-4" >
                        {message}
                    </p>
                    {
                        status === 'loading' && (
                            <div className="flex justify-center" >
                                <div className="animate-pulse flex space-x-1" >
                                    <div className="rounded-full bg-blue-400 h-2 w-2" > </div>
                                    < div className="rounded-full bg-blue-400 h-2 w-2" > </div>
                                    < div className="rounded-full bg-blue-400 h-2 w-2" > </div>
                                </div>
                            </div>
                        )
                    }
                </CardContent>
            </Card>

            {/* Decorative background */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10" >
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" > </div>
                < div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}> </div>
            </div>
        </div>
    );
}