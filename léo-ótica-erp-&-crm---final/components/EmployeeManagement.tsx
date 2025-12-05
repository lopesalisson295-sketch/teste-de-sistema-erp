import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Shield, User } from 'lucide-react';

interface Employee {
    id: number;
    username: string;
    password: string;
    name: string;
    role: 'admin' | 'employee';
}

export const EmployeeManagement: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>(() => {
        const stored = localStorage.getItem('erp_users');
        return stored ? JSON.parse(stored) : [];
    });

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        role: 'employee' as 'admin' | 'employee'
    });

    const saveEmployees = (newEmployees: Employee[]) => {
        setEmployees(newEmployees);
        localStorage.setItem('erp_users', JSON.stringify(newEmployees));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.username || !formData.password || !formData.name) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        // Check for duplicate username
        if (employees.some(emp => emp.username === formData.username)) {
            alert('Este nome de usuário já existe.');
            return;
        }

        const newEmployee: Employee = {
            id: Date.now(),
            ...formData
        };

        saveEmployees([...employees, newEmployee]);
        setFormData({ username: '', password: '', name: '', role: 'employee' });
        setShowForm(false);
        alert(`✅ Funcionário ${formData.name} cadastrado com sucesso!`);
    };

    const handleDelete = (id: number, name: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o funcionário "${name}"?`)) {
            saveEmployees(employees.filter(emp => emp.id !== id));
            alert(`Funcionário ${name} removido.`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Gestão de Funcionários</h2>
                    <p className="text-slate-500">Cadastre e gerencie usuários do sistema</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                    <Plus size={20} />
                    Novo Funcionário
                </button>
            </div>

            {/* Add Employee Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Cadastrar Novo Funcionário</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Nome Completo *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="Ex: João Silva"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Nome de Usuário *
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="Ex: joao.silva"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Senha *
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="Digite uma senha"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Tipo de Acesso *
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'employee' })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
                            >
                                <option value="employee">Funcionário</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>

                        <div className="col-span-full flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors cursor-pointer"
                            >
                                Cadastrar Funcionário
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Employees Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-blue-50 text-slate-600 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4 text-left">Nome</th>
                            <th className="px-6 py-4 text-left">Usuário</th>
                            <th className="px-6 py-4 text-center">Tipo de Acesso</th>
                            <th className="px-6 py-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {employees.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    <Users className="mx-auto mb-3 text-slate-300" size={48} />
                                    <p className="text-lg font-medium">Nenhum funcionário cadastrado</p>
                                    <p className="text-sm">Clique em "Novo Funcionário" para começar</p>
                                </td>
                            </tr>
                        ) : (
                            employees.map(emp => (
                                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                                <User size={20} className="text-teal-600" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-800">{emp.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <code className="bg-slate-100 px-2 py-1 rounded text-sm">{emp.username}</code>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {emp.role === 'admin' ? (
                                            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                <Shield size={14} />
                                                Administrador
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                <User size={14} />
                                                Funcionário
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(emp.id, emp.name)}
                                                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                title="Remover Funcionário"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>💡 Dica:</strong> O usuário administrador padrão é <code className="bg-blue-100 px-2 py-1 rounded">admin</code> com senha <code className="bg-blue-100 px-2 py-1 rounded">admin123</code>. Recomendamos alterá-la após o primeiro acesso.
                </p>
            </div>
        </div>
    );
};
