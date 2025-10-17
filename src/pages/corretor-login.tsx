import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';
import { User, Lock, Building2, ArrowLeft, Mail } from 'lucide-react';

export function CorretorLogin() {
  const [loginNome, setLoginNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login, loading } = useUnifiedAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Usar o novo sistema de autenticação seguro
    const result = await login({
      email: email.trim(),
      password: senha.trim(),
    });

    if (!result.success) {
      toast({
        title: '❌ Erro no Login',
        description: result.error || 'Credenciais inválidas',
        variant: 'destructive',
      });
    }
    // O redirecionamento é automático no novo sistema
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Acesso Corretor
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Digite seu nome de usuário, email e senha para acessar o sistema
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="login_nome" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome de Usuário
                </Label>
                <Input
                  id="login_nome"
                  type="text"
                  value={loginNome}
                  onChange={(e) => setLoginNome(e.target.value)}
                  placeholder="Ex: joao.silva"
                  className="h-12 text-lg"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  Nome de usuário fornecido pelo gerente
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="h-12 text-lg"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  Email fornecido pelo gerente
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Senha
                </Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  className="h-12 text-lg"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  Senha definida pelo gerente
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  'Acessar Sistema'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                💡 <strong>Dica:</strong> Use as credenciais completas (nome de usuário, email e senha) fornecidas pelo gerente. Se você é um gerente, use o login principal.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
