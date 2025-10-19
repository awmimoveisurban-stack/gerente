import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth/auth-context';
import { useNavigate } from 'react-router-dom';
import { StandardPage, StandardCard, StandardButton, StandardInput } from '@/components/ui/standard-components';
import { DESIGN_SYSTEM } from '@/design-system';
import { Building2, Eye, EyeOff, LogIn } from 'lucide-react';

// 🔐 PÁGINA DE LOGIN SIMPLES
export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // 🚀 HANDLE LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Erro no login');
      }
    } catch (error) {
      setError('Erro interno do servidor');
    }
  };

  // 📝 HANDLE INPUT CHANGE
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <StandardPage container={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <StandardCard
            title="Acesso ao Sistema"
            description="Faça login para continuar"
            icon={Building2}
            color="primary"
            className="shadow-2xl"
          >
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <StandardInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                required
                error={error.includes('email') ? error : ''}
              />

              <div className="relative">
                <StandardInput
                  label="Senha"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Sua senha"
                  required
                  error={error.includes('senha') ? error : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <StandardButton
                type="submit"
                loading={loading}
                fullWidth
                icon={LogIn}
                className="mt-6"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </StandardButton>
            </form>

            {/* 🔑 CREDENCIAIS DE TESTE */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Credenciais de Teste:
              </h4>
              <div className="space-y-2 text-xs text-gray-600">
                <div>
                  <strong>Gerente:</strong> gerente@imobiliaria.com / admin123
                </div>
                <div>
                  <strong>Corretor:</strong> corretor@imobiliaria.com / corretor123
                </div>
              </div>
            </div>
          </StandardCard>
        </motion.div>
      </div>
    </StandardPage>
  );
}

