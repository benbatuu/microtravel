'use client'

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, Github, Chrome, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from "@/lib/supabaseClient";
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Toast bileşeni
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void; }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            'bg-red-100 text-red-800 border border-red-200'
            }`}>
            {type === 'success' ?
                <CheckCircle className="h-5 w-5" /> :
                <AlertCircle className="h-5 w-5" />
            }
            <span>{message}</span>
            <button
                onClick={onClose}
                className="ml-2 text-gray-500 hover:text-gray-700"
            >
                ×
            </button>
        </div>
    );
};

const LoginForm = ({ onSwitchToRegister, onLoginSuccess }: { onSwitchToRegister: () => void; onLoginSuccess: (user: User) => void; }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        // Basit validasyon
        if (!email || !password) {
            showToast('Lütfen tüm alanları doldurun', 'error');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                let errorMessage = 'Giriş yapılırken bir hata oluştu';

                if (error.message.includes('Invalid login credentials')) {
                    errorMessage = 'E-posta veya şifre yanlış';
                } else if (error.message.includes('Email not confirmed')) {
                    errorMessage = 'Lütfen e-posta adresinizi doğrulayın';
                }

                showToast(errorMessage, 'error');
            } else {
                showToast('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');

                // Kullanıcı bilgilerini localStorage'a kaydet (remember me özelliği için)
                if (rememberMe) {
                    localStorage.setItem('rememberUser', 'true');
                } else {
                    localStorage.removeItem('rememberUser');
                }

                // 1.5 saniye sonra ana sayfaya yönlendir
                setTimeout(() => {
                    onLoginSuccess(data.user);
                }, 1500);
            }
        } catch {
            showToast('Beklenmeyen bir hata oluştu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'github' | 'google') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) {
                showToast(`${provider} ile giriş yapılırken hata oluştu`, 'error');
            }
        } catch {
            showToast('Sosyal medya girişi başarısız', 'error');
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            showToast('Lütfen önce e-posta adresinizi girin', 'error');
            return;
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                showToast('Şifre sıfırlama e-postası gönderilemedi', 'error');
            } else {
                showToast('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi', 'success');
            }
        } catch {
            showToast('Beklenmeyen bir hata oluştu', 'error');
        }
    };

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Hoş Geldiniz
                    </CardTitle>
                    <CardDescription>
                        Hesabınıza giriş yapın
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-posta</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="ornek@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Şifre</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pr-10"
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    disabled={loading}
                                />
                                <Label htmlFor="remember" className="text-sm">
                                    Beni hatırla
                                </Label>
                            </div>
                            <Button
                                type="button"
                                variant="link"
                                className="p-0 h-auto text-sm"
                                onClick={handleForgotPassword}
                                disabled={loading}
                            >
                                Şifremi unuttum
                            </Button>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                        >
                            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <Separator />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="bg-white px-2 text-sm text-gray-500">veya</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => handleSocialLogin('github')}
                                disabled={loading}
                            >
                                <Github className="mr-2 h-4 w-4" />
                                GitHub
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => handleSocialLogin('google')}
                                disabled={loading}
                            >
                                <Chrome className="mr-2 h-4 w-4" />
                                Google
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <span className="text-sm text-gray-600">
                            Hesabınız yok mu?{' '}
                            <Button
                                type="button"
                                variant="link"
                                onClick={onSwitchToRegister}
                                className="p-0 h-auto font-semibold"
                                disabled={loading}
                            >
                                Kayıt olun
                            </Button>
                        </span>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

const RegisterForm = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const validateForm = () => {
        if (!name.trim()) {
            showToast('Lütfen adınızı ve soyadınızı girin', 'error');
            return false;
        }
        if (!email) {
            showToast('Lütfen e-posta adresinizi girin', 'error');
            return false;
        }
        if (password.length < 6) {
            showToast('Şifre en az 6 karakter olmalıdır', 'error');
            return false;
        }
        if (password !== confirmPassword) {
            showToast('Şifreler eşleşmiyor', 'error');
            return false;
        }
        if (!agreeTerms) {
            showToast('Kullanım şartlarını kabul etmelisiniz', 'error');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    data: {
                        full_name: name.trim(),
                        display_name: name.trim()
                    },
                }
            });

            if (error) {
                let errorMessage = 'Kayıt olurken bir hata oluştu';

                if (error.message.includes('User already registered')) {
                    errorMessage = 'Bu e-posta adresi zaten kayıtlı';
                } else if (error.message.includes('Password should be at least 6 characters')) {
                    errorMessage = 'Şifre en az 6 karakter olmalıdır';
                } else if (error.message.includes('Invalid email')) {
                    errorMessage = 'Geçersiz e-posta adresi';
                }

                showToast(errorMessage, 'error');
            } else {
                if (data?.user?.email_confirmed_at) {
                    showToast('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...', 'success');
                    setTimeout(() => {
                        onSwitchToLogin();
                    }, 2000);
                } else {
                    showToast('Kayıt başarılı! E-posta adresinizi kontrol edin ve doğrulama bağlantısına tıklayın.', 'success');
                    setTimeout(() => {
                        onSwitchToLogin();
                    }, 3000);
                }
            }
        } catch {
            showToast('Beklenmeyen bir hata oluştu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'github') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) {
                showToast(`${provider} ile kayıt olurken hata oluştu`, 'error');
            }
        } catch {
            showToast('Sosyal medya kaydı başarısız', 'error');
        }
    };

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        Hesap Oluşturun
                    </CardTitle>
                    <CardDescription>
                        Yeni hesabınızı oluşturun
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Ad Soyad</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Ad Soyad"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="register-email">E-posta</Label>
                            <Input
                                id="register-email"
                                type="email"
                                placeholder="ornek@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="register-password">Şifre</Label>
                            <div className="relative">
                                <Input
                                    id="register-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pr-10"
                                    disabled={loading}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Şifre Tekrar</Label>
                            <div className="relative">
                                <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pr-10"
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={loading}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                disabled={loading}
                                required
                            />
                            <Label htmlFor="terms" className="text-sm">
                                <span className="text-gray-600">
                                    Kullanım şartlarını ve gizlilik politikasını kabul ediyorum
                                </span>
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
                            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <Separator />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="bg-white px-2 text-sm text-gray-500">veya</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => handleSocialLogin('github')}
                                disabled={loading}
                            >
                                <Github className="mr-2 h-4 w-4" />
                                GitHub
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => handleSocialLogin('google')}
                                disabled={loading}
                            >
                                <Chrome className="mr-2 h-4 w-4" />
                                Google
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <span className="text-sm text-gray-600">
                            Zaten hesabınız var mı?{' '}
                            <Button
                                type="button"
                                variant="link"
                                onClick={onSwitchToLogin}
                                className="p-0 h-auto font-semibold"
                                disabled={loading}
                            >
                                Giriş yapın
                            </Button>
                        </span>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default function GetStarted() {
    const [currentView, setCurrentView] = useState('login');
    const [user, setUser] = useState<User | null>(null);
    const [isProcessingCallback, setIsProcessingCallback] = useState(false);
    const router = useRouter();

    // URL'deki auth callback tokenlarını kontrol et ve işle
    useEffect(() => {
        const handleAuthCallback = async () => {
            // URL'de hash parametreleri var mı kontrol et
            if (typeof window !== 'undefined' && window.location.hash) {
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');

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
                        }
                    } catch (error) {
                        console.error('Auth callback error:', error);
                    } finally {
                        setIsProcessingCallback(false);
                    }
                }
            }
        };

        handleAuthCallback();
    }, []);

    // Kullanıcı oturum durumunu kontrol et
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLoginSuccess = (userData: User) => {
        setUser(userData);
        // Burada ana sayfaya yönlendirme yapabilirsiniz
        console.log('Kullanıcı giriş yaptı:', userData);
    };

    // Eğer callback işleniyor ise loading göster
    if (isProcessingCallback) {
        return (
            <div className="py-8 flex items-center justify-center">
                <Card className="w-full max-w-md mx-auto">
                    <CardContent className="text-center py-8">
                        <div className="flex justify-center mb-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                        <p className="text-gray-600">E-posta doğrulanıyor...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Eğer kullanıcı giriş yapmışsa, başka bir component göster
    if (user) {
        router.push('/dashboard'); // Ana sayfaya yönlendir
    }

    return (
        <div className="py-8 flex items-center justify-center">
            <div className="w-full max-w-md">
                {currentView === 'login' ? (
                    <LoginForm
                        onSwitchToRegister={() => setCurrentView('register')}
                        onLoginSuccess={handleLoginSuccess}
                    />
                ) : (
                    <RegisterForm onSwitchToLogin={() => setCurrentView('login')} />
                )}
            </div>

            {/* Decorative elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
                <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>
        </div>
    );
}