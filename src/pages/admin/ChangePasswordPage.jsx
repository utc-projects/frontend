import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { ArrowLeft, Lock, Save, Loader2, Link } from 'lucide-react';

function ChangePasswordPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user types
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmNewPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        if (formData.currentPassword === formData.newPassword) {
            setError('Mật khẩu mới không được trùng với mật khẩu hiện tại');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await api.put('/auth/update-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            setSuccess('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');

            setSuccess('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');

            // Logout shortly after
            setTimeout(() => {
                logout();
            }, 500);

        } catch (err) {
            setError(err.response?.data?.message || 'Đổi mật khẩu thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
            <div className="max-w-xl mx-auto">

                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-4 bg-gradient-to-r from-slate-50 to-white">
                        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold text-slate-800">Đổi mật khẩu</h1>
                            <p className="text-slate-500 text-sm">Cập nhật mật khẩu để bảo vệ tài khoản</p>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Mật khẩu hiện tại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400"
                                    placeholder="Nhập mật khẩu hiện tại"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Mật khẩu mới <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400"
                                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="confirmNewPassword"
                                    value={formData.confirmNewPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400"
                                    placeholder="Nhập lại mật khẩu mới"
                                    required
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || success}
                                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Lưu thay đổi
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChangePasswordPage;
