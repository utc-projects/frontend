import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Globe, LogOut, User, Key, ChevronDown, Settings, X, Loader2, Edit2 } from 'lucide-react';
import api from '../services/api';
import NotificationBell from './NotificationBell';

const MainLayout = ({ children }) => {
    const { user, logout, loadUser } = useAuth();

    // Dropdown & Modal State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Edit Profile Form State
    const [profileData, setProfileData] = useState({
        name: '',
        studentId: '',
        department: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Close dropdown when complying outside
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Initialize profile form data when modal opens
    useEffect(() => {
        if (isEditProfileOpen && user) {
            setProfileData({
                name: user.name || '',
                studentId: user.studentId || '',
                department: user.department || '',
            });
            setError('');
        }
    }, [isEditProfileOpen, user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            setError('');
            await api.put('/auth/profile', profileData);
            await loadUser(); // Reload user context
            setIsEditProfileOpen(false);
            setIsSaving(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Cập nhật thất bại');
            setIsSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="bg-gradient-to-tr from-emerald-500 to-teal-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800">Hệ thống Quản lý Du lịch</h1>
                                <p className="text-xs text-slate-500 font-medium">Dashboard Overview</p>
                            </div>
                        </Link>
                    </div>

                    {/* User Dropdown */}
                    <div className="flex items-center gap-4">
                        <NotificationBell />

                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-sm">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left hidden md:block">
                                    <p className="text-slate-800 font-bold text-sm leading-tight">{user.name}</p>
                                    <p className="text-xs text-slate-500 font-medium">{user.roleLabel}</p>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                    <div className="p-3 border-b border-slate-100 bg-slate-50">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tài khoản</p>
                                        <p className="text-sm font-medium text-slate-800 truncate">{user.email}</p>
                                    </div>
                                    <div className="p-1">
                                        <button
                                            onClick={() => {
                                                setIsEditProfileOpen(true);
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                        >
                                            <User className="w-4 h-4" />
                                            Thông tin cá nhân
                                        </button>
                                        <Link
                                            to="/admin/change-password"
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            <Key className="w-4 h-4" />
                                            Đổi mật khẩu
                                        </Link>
                                    </div>
                                    <div className="p-1 border-t border-slate-100">
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {children}
            </main>

            {/* Edit Profile Modal */}
            {isEditProfileOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-emerald-500" />
                                Thông tin cá nhân
                            </h2>
                            <button
                                onClick={() => setIsEditProfileOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Email <span className="text-xs text-slate-400 font-normal">(Không thể thay đổi)</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                                        placeholder="Nhập họ và tên"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            Vai trò
                                        </label>
                                        <input
                                            type="text"
                                            value={user.roleLabel}
                                            disabled
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            Mã số (nếu có)
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.studentId}
                                            onChange={(e) => setProfileData({ ...profileData, studentId: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                                            placeholder="MSV / MSGV"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Khoa / Bộ môn
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.department}
                                        onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                                        placeholder="Nhập tên Khoa hoặc Bộ môn"
                                    />
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditProfileOpen(false)}
                                        className="flex-1 px-4 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-all"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Đang lưu...
                                            </>
                                        ) : (
                                            <>
                                                <Edit2 className="w-5 h-5" />
                                                Cập nhật
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainLayout;
