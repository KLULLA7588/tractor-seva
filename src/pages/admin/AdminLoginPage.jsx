import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tractor, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api-client';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.post('/auth/login', { email, password });
      login(result.token);
      toast.success('Welcome back!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-navy-dark px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white shadow-lg">
            <Tractor className="h-9 w-9 text-brand-red" />
          </div>
          <h1 className="mt-3 font-oswald text-2xl font-bold text-white">Tractor Seva</h1>
          <p className="text-sm text-white/50">Admin Panel</p>
        </div>

        <div className="rounded-lg border border-border-subtle bg-white p-8 shadow-panel">
          <h2 className="font-oswald text-xl font-semibold text-brand-navy">Sign In</h2>
          <p className="mt-1 text-sm text-text-gray">Enter your credentials to access the admin panel</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-navy">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-gray" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="h-10 w-full rounded-md border border-border-subtle bg-white pl-10 pr-3 text-sm text-text-black placeholder:text-text-gray/60 focus:outline-none focus:shadow-input-focus focus:border-brand-navy"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-navy">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-gray" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-10 w-full rounded-md border border-border-subtle bg-white pl-10 pr-3 text-sm text-text-black placeholder:text-text-gray/60 focus:outline-none focus:shadow-input-focus focus:border-brand-navy"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-b from-[#1B2870] to-[#172263] py-2.5 text-sm font-semibold text-white shadow-button transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:shadow-none disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
