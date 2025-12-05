import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn, User } from 'lucide-react';

interface LoginProps {
    onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Por favor, preencha todos os campos.');
            return;
        }

        // Get users from localStorage
        const usersJSON = localStorage.getItem('erp_users');
        const users = usersJSON ? JSON.parse(usersJSON) : [];

        // Check if user exists and password matches
        const user = users.find((u: any) => u.username === username && u.password === password);

        if (user) {
            // Store current session
            localStorage.setItem('erp_current_user', JSON.stringify({ username: user.username, name: user.name, role: user.role }));
            onLogin(user.username);
        } else {
            setError('Usuário ou senha incorretos.');
        }
    };

    // Create default admin user if no users exist
    useEffect(() => {
        const usersJSON = localStorage.getItem('erp_users');
        if (!usersJSON) {
            const defaultAdmin = {
                id: 1,
                username: 'admin',
                password: 'admin123',
                name: 'Administrador',
                role: 'admin'
            };
            localStorage.setItem('erp_users', JSON.stringify([defaultAdmin]));
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-500 rounded-2xl mb-4 shadow-2xl">
                        <User size={40} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Léo Ótica</h1>
                    <p className="text-slate-300">Sistema de Gestão ERP & CRM</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Área de Login</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Usuário
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-slate-800 transition-all"
                                    placeholder="Digite seu usuário"
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-slate-800 transition-all"
                                    placeholder="Digite sua senha"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2 active:scale-95 transform"
                        >
                            <LogIn size={20} />
                            Entrar no Sistema
                        </button>
                    </form>

                    {/* Info */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-800 text-center">
                            <strong>Primeiro acesso?</strong><br />
                            Usuário: <code className="bg-blue-100 px-2 py-1 rounded">admin</code> |
                            Senha: <code className="bg-blue-100 px-2 py-1 rounded">admin123</code>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-400 text-sm mt-6">
                    © 2024 Léo Ótica. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
};
