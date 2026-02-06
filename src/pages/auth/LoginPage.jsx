import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Map, Mail, Lock, User, GraduationCap, Crown } from 'lucide-react';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-cyan-500 to-emerald-500 rounded-3xl shadow-lg shadow-cyan-500/20 mb-4 transform rotate-3 hover:rotate-6 transition-transform">
                        <Map className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                        Quản lý Du lịch
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Đăng nhập để tiếp tục khám phá</p>
                </div>

                {/* Login Form */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-3xl p-8 transform transition-all">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                <span className="block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                                    placeholder="email@tourism.edu.vn"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Đang xử lý...
                                </>
                            ) : (
                                'Đăng nhập ngay'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm font-medium">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="text-cyan-600 hover:text-cyan-700 font-bold hover:underline">
                                Đăng ký miễn phí
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Demo Accounts */}
                <div className="mt-8">
                    <p className="text-xs text-slate-400 text-center mb-4 uppercase tracking-widest font-semibold">Tài khoản trải nghiệm</p>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setEmail('admin@tourism.edu.vn');
                                setPassword('admin123');
                            }}
                            className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:border-purple-300 hover:bg-purple-50 transition-all group"
                        >
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Crown className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-semibold text-slate-600 group-hover:text-purple-700">Admin</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setEmail('giangvien@tourism.edu.vn');
                                setPassword('lecturer123');
                            }}
                            className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:border-cyan-300 hover:bg-cyan-50 transition-all group"
                        >
                            <div className="p-2 bg-cyan-100 text-cyan-600 rounded-xl group-hover:scale-110 transition-transform">
                                <User className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-semibold text-slate-600 group-hover:text-cyan-700">Giảng viên</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setEmail('sinhvien1@tourism.edu.vn');
                                setPassword('student123');
                            }}
                            className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
                        >
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-semibold text-slate-600 group-hover:text-emerald-700">Sinh viên</span>
                        </button>
                    </div>
                </div>

                {/* Back to home */}
                <div className="text-center mt-8">
                    <Link to="/" className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors">
                        ← Quay lại trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
