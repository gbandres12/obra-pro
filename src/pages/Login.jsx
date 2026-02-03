import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Lock, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { toast } = useToast();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(email, password);
            // AuthContext handles state update and App.jsx handles redirect
        } catch (error) {
            console.error('Login error:', error);
            toast({
                title: "Erro ao entrar",
                description: error.message || "Verifique suas credenciais.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                        <Building2 className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Engenheiro de Bolso
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 font-medium">
                        Sua central de gestão de obras
                    </p>
                </div>

                <Card className="border-none shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Bem-vindo(a) de volta</CardTitle>
                        <CardDescription className="text-center">
                            Entre com seu e-mail e senha para acessar o painel
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-orange-600 hover:bg-orange-700 h-11"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    'Entrar no Sistema'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-500">
                                        Acesso restrito
                                    </span>
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-center text-gray-500">
                                Se esqueceu sua senha ou não tem acesso, contate o administrador da sua empresa.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
