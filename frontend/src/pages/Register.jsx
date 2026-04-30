import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Database, Mail, Lock, UserPlus } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { error } = await supabase.auth.signUp({
                email, password,
                options: { data: { full_name: name } }
            });
            if (error) throw error;
            navigate('/dashboard');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-8">
            <div className="max-w-sm w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-blue-600/20 rounded-2xl mb-4">
                        <Database className="h-8 w-8 text-blue-400" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold gradient-text">Create Account</h2>
                    <p className="text-gray-500 text-sm mt-2">Get started with Data AI</p>
                </div>
                <div className="glass-card rounded-2xl p-6 md:p-8">
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
                            <div className="relative">
                                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800/80 border border-gray-600/50 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-smooth placeholder-gray-500"
                                    placeholder="John Doe" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800/80 border border-gray-600/50 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-smooth placeholder-gray-500"
                                    placeholder="you@example.com" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800/80 border border-gray-600/50 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-smooth placeholder-gray-500"
                                    placeholder="••••••••" />
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl transition-smooth disabled:opacity-50 shadow-lg shadow-blue-600/20 text-sm">
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                </div>
                <p className="text-center text-gray-500 text-sm mt-6">
                    Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-smooth">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
