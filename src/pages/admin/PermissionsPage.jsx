import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Save, Shield, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const RESOURCES = {
    points: 'Điểm tham quan',
    routes: 'Tuyến du lịch',
    providers: 'Nhà cung cấp',
    users: 'Người dùng'
};

const ACTIONS = {
    view: 'Xem',
    create: 'Thêm',
    edit: 'Sửa',
    delete: 'Xóa'
};

const ROLES = {
    lecturer: 'Giảng viên',
    student: 'Sinh viên'
};

const PermissionsPage = () => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/permissions');
            setPermissions(response.data.data);
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
            setMessage({ type: 'error', text: 'Không thể tải dữ liệu phân quyền' });
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionChange = (role, resource, action, checked) => {
        setPermissions(prev => prev.map(p => {
            if (p.role === role) {
                return {
                    ...p,
                    resources: {
                        ...p.resources,
                        [resource]: {
                            ...p.resources[resource],
                            [action]: checked
                        }
                    }
                };
            }
            return p;
        }));
    };

    const handleSave = async (role) => {
        const rolePermissions = permissions.find(p => p.role === role);
        if (!rolePermissions) return;

        try {
            setSaving(true);
            await api.put(`/permissions/${role}`, {
                resources: rolePermissions.resources
            });
            setMessage({ type: 'success', text: `Đã cập nhật quyền cho ${ROLES[role]}` });

            // Clear message after 3s
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Failed to save permissions:', error);
            setMessage({ type: 'error', text: 'Lỗi khi lưu thay đổi' });
        } finally {
            setSaving(false);
        }
    };

    if (!isAdmin) {
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
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2 flex items-center gap-3">
                            <Shield className="w-8 h-8 text-blue-600" />
                            Phân quyền hệ thống
                        </h1>
                        <p className="text-slate-500 text-lg">
                            Quản lý quyền truy cập chi tiết cho Giảng viên và Sinh viên
                        </p>
                    </div>
                </div>

                {message && (
                    <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                        {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {message.text}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {loading ? (
                    <div className="col-span-2 text-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-4 text-slate-500">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    ['lecturer', 'student'].map(role => {
                        const roleData = permissions.find(p => p.role === role);
                        if (!roleData) return null;

                        return (
                            <div key={role} className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-full">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-slate-800">{ROLES[role]}</h2>
                                    <button
                                        onClick={() => handleSave(role)}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save className="w-4 h-4" />
                                        Lưu thay đổi
                                    </button>
                                </div>

                                <div className="p-6 flex-1">
                                    <div className="space-y-8">
                                        {Object.entries(RESOURCES).map(([resKey, resLabel]) => (
                                            <div key={resKey}>
                                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                    {resLabel}
                                                </h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    {Object.entries(ACTIONS).map(([actKey, actLabel]) => {
                                                        const isDisabled = actKey === 'delete' || resKey === 'users';
                                                        return (
                                                            <label
                                                                key={actKey}
                                                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${isDisabled
                                                                    ? 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-60'
                                                                    : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer'
                                                                    }`}
                                                            >
                                                                <div className="relative flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={roleData.resources[resKey]?.[actKey] || false}
                                                                        onChange={(e) => handlePermissionChange(role, resKey, actKey, e.target.checked)}
                                                                        disabled={isDisabled}
                                                                        className={`peer h-5 w-5 appearance-none rounded-md border transition-all ${isDisabled
                                                                            ? 'border-slate-200 bg-slate-100 cursor-not-allowed checked:bg-slate-300 checked:border-slate-300'
                                                                            : 'cursor-pointer border-slate-300 checked:border-blue-500 checked:bg-blue-500'
                                                                            }`}
                                                                    />
                                                                    <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                                                        <Check className="w-3.5 h-3.5" />
                                                                    </div>
                                                                </div>
                                                                <span className={`text-sm font-medium ${isDisabled ? 'text-slate-400' : 'text-slate-600 group-hover:text-blue-700'
                                                                    }`}>
                                                                    {actLabel}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default PermissionsPage;
