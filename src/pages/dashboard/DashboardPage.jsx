import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Map, MapPin, Waypoints, Building2, Users, Shield, X, FileText } from 'lucide-react';
import api from '../../services/api';

function DashboardPage() {
    const { user, loading, isAdmin, isLecturer, checkPermission } = useAuth();
    const [stats, setStats] = useState({ routes: 0, points: 0, providers: 0 });

    const [showWelcome, setShowWelcome] = useState(() => {
        const flag = sessionStorage.getItem('justLoggedIn');
        if (flag === 'true') {
            sessionStorage.removeItem('justLoggedIn');
            return true;
        }
        return false;
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [routesRes, pointsRes, providersRes] = await Promise.all([
                    api.get('/routes'),
                    api.get('/points'),
                    api.get('/providers'),
                ]);
                setStats({
                    routes: Array.isArray(routesRes.data) ? routesRes.data.length : 0,
                    points: pointsRes.data.pagination?.totalItems || pointsRes.data.features?.length || 0,
                    providers: providersRes.data.pagination?.totalItems || providersRes.data.features?.length || 0,
                });
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }
        };
        fetchStats();

        // Auto-hide welcome card after 5 seconds
        const timer = setTimeout(() => {
            setShowWelcome(false);
        }, 5000);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    // Only Admin and Lecturer can see management features
    const canManage = isAdmin || isLecturer;

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans">
            {/* Content */}
            <main className="max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-12">
                {/* Welcome Card */}
                {showWelcome && (
                    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 md:p-10 mb-10 shadow-xl shadow-emerald-500/20 text-white animate-in fade-in slide-in-from-top-4 duration-700 ease-out">
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                                Xin chào, {user.name}! 👋
                            </h2>
                            <p className="text-emerald-100 text-lg max-w-2xl">
                                {isAdmin && 'Trung tâm điều khiển hệ thống. Quản lý toàn bộ dữ liệu du lịch, tuyến điểm và người dùng.'}
                                {isLecturer && 'Không gian làm việc dành cho giảng viên. Quản lý nội dung học tập và bài tập sinh viên.'}
                                {!isAdmin && !isLecturer && 'Khám phá kho tàng kiến thức và tài nguyên du lịch phong phú.'}
                            </p>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/5 rounded-full blur-2xl"></div>
                        <button
                            onClick={() => setShowWelcome(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Stats Grid - Simplified */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <Waypoints className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-3xl font-extrabold text-slate-800">{stats.routes}</p>
                            <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Tuyến du lịch</p>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <MapPin className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-3xl font-extrabold text-slate-800">{stats.points}</p>
                            <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Điểm du lịch</p>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <Building2 className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-3xl font-extrabold text-slate-800">{stats.providers}</p>
                            <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Nhà cung cấp DV</p>
                        </div>
                    </div>
                </div>

                {/* Management Grid */}
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-emerald-500 rounded-full inline-block"></span>
                    Quản lý hệ thống
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {/* Map - Always visible */}
                    <Link
                        to="/map"
                        className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <Map className="w-32 h-32 text-blue-600" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                <Map className="w-7 h-7" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                Bản đồ Du lịch
                            </h4>
                            <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-grow">
                                Xem bản đồ tương tác, tra cứu tuyến điểm và nhà cung cấp dịch vụ.
                            </p>
                            <div className="flex items-center text-blue-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                                Truy cập ngay &rarr;
                            </div>
                        </div>
                    </Link>

                    {/* Management Points */}
                    {checkPermission('points', 'view') && (
                        <Link
                            to="/admin/points"
                            className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                <MapPin className="w-32 h-32 text-emerald-600" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                    <MapPin className="w-7 h-7" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">
                                    {canManage ? 'Quản lý Điểm' : 'Danh sách Điểm'}
                                </h4>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-grow">
                                    {canManage ? 'Thêm mới, chỉnh sửa và cập nhật thông tin các điểm du lịch.' : 'Xem danh sách các điểm du lịch trên hệ thống.'}
                                </p>
                                <div className="flex items-center text-emerald-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                                    {canManage ? 'Quản lý ngay' : 'Xem ngay'} &rarr;
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Management Routes */}
                    {checkPermission('routes', 'view') && (
                        <Link
                            to="/admin/routes"
                            className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-purple-400 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                <Waypoints className="w-32 h-32 text-purple-600" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                    <Waypoints className="w-7 h-7" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">
                                    {canManage ? 'Quản lý Tuyến' : 'Danh sách Tuyến'}
                                </h4>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-grow">
                                    {canManage ? 'Xây dựng lộ trình, cập nhật thông tin và điểm dừng chân của tuyến.' : 'Xem danh sách các tuyến du lịch trên hệ thống.'}
                                </p>
                                <div className="flex items-center text-purple-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                                    {canManage ? 'Quản lý ngay' : 'Xem ngay'} &rarr;
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Management Providers */}
                    {checkPermission('providers', 'view') && (
                        <Link
                            to="/admin/providers"
                            className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-orange-400 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                <Building2 className="w-32 h-32 text-orange-600" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                    <Building2 className="w-7 h-7" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">
                                    {canManage ? 'Nhà Cung cấp' : 'Danh sách Nhà cung cấp'}
                                </h4>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-grow">
                                    {canManage ? 'Quản lý danh sách khách sạn, nhà hàng và dịch vụ hỗ trợ du lịch.' : 'Xem danh sách khách sạn, nhà hàng và dịch vụ.'}
                                </p>
                                <div className="flex items-center text-orange-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                                    {canManage ? 'Quản lý ngay' : 'Xem ngay'} &rarr;
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Management Users - Admin Only */}
                    {isAdmin && (
                        <Link
                            to="/admin/users"
                            className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-rose-400 shadow-sm hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                <Users className="w-32 h-32 text-rose-600" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                    <Users className="w-7 h-7" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-rose-600 transition-colors">
                                    Quản lý Users
                                </h4>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-grow">
                                    Quản lý tài khoản người dùng, phân quyền và trạng thái hoạt động.
                                </p>
                                <div className="flex items-center text-rose-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                                    Quản lý ngay &rarr;
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Management Permissions - Admin Only */}
                    {isAdmin && (
                        <Link
                            to="/admin/permissions"
                            className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-400 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                <Shield className="w-32 h-32 text-indigo-600" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                    <Shield className="w-7 h-7" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                                    Phân quyền
                                </h4>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-grow">
                                    Cấu hình quyền truy cập chi tiết cho các vai trò trong hệ thống.
                                </p>
                                <div className="flex items-center text-indigo-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                                    Cấu hình ngay &rarr;
                                </div>
                            </div>
                        </Link>
                    )}


                    {/* Approval Management - Visible to all (different views inside) */}
                    <Link
                        to="/admin/approvals"
                        className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-yellow-400 shadow-sm hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <FileText className="w-32 h-32 text-yellow-600" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                <FileText className="w-7 h-7" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-yellow-600 transition-colors">
                                Quản lý Phê duyệt
                            </h4>
                            <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-grow">
                                {canManage ? 'Xem và phê duyệt các yêu cầu thay đổi từ sinh viên.' : 'Theo dõi trạng thái các yêu cầu thay đổi bạn đã gửi.'}
                            </p>
                            <div className="flex items-center text-yellow-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                                {canManage ? 'Xử lý ngay' : 'Xem ngay'} &rarr;
                            </div>
                        </div>
                    </Link>
                </div>






                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 mt-8">
                    <span className="w-2 h-8 bg-blue-500 rounded-full inline-block"></span>
                    Nghiệp vụ Du lịch
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {/* Estimates Module */}
                    <Link
                        to="/estimates"
                        className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-cyan-400 shadow-sm hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <FileText className="w-32 h-32 text-cyan-600" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                <FileText className="w-7 h-7" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-cyan-600 transition-colors">
                                Lập Dự Toán
                            </h4>
                            <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-grow">
                                Lập bảng dự toán chi phí, tính giá vốn và lợi nhuận.
                            </p>
                            <div className="flex items-center text-cyan-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                                Tạo mới ngay &rarr;
                            </div>
                        </div>
                    </Link>
                </div>

            </main>
        </div>
    );
}

export default DashboardPage;
