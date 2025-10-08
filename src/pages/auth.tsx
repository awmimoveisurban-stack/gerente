import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Building2, 
  Mail, 
  Lock, 
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Zap,
  Star,
  Key,
  UserCheck,
  AlertTriangle,
  Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useUserRoles } from "@/hooks/use-user-roles";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const { hasRole, loading: rolesLoading } = useUserRoles();
  
  // Estados - TODOS os hooks devem estar no topo
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "", 
    password: ""
  });

  // Handler para login - useCallback para otimização
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await signIn(formData.email, formData.password);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao URBAN CRM!",
      });
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Credenciais inválidas. Verifique seu email e senha.",
        variant: "destructive"
      });
    } finally {
    setIsLoading(false);
    }
  }, [formData, signIn, toast]);

  // Handler para atualizar dados do formulário
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !rolesLoading) {
      if (hasRole('gerente')) {
        navigate("/gerente");
      } else if (hasRole('corretor')) {
        navigate("/corretor");
      } else {
        navigate("/login");
      }
    }
  }, [user, hasRole, rolesLoading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
            <Building2 className="h-12 w-12 text-white" />
          </div>
          <div className="ml-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              URBAN CRM
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Sistema de Gestão Imobiliária
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <Shield className="h-3 w-3 mr-1" />
                Seguro
              </Badge>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <UserCheck className="h-3 w-3 mr-1" />
                Controlado
              </Badge>
            </div>
          </div>
        </div>

        {/* Alerta de Acesso Controlado */}
        <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Acesso Controlado:</strong> Apenas usuários autorizados podem acessar o sistema.
          </AlertDescription>
        </Alert>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full w-fit mb-4">
              <Key className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Acesso ao Sistema
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Faça login com suas credenciais autorizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700"
                    required
                    disabled={isLoading}
                  />
          </div>
        </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700"
                    required
              disabled={isLoading}
                  />
            <Button
                    type="button"
                    variant="ghost"
              size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
            </Button>
          </div>
        </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    Entrar no Sistema
                  </div>
                )}
              </Button>
            </form>
              </CardContent>
          
          <CardFooter className="flex flex-col space-y-3">
            <div className="w-full border-t border-gray-200 dark:border-gray-700 pt-4">
                <Button 
                variant="link" 
                className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => {
                  toast({
                    title: "Funcionalidade em Desenvolvimento",
                    description: "Recuperação de senha será implementada em breve.",
                  });
                }}
              >
                Esqueci minha senha
                </Button>
            </div>
            
            <div className="flex items-center justify-center gap-4 pt-2">
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Seguro
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Rápido
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Confiável
              </Badge>
            </div>
              </CardFooter>
            </Card>

        {/* Informações de Segurança */}
        <Card className="mt-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    Acesso Controlado
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Apenas usuários autorizados podem acessar o sistema.
                  </p>
                </div>
                  </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                          <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    Convite Necessário
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Corretores são criados apenas via convite do gerente.
                  </p>
                </div>
              </div>
                </div>
              </CardContent>
            </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 URBAN CRM. Sistema de Gestão Imobiliária Seguro.
          </p>
        </div>
      </div>
    </div>
  );
}