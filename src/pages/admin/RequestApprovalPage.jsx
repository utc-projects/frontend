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
    const { user, isStudent } = useAuth();
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Set default tab for students
    useEffect(() => {
        if (isStudent) {
            setActiveTab('my-requests');
        } else {
            if (activeTab === 'my-requests') setActiveTab('all');
        }
    }, [isStudent]);

    useEffect(() => {
        if (user) {
            fetchRequests();
        }
    }, [activeTab, user]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            let url = `${apiUrl}/api/change-requests`;
            if (activeTab === 'my-requests' || isStudent) {
                url = `${apiUrl}/api/change-requests/my-requests`;
            }

            const { data } = await axios.get(url, config);

            // Client-side filtering for tabs (if admin)
            if (activeTab === 'all') {
                setRequests(data);
            } else if (activeTab === 'pending') {
                setRequests(data.filter(r => r.status === 'pending'));
            } else if (activeTab === 'history') {
                setRequests(data.filter(r => r.status !== 'pending'));
            } else {
                setRequests(data);
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
            <button
                onClick={() => navigate('/dashboard')}
                className="group flex items-center text-slate-500 hover:text-blue-600 transition-colors mb-2 font-medium"
            >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Quay lại Dashboard
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản lý Yêu cầu Phê duyệt</h1>
                    <p className="text-slate-500">Xem và xử lý các thay đổi dữ liệu từ sinh viên</p>
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
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Lịch sử duyệt
                            {activeTab === 'history' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
                        </button>
                    </>
                )}
                <button
                    onClick={() => setActiveTab('my-requests')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'my-requests' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Yêu cầu của tôi
                    {activeTab === 'my-requests' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
                </button>
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
                )}
            </div>
        </div>
    );
};

export default RequestApprovalPage;
