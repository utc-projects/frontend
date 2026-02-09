import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    MapPin,
    Route as RouteIcon,
    Building2,
    Trash2,
    Edit,
    Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';

const RequestApprovalPage = () => {
    const [requests, setRequests] = useState([]);
    const { user, isStudent, isAdmin, isLecturer } = useAuth();
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filter State
    const [filterType, setFilterType] = useState('all');

    const navigate = useNavigate();

    // Set default tab for students
    useEffect(() => {
        if (isStudent) {
            setActiveTab('my-requests');
        } else {
            if (activeTab === 'my-requests') setActiveTab('all');
        }
    }, [isStudent]);

    // Reset to page 1 when tab or filter changes
    useEffect(() => {
        setPage(1);
    }, [activeTab, filterType]);

    useEffect(() => {
        if (user) {
            fetchRequests();
        }
    }, [activeTab, user, page, limit, filterType]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            // Basic params
            const params = {
                page,
                limit,
                status: activeTab === 'all' || activeTab === 'my-requests' ? undefined : activeTab,
            };

            // Add type filter if selected
            if (filterType !== 'all') {
                params.type = filterType;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params
            };

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            let url = `${apiUrl}/api/change-requests`;
            if (activeTab === 'my-requests' || isStudent) {
                url = `${apiUrl}/api/change-requests/my-requests`;
                // For student tab logic, we might not need status param unless we want to filter their own requests
                // But current UI only has one "my-requests" tab for students or admins viewing my-requests
                if (config.params.status === 'my-requests') delete config.params.status;
            }

            const { data } = await axios.get(url, config);

            if (data.pagination) {
                setRequests(data.requests);
                setTotalPages(data.pagination.totalPages);
                setTotalItems(data.pagination.totalItems);
            } else {
                // Fallback for non-paginated response if any
                setRequests(Array.isArray(data) ? data : []);
                setTotalPages(1);
                setTotalItems(Array.isArray(data) ? data.length : 0);
            }

        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'point': return <MapPin className="w-4 h-4 text-blue-500" />;
            case 'route': return <RouteIcon className="w-4 h-4 text-purple-500" />;
            case 'provider': return <Building2 className="w-4 h-4 text-orange-500" />;
            default: return null;
        }
    };

    const getActionBadges = (action) => {
        switch (action) {
            case 'create': return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"><Plus className="w-3 h-3" /> Thêm mới</span>;
            case 'update': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"><Edit className="w-3 h-3" /> Cập nhật</span>;
            case 'delete': return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"><Trash2 className="w-3 h-3" /> Xóa</span>;
            default: return null;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản lý Yêu cầu Phê duyệt</h1>
                    <p className="text-slate-500">Xem và xử lý các thay đổi dữ liệu từ sinh viên</p>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm cursor-pointer"
                    >
                        <option value="all">Tất cả loại</option>
                        <option value="point">Điểm du lịch</option>
                        <option value="route">Tuyến du lịch</option>
                        <option value="provider">Nhà cung cấp</option>
                    </select>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                {!isStudent && (
                    <>
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'all' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Tất cả
                            {activeTab === 'all' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'pending' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Chờ duyệt
                            {activeTab === 'pending' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('approved')}
                            className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'approved' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Đã duyệt
                            {activeTab === 'approved' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('rejected')}
                            className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'rejected' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Đã từ chối
                            {activeTab === 'rejected' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
                        </button>
                    </>
                )}
                {(!isAdmin && !isLecturer) && (
                    <button
                        onClick={() => setActiveTab('my-requests')}
                        className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'my-requests' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Yêu cầu của tôi
                        {activeTab === 'my-requests' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
                    </button>
                )}
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>
                ) : requests.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
                        <CheckCircle className="w-12 h-12 mb-3 text-slate-200" />
                        <p>Không có yêu cầu nào</p>
                    </div>
                ) : (
                    <>
                        <div className="divide-y divide-slate-100">
                            {requests.map(req => (
                                <div key={req._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                            req.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                            {req.status === 'pending' ? <Clock className="w-5 h-5" /> :
                                                req.status === 'approved' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                {getTypeIcon(req.type)}
                                                <span className="font-semibold text-slate-700 capitalize">{req.type}</span>
                                                <span className="text-slate-300">•</span>
                                                {getActionBadges(req.action)}
                                            </div>
                                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                                <span>Bởi <span className="font-medium text-slate-700">{req.requester?.name || 'Unknown'}</span></span>
                                                <span>•</span>
                                                <span>{new Date(req.createdAt).toLocaleString()}</span>
                                                {req.status !== 'pending' && req.reviewer && (
                                                    <>
                                                        <span>•</span>
                                                        <span className={req.status === 'approved' ? 'text-green-600' : 'text-red-600'}>
                                                            {req.status === 'approved' ? 'Đã duyệt bởi' : 'Đã từ chối bởi'} <span className="font-medium">{req.reviewer?.name}</span>
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            {req.reviewNote && (
                                                <p className="text-xs text-slate-500 mt-1 italic">Note: {req.reviewNote}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/admin/approvals/${req._id}`)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                        title="Xem chi tiết"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <div className="p-5 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span>Hiển thị</span>
                                <select
                                    value={limit}
                                    onChange={(e) => {
                                        setLimit(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white cursor-pointer"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span>bản ghi mỗi trang</span>
                                <span className="ml-2 text-slate-400 border-l border-slate-200 pl-3">
                                    Hiển thị {Math.min((page - 1) * limit + 1, totalItems)} - {Math.min(page * limit, totalItems)} trên tổng số {totalItems} bản ghi
                                </span>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(1)}
                                        disabled={page === 1}
                                        className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-600 transition-colors text-sm font-medium"
                                        title="Trang đầu"
                                    >
                                        «
                                    </button>
                                    <button
                                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                        disabled={page === 1}
                                        className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-600 transition-colors text-sm font-medium"
                                    >
                                        Trước
                                    </button>

                                    <div className="flex gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                                            .map((p, index, array) => {
                                                // Add ellipsis
                                                if (index > 0 && array[index - 1] !== p - 1) {
                                                    return (
                                                        <span key={`ellipsis-${p}`} className="px-2 py-1 text-slate-400">...</span>
                                                    );
                                                }
                                                return (
                                                    <button
                                                        key={p}
                                                        onClick={() => setPage(p)}
                                                        className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === p
                                                            ? 'bg-blue-500 text-white shadow-blue-500/30 shadow-sm'
                                                            : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                                            }`}
                                                    >
                                                        {p}
                                                    </button>
                                                );
                                            })}
                                    </div>

                                    <button
                                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={page === totalPages}
                                        className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-600 transition-colors text-sm font-medium"
                                    >
                                        Sau
                                    </button>
                                    <button
                                        onClick={() => setPage(totalPages)}
                                        disabled={page === totalPages}
                                        className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-600 transition-colors text-sm font-medium"
                                        title="Trang cuối"
                                    >
                                        »
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RequestApprovalPage;
