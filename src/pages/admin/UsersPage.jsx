import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

import {
    Users, ArrowLeft, Plus, Search, Edit2, Trash2, X,
    Shield, GraduationCap, BookOpen, CheckCircle, XCircle, Loader2
} from 'lucide-react';

function UsersPage() {
    const navigate = useNavigate();
    const { user: currentUser, checkPermission, isAdmin } = useAuth();
    const canView = checkPermission('users', 'view');
    const canCreate = checkPermission('users', 'create');
    const canEdit = checkPermission('users', 'edit');
    const canDelete = checkPermission('users', 'delete');

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterClass, setFilterClass] = useState('all');
    const [classes, setClasses] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        department: 'Khoa Du lịch',
        studentId: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchUsers()]);
        setLoading(false);
    };



    const fetchUsers = async () => {
        try {
            // setLoading(true); // Handled in fetchData
            const response = await api.get('/auth/users');
            // Filter out current user
            const filteredUsers = response.data.users.filter(
                u => u._id !== currentUser._id
            );
            setUsers(filteredUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            // setLoading(false);
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                confirmPassword: '',
                role: user.role || 'student',
                department: user.department || 'Khoa Du lịch',
                studentId: user.studentId || '',
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                role: 'student',
                department: 'Khoa Du lịch',
                studentId: '',
            });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingUser(null);
    };

    const handleSave = async () => {
        // Validate password confirmation for new users
        if (!editingUser && formData.password !== formData.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp');
            return;
        }
        try {
            setSaving(true);
            if (editingUser) {
                // Update user - no password field in edit mode
                const updateData = {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    department: formData.department,

                    studentId: formData.studentId,
                };
                await api.put(`/auth/users/${editingUser._id}`, updateData);
            } else {
                // Create user
                const { confirmPassword, ...createData } = formData;
                await api.post('/auth/users', createData);
            }
            handleCloseModal();
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (userId) => {
        try {
            await api.delete(`/auth/users/${userId}`);
            setDeleteConfirm(null);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleToggleActive = async (userId) => {
        try {
            await api.put(`/auth/users/${userId}/toggle-active`);
            fetchUsers();
        } catch (error) {
            console.error('Error toggling user status:', error);
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                        <Shield className="w-3 h-3" />
                        Quản trị viên
                    </span>
                );
            case 'lecturer':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                        <BookOpen className="w-3 h-3" />
                        Giảng viên
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <GraduationCap className="w-3 h-3" />
                        Sinh viên
                    </span>
                );
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && user.isActive) ||
            (filterStatus === 'inactive' && !user.isActive);


        return matchesSearch && matchesRole && matchesStatus;
    });

    if (!canView) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-700">Truy cập bị từ chối</h2>
                    <p className="text-slate-500 mt-2">Bạn không có quyền truy cập trang này.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                    >
                        Về Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="group flex items-center text-slate-500 hover:text-emerald-600 transition-colors mb-6 font-medium"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Quay lại Dashboard
                </button>

                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2 flex items-center gap-3">
                            <span className="p-2 bg-gradient-to-tr from-rose-500 to-pink-500 rounded-xl text-white shadow-lg shadow-rose-500/20">
                                <Users className="w-6 h-6" />
                            </span>
                            Quản lý Users
                        </h1>
                        <p className="text-slate-500 text-lg ml-1">Quản lý tài khoản và phân quyền người dùng ({filteredUsers.length})</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên hoặc email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none w-full md:w-64"
                            />
                        </div>

                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none"
                        >
                            <option value="all">Tất cả vai trò</option>
                            <option value="admin">Quản trị viên</option>
                            <option value="lecturer">Giảng viên</option>
                            <option value="student">Sinh viên</option>
                        </select>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Vô hiệu hóa</option>
                        </select>



                        {canCreate && (
                            <button
                                onClick={() => handleOpenModal()}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-500/20 transition-all whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm User
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Users List */}
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                {
                    loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-20">
                            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">Không tìm thấy người dùng nào</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-5 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Thông tin người dùng</th>
                                        <th className="p-5 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Vai trò</th>

                                        <th className="p-5 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                        <th className="p-5 text-right text-xs font-extrabold text-slate-500 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="p-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${user.role === 'admin' ? 'bg-rose-100 text-rose-600' :
                                                        user.role === 'lecturer' ? 'bg-blue-100 text-blue-600' :
                                                            'bg-emerald-100 text-emerald-600'
                                                        }`}>
                                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-base mb-0.5">{user.name}</div>
                                                        <div className="text-sm text-slate-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex flex-col gap-1">
                                                    <div>{getRoleBadge(user.role)}</div>
                                                    {user.department && (
                                                        <span className="text-xs text-slate-400 font-medium ml-1">{user.department}</span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-5">
                                                {user.isActive ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Hoạt động
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Vô hiệu hóa
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {canEdit && (
                                                        <>
                                                            <button
                                                                onClick={() => handleToggleActive(user._id)}
                                                                className={`p-2 rounded-lg transition-colors ${user.isActive
                                                                    ? 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'
                                                                    : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                                    }`}
                                                                title={user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                                            >
                                                                {user.isActive ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenModal(user)}
                                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <Edit2 className="w-5 h-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => setDeleteConfirm(user)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan="4" className="p-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                                        <Users className="w-8 h-8" />
                                                    </div>
                                                    <p className="text-lg font-medium text-slate-500">Không tìm thấy người dùng nào</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )
                }
            </div>

            {/* Add/Edit Modal */}
            {
                modalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-5 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-800">
                                    {editingUser ? 'Chỉnh sửa User' : 'Thêm User mới'}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Họ tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none"
                                        placeholder="Nhập họ tên"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none"
                                        placeholder="example@email.com"
                                    />
                                </div>
                                {/* Password fields - only show for new users */}
                                {!editingUser && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                                Mật khẩu <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none"
                                                placeholder="Nhập mật khẩu"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                                Xác nhận mật khẩu <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                className={`w-full px-4 py-3 bg-white border rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-300' : 'border-slate-200'}`}
                                                placeholder="Nhập lại mật khẩu"
                                            />
                                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                                <p className="text-red-500 text-xs mt-1">Mật khẩu không khớp</p>
                                            )}
                                        </div>
                                    </>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            Vai trò
                                        </label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none"
                                        >
                                            <option value="student">Sinh viên</option>
                                            <option value="lecturer">Giảng viên</option>
                                            <option value="admin">Quản trị viên</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            Khoa/Bộ môn
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none"
                                            placeholder="Khoa Du lịch"
                                        />
                                    </div>
                                </div>
                                {formData.role === 'student' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            Mã sinh viên
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.studentId}
                                            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none"
                                            placeholder="VD: 2024001234"
                                        />
                                    </div>
                                )}


                            </div>
                            <div className="flex gap-3 p-5 border-t border-slate-100">
                                <button
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !formData.name || !formData.email || (!editingUser && (!formData.password || formData.password !== formData.confirmPassword))}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingUser ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {
                deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Xác nhận xóa</h3>
                            <p className="text-slate-500 mb-6">
                                Bạn có chắc chắn muốn xóa người dùng <strong>{deleteConfirm.name}</strong>?
                                Hành động này không thể hoàn tác.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm._id)}
                                    className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default UsersPage;
