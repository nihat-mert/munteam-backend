import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const registerSchema = z
  .object({
    email: z.string().email('Geçerli bir e-posta adresi girin'),
    password: z
      .string()
      .min(8, 'Şifre en az 8 karakter olmalı')
      .regex(/[a-z]/, 'En az bir küçük harf içermeli')
      .regex(/[A-Z]/, 'En az bir büyük harf içermeli')
      .regex(/\d/, 'En az bir rakam içermeli'),
    confirmPassword: z.string(),
    adSoyad: z.string().min(2, 'Ad Soyad en az 2 karakter olmalı'),
    unvan: z.string().optional(),
    telefon: z.string().regex(/^[0-9]{11}$/, 'Telefon numarası 11 haneli olmalı'),
    kurumTipi: z.enum(['BIREYSEL', 'KURUMSAL']),
    tcKimlik: z.string().regex(/^[0-9]{11}$/, 'T.C. Kimlik No 11 haneli olmalı').optional(),
    vergiNo: z.string().optional(),
    faturaAdresi: z.string().optional(),
    iletisimAdresi: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      kurumTipi: 'BIREYSEL',
    },
  });

  const kurumTipi = watch('kurumTipi');

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    setPasswordStrength(strength);
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      toast.success('Kayıt başarılı! Dashboard\'a yönlendiriliyorsunuz...');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Kayıt Ol</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">E-posta *</label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
                placeholder="E-posta adresiniz"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Şifre *</label>
              <input
                type="password"
                {...register('password', { onChange: (e) => calculatePasswordStrength(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
                placeholder="Şifreniz"
              />
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
              <div className="mt-2">
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      passwordStrength <= 1
                        ? 'bg-red-500'
                        : passwordStrength <= 2
                        ? 'bg-orange-500'
                        : passwordStrength <= 3
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  En az 8 karakter, 1 büyük harf, 1 küçük harf ve 1 rakam
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Şifre Tekrar *</label>
              <input
                type="password"
                {...register('confirmPassword')}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
                placeholder="Şifrenizi tekrar girin"
              />
              {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ad Soyad / Firma Adı *</label>
              <input
                type="text"
                {...register('adSoyad')}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
                placeholder="Adınız veya firmanız"
              />
              {errors.adSoyad && <p className="text-red-400 text-sm mt-1">{errors.adSoyad.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Unvan</label>
              <input
                type="text"
                {...register('unvan')}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
                placeholder="Unvanınız"
              />
              {errors.unvan && <p className="text-red-400 text-sm mt-1">{errors.unvan.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mobil Telefon *</label>
              <input
                type="tel"
                {...register('telefon')}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
                placeholder="05XXXXXXXXX"
              />
              {errors.telefon && <p className="text-red-400 text-sm mt-1">{errors.telefon.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Kurum Tipi *</label>
              <select
                {...register('kurumTipi')}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
              >
                <option value="BIREYSEL">Bireysel</option>
                <option value="KURUMSAL">Kurumsal</option>
              </select>
              {errors.kurumTipi && <p className="text-red-400 text-sm mt-1">{errors.kurumTipi.message}</p>}
            </div>

            {kurumTipi === 'BIREYSEL' && (
              <div>
                <label className="block text-sm font-medium mb-2">T.C. Kimlik No</label>
                <input
                  type="text"
                  {...register('tcKimlik')}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
                  placeholder="11 haneli T.C. Kimlik No"
                  maxLength={11}
                />
                {errors.tcKimlik && <p className="text-red-400 text-sm mt-1">{errors.tcKimlik.message}</p>}
              </div>
            )}

            {kurumTipi === 'KURUMSAL' && (
              <div>
                <label className="block text-sm font-medium mb-2">Vergi No</label>
                <input
                  type="text"
                  {...register('vergiNo')}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
                  placeholder="Vergi numaranız"
                />
                {errors.vergiNo && <p className="text-red-400 text-sm mt-1">{errors.vergiNo.message}</p>}
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Fatura Adresi</label>
              <textarea
                {...register('faturaAdresi')}
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
                placeholder="Fatura adresiniz"
              />
              {errors.faturaAdresi && <p className="text-red-400 text-sm mt-1">{errors.faturaAdresi.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">İletişim Adresi</label>
              <textarea
                {...register('iletisimAdresi')}
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
                placeholder="İletişim adresiniz"
              />
              {errors.iletisimAdresi && <p className="text-red-400 text-sm mt-1">{errors.iletisimAdresi.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>

          <p className="text-center text-slate-400">
            Zaten hesabınız var mı?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-accent-500 hover:text-accent-400 font-semibold"
            >
              Giriş Yap
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};
