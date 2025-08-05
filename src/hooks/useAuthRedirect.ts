// hooks/useAuthRedirect.ts
'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Next.js 13+ için
import { supabase } from '@/lib/supabaseClient';

export function useAuthRedirect() {
    const router = useRouter();
    const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessingCallback, setIsProcessingCallback] = useState(false);

    useEffect(() => {
        const handleAuthCallback = async () => {
            // URL'de hash parametreleri var mı kontrol et
            if (typeof window !== 'undefined' && window.location.hash) {
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');
                const type = hashParams.get('type');

                if (accessToken && refreshToken) {
                    setIsProcessingCallback(true);

                    try {
                        // Supabase session'ını manuel olarak ayarla
                        const { data, error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken
                        });

                        if (error) {
                            console.error('Session ayarlama hatası:', error);
                        } else if (data.user) {
                            setUser(data.user);

                            // URL'deki hash'i temizle
                            window.history.replaceState(null, '', window.location.pathname);

                            // Kullanıcıyı dashboard'a yönlendir
                            if (type === 'signup') {
                                // Toast mesajı göstermek için state kullanabilirsiniz
                                console.log('E-posta doğrulama başarılı!');
                            }

                            // Dashboard'a yönlendir
                            setTimeout(() => {
                                router.push('/dashboard');
                            }, 1000);
                        }
                    } catch (error) {
                        console.error('Auth callback error:', error);
                    } finally {
                        setIsProcessingCallback(false);
                    }
                }
            }
        };

        const initializeAuth = async () => {
            try {
                // İlk olarak callback'i kontrol et
                await handleAuthCallback();

                // Mevcut session'ı kontrol et
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);

                // Auth state değişikliklerini dinle
                const { data: { subscription } } = supabase.auth.onAuthStateChange(
                    async (event, session) => {
                        setUser(session?.user ?? null);

                        // Kullanıcı çıkış yaptıysa login sayfasına yönlendir
                        if (event === 'SIGNED_OUT') {
                            router.push('/getstarted');
                        }

                        // Kullanıcı giriş yaptıysa ve şu an auth sayfasındaysa dashboard'a yönlendir
                        if (event === 'SIGNED_IN' && session?.user) {
                            const currentPath = window.location.pathname;
                            if (currentPath.includes('/auth/') || currentPath === '/') {
                                router.push('/dashboard');
                            }
                        }
                    }
                );

                return () => subscription.unsubscribe();
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, [router]);

    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Logout error:', error);
            } else {
                // localStorage'ı temizle
                localStorage.removeItem('user');
                localStorage.removeItem('rememberUser');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return {
        user,
        loading,
        isProcessingCallback,
        logout,
        isAuthenticated: !!user
    };
}

// Dashboard ve diğer korumalı sayfalar için hook
export function useRequireAuth() {
    const router = useRouter();
    const { user, loading } = useAuthRedirect();

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    return { user, loading };
}