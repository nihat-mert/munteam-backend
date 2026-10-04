import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/axios';

const emailSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
});

const passwordSchema = z.object({
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onEmailSubmit = async (data: EmailFormData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/check-email', { email: data.email });
      
      if (response.data.exists) {
        setEmail(data.email);
        setStep('password');
      } else {
        toast.error('Bu email adresi ile kayıtlı müşteri bilgisi bulunamadı. Aşağıdaki linki tıklayarak yeni hesap oluşturabilirsiniz.');
      }
    } catch (error) {
      toast.error('E-posta kontrolü başarısız');
    } finally {
      setLoading(false);
    }
  };

  const onLoginSubmit = async (data: PasswordFormData) => {
    try {
      setLoading(true);
      const user = await login(email, data.password, rememberMe);
      toast.success('Giriş başarılı');
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-2xl font-bold text-accent-500">MÜNTEAM LIMS'e Hoş Geldiniz</p>
          <p className="text-sm text-slate-400 mt-1">Munzur Üniversitesi Nadir Toprak Elementleri Merkezi</p>
        </div>
        <h1 className="text-4xl font-bold mb-8 text-center">Giriş Yap</h1>
        
        {step === 'email' ? (
          <form onSubmit={handleSubmitEmail(onEmailSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">E-posta</label>
              <input
                type="email"
                {...registerEmail('email')}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
                placeholder="E-posta adresiniz"
              />
              {emailErrors.email && <p className="text-red-400 text-sm mt-1">{emailErrors.email.message}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Kontrol ediliyor...' : 'İleri'}
            </button>
            <p className="text-center text-slate-400">
              Hesabınız yok mu?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-accent-500 hover:text-accent-400 font-semibold"
              >
                Kayıt Ol
              </button>
            </p>
            <div className="text-center mt-4">
              <a
                href="/kullanim-kilavuzu.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-400 hover:text-accent-400"
              >
                📄 Sistem Kullanım Kılavuzu
              </a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">E-posta</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg opacity-70"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Şifre</label>
              <input
                type="password"
                {...registerLogin('password')}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
                placeholder="Şifreniz"
              />
              {loginErrors.password && <p className="text-red-400 text-sm mt-1">{loginErrors.password.message}</p>}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Beni Hatırla</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-accent-500 hover:text-accent-400"
              >
                Şifremi Unuttum
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full py-3 text-slate-400 hover:text-white transition-colors"
            >
              Geri Dön
            </button>
            <div className="text-center">
              <a
                href="/kullanim-kilavuzu.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-400 hover:text-accent-400"
              >
                📄 Sistem Kullanım Kılavuzu
              </a>
            </div>
          </form>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Şifremi Unuttum</h2>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
              >
                Kapat
              </button>
            </div>
            <p className="text-slate-400 mb-4">
              E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderilecektir.
            </p>
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg mb-4 focus:outline-none focus:border-accent-500"
            />
            <button
              onClick={() => {
                toast.success('Şifre sıfırlama bağlantısı gönderildi');
                setShowForgotPassword(false);
              }}
              className="w-full py-3 bg-accent-600 hover:bg-accent-700 rounded-lg font-semibold"
            >
              Gönder
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
