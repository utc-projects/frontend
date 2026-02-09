import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
    CheckCircle,
    XCircle,
    Clock,
    MapPin,
    Route as RouteIcon,
    Building2,
    ArrowLeft,
    Plus,
    Trash2,
    Edit,
    User,
    Calendar,
    FileText,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Fix Leaflet's default icon path issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const RequestApprovalDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin, isLecturer } = useAuth();

    // State
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewNote, setReviewNote] = useState('');
    const [pointsMap, setPointsMap] = useState({});

    // Fetch request when user is available and id changes
    useEffect(() => {
        if (user) {
            fetchRequest();
        }
    }, [id, user]);

    // Fetch points if the request is for a route
    useEffect(() => {
        if (request && request.type === 'route') {
            fetchPoints();
        }
    }, [request]);

    const fetchPoints = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_URL}/api/points`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const map = {};
            // Handle GeoJSON
            if (data.features && Array.isArray(data.features)) {
                data.features.forEach(f => {
                    if (f.properties && f.properties._id) {
                        map[f.properties._id] = f.properties.name;
                    }
                });
            } else if (Array.isArray(data)) {
                data.forEach(p => map[p._id] = p.name);
            }
            setPointsMap(map);
        } catch (error) {
            console.error('Error fetching points:', error);
        }
    };

    const fetchRequest = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Fetch single request directly
            const url = `${API_URL}/api/change-requests/${id}`;

            const { data } = await axios.get(url, config);

            // Access control check (optional, backend should handle it but good for UI)
            if (user.role === 'student' && data.requester?._id !== user._id && data.requester !== user._id) {
                // If backend doesn't filter, we might want to warn or redirect, 
                // but let's assume if backend returned it, it's okay or backend will handle 403
            }

            setRequest(data);

            if (data && data.reviewNote) setReviewNote(data.reviewNote);

        } catch (error) {
            console.error('Error fetching request:', error);
            // setRequest(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (status) => {
        const actionText = status === 'approve' ? 'phê duyệt' : 'từ chối';

        // Validation: Review note is required
        if (!reviewNote || reviewNote.trim() === '') {
            alert(`Vui lòng nhập ghi chú xử lý trước khi ${actionText} yêu cầu!`);
            return;
        }

        if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} yêu cầu này?`)) return;

        try {
            const token = localStorage.getItem('token');
            const endpoint = status === 'approve' ? 'approve' : 'reject';

            await axios.put(`${API_URL}/api/change-requests/${id}/${endpoint}`,
                { note: reviewNote },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert(`Đã ${actionText} thành công!`);
            navigate('/admin/approvals');
        } catch (error) {
            alert(`Lỗi ${actionText}: ` + (error.response?.data?.message || error.message));
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'point': return <MapPin className="w-5 h-5 text-blue-500" />;
            case 'route': return <RouteIcon className="w-5 h-5 text-purple-500" />;
            case 'provider': return <Building2 className="w-5 h-5 text-orange-500" />;
            default: return null;
        }
    };

    const getActionBadges = (action) => {
        switch (action) {
            case 'create': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Plus className="w-3 h-3" /> Thêm mới</span>;
            case 'update': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Edit className="w-3 h-3" /> Cập nhật</span>;
            case 'delete': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Trash2 className="w-3 h-3" /> Xóa</span>;
            default: return null;
        }
    };

    // --- Media Renderer ---
    const renderMedia = (images, videos) => (
        <div className="space-y-4 mb-6">
            {images && images.length > 0 && (
                <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Hình ảnh ({images.length})</p>
                    <div className="grid grid-cols-4 gap-2">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                                <img src={`${API_URL}/${img}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Preview" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {videos && videos.length > 0 && (
                <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Video ({videos.length})</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {videos.map((vid, idx) => (
                            <div key={idx} className="h-24 w-40 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs shadow-sm">Video {idx + 1}</div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );


    // --- Map Renderer ---
    const renderMap = (location) => {
        if (!location) return null;

        let coords;
        try {
            const loc = typeof location === 'string' ? JSON.parse(location) : location;
            // Handle GeoJSON format { type: 'Point', coordinates: [lng, lat] }
            if (loc.coordinates && Array.isArray(loc.coordinates)) {
                // Leaflet uses [lat, lng], GeoJSON uses [lng, lat]
                coords = [loc.coordinates[1], loc.coordinates[0]];
            }
        } catch (e) {
            console.error('Error parsing location:', e);
            return null;
        }

        if (!coords || isNaN(coords[0]) || isNaN(coords[1])) return null;

        return (
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 mb-2 block flex items-center justify-between">
                    <span>Vị trí trên bản đồ</span>
                    <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        {coords[0].toFixed(6)}, {coords[1].toFixed(6)}
                    </span>
                </label>
                <div className="h-64 rounded-xl overflow-hidden border-2 border-slate-200 relative z-0">
                    <MapContainer
                        center={coords}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={false} // Disable scroll zoom for better page scroll UX
                        dragging={false} // Maybe allow dragging? usually read-only maps might allow dragging but not changing marker. Let's allow dragging to explore surroundings.
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />
                        <Marker position={coords}></Marker>
                    </MapContainer>
                </div>
            </div>
        );
    };

    // --- Content Renderers ---
    const renderPointContent = (d) => (
        <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Tên địa điểm</label>
                        <p className="text-slate-900 font-bold text-xl mt-1">{d.name}</p>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Danh mục</label>
                        <div><span className="inline-block mt-1 px-3 py-1 bg-white border border-purple-200 text-purple-700 text-sm font-bold rounded-lg shadow-sm">{d.category}</span></div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Vai trò</label>
                        <p className="text-slate-700 font-medium mt-1">{d.role}</p>
                    </div>
                </div>
            </div>

            {d.location && renderMap(d.location)}

            <div>
                <label className="text-sm font-bold text-slate-800 mb-2 block">Mô tả</label>
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{d.description}</p>
                </div>
            </div>

            {d.highlights && (
                <div>
                    <label className="text-sm font-bold text-slate-800 mb-2 block">Điểm nổi bật</label>
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-slate-700 text-sm leading-relaxed">{d.highlights}</p>
                    </div>
                </div>
            )}

            {renderMedia(d.images, d.videos)}
        </div>
    );

    const renderProviderContent = (d) => {
        let contact = {};
        try { contact = typeof d.contact === 'string' ? JSON.parse(d.contact) : d.contact; } catch (e) { }

        return (
            <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100 flex justify-between items-start">
                    <div>
                        <label className="text-xs text-orange-400 font-bold uppercase tracking-wider mb-1 block">Nhà cung cấp</label>
                        <p className="text-slate-900 font-bold text-2xl">{d.name}</p>
                    </div>
                    <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-white text-orange-700 text-xs font-bold rounded-lg shadow-sm border border-orange-100 mb-1">{d.serviceType}</span>
                        {d.subType && <div className="text-xs text-slate-500 font-medium">({d.subType})</div>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Giá tham khảo</label>
                        <p className="font-bold text-emerald-600 text-lg mt-1">{d.priceRange}</p>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Khu vực</label>
                        <p className="text-slate-800 font-medium mt-1">{d.serviceArea}</p>
                    </div>
                </div>

                {d.location && renderMap(d.location)}

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-3 block">Thông tin liên hệ</label>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex flex-col">
                            <span className="text-slate-400 text-xs">Điện thoại</span>
                            <span className="font-medium text-slate-700">{contact.phone || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-400 text-xs">Website</span>
                            <a href={contact.website} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline truncate">{contact.website || 'N/A'}</a>
                        </div>
                        <div className="col-span-2 flex flex-col pt-2 border-t border-slate-200">
                            <span className="text-slate-400 text-xs">Địa chỉ</span>
                            <span className="font-medium text-slate-700">{d.address}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-bold text-slate-800 mb-2 block">Mô tả dịch vụ</label>
                    <div className="p-4 bg-white rounded-xl border border-slate-200">
                        <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{d.description}</p>
                    </div>
                </div>

                {renderMedia(d.images, d.videos)}
            </div>
        );
    };

    const renderRouteContent = (d) => (
        <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Tên tuyến du lịch</label>
                <p className="text-slate-900 font-bold text-2xl mt-1">{d.routeName}</p>

                <div className="flex gap-4 mt-4">
                    <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 flex items-center gap-2 shadow-sm">
                        <Clock className="w-4 h-4 text-blue-500" /> {d.duration}
                    </div>
                    {d.totalDistance && (
                        <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 flex items-center gap-2 shadow-sm">
                            <RouteIcon className="w-4 h-4 text-emerald-500" /> {d.totalDistance} km
                        </div>
                    )}
                </div>
            </div>

            <div>
                <label className="text-sm font-bold text-slate-800 mb-2 block">Mô tả hành trình</label>
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{d.description}</p>
                </div>
            </div>

            {d.points && d.points.length > 0 && (
                <div>
                    <label className="text-sm font-bold text-slate-800 mb-3 block flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Điểm tham quan ({d.points.length})
                    </label>
                    <div className="space-y-2">
                        {d.points.map((p, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg hover:border-slate-300 transition-colors shadow-sm">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                    {i + 1}
                                </div>
                                <span className="text-sm font-medium text-slate-700">
                                    {typeof p === 'object' ? p.name : (pointsMap[p] || p)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Đang tải chi tiết...</div>;
    if (!request) return <div className="min-h-screen flex items-center justify-center text-slate-500">Không tìm thấy yêu cầu.</div>;

    const { data, type, action } = request;

    return (
        <div className="min-h-screen bg-slate-50/50 p-6">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/admin/approvals')}
                    className="group flex items-center text-slate-500 hover:text-blue-600 transition-colors font-medium mb-6"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Quay lại danh sách
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200">
                                        {getTypeIcon(type)}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 capitalize">{type} Details</h2>
                                        <p className="text-xs text-slate-500">Nội dung thay đổi</p>
                                    </div>
                                </div>
                                {getActionBadges(action)}
                            </div>
                            <div className="p-8">
                                {type === 'point' && renderPointContent(data)}
                                {type === 'provider' && renderProviderContent(data)}
                                {type === 'route' && renderRouteContent(data)}
                            </div>

                            {/* Actions in Main Content (Mobile/Tablet friendly fallback) */}
                            {(isAdmin || isLecturer) && request.status === 'pending' && (
                                <div className="p-8 border-t border-slate-100 bg-slate-50">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">Phê duyệt yêu cầu</h3>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleAction('reject')}
                                            className="flex-1 py-3 bg-white border border-rose-200 text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition-all shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <XCircle className="w-5 h-5" /> Từ chối
                                        </button>
                                        <button
                                            onClick={() => handleAction('approve')}
                                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-5 h-5" /> Phê duyệt
                                        </button>
                                    </div>
                                    <textarea
                                        className="w-full mt-4 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm bg-white"
                                        rows="2"
                                        placeholder="Ghi chú xử lý (bắt buộc)..."
                                        value={reviewNote}
                                        onChange={e => setReviewNote(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden sticky top-6">
                            <div className={`p-6 text-center ${request.status === 'pending' ? 'bg-amber-50' :
                                request.status === 'approved' ? 'bg-emerald-50' : 'bg-rose-50'
                                }`}>
                                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 shadow-sm ${request.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                    request.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                    }`}>
                                    {request.status === 'pending' ? <Clock className="w-8 h-8" /> :
                                        request.status === 'approved' ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                                </div>
                                <h3 className={`text-xl font-bold capitalize ${request.status === 'pending' ? 'text-amber-700' :
                                    request.status === 'approved' ? 'text-emerald-700' : 'text-rose-700'
                                    }`}>
                                    {request.status === 'pending' ? 'Đang Chờ Duyệt' : request.status === 'approved' ? 'Đã Chấp Thuận' : 'Đã Từ Chối'}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Trạng thái hiện tại của yêu cầu</p>
                            </div>

                            <div className="p-6 border-t border-slate-100 space-y-4">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span>Tạo bởi: <span className="font-semibold text-slate-900">{request.requester?.name || 'Unknown'}</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span>Ngày tạo: {new Date(request.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    <span>Loại yêu cầu: <span className="capitalize font-medium">{action} {type}</span></span>
                                </div>
                                {request.status !== 'pending' && request.reviewer && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <User className={`w-4 h-4 ${request.status === 'approved' ? 'text-green-500' : 'text-red-500'}`} />
                                        <span>
                                            {request.status === 'approved' ? 'Duyệt bởi: ' : 'Từ chối bởi: '}
                                            <span className="font-semibold text-slate-900">{request.reviewer?.name || 'Unknown'}</span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Action Form for Reviewers */}
                            {(isAdmin || isLecturer) && request.status === 'pending' && (
                                <div className="p-6 bg-slate-50 border-t border-slate-200">
                                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <Edit className="w-4 h-4" /> Xử lý yêu cầu
                                    </h4>

                                    <textarea
                                        className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm bg-white mb-4"
                                        rows="4"
                                        placeholder="Nhập ghi chú xử lý (bắt buộc)..."
                                        value={reviewNote}
                                        onChange={e => setReviewNote(e.target.value)}
                                        required
                                    ></textarea>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleAction('reject')}
                                            className="px-4 py-3 bg-white border border-rose-200 text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition-all shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <XCircle className="w-4 h-4" /> Từ chối
                                        </button>
                                        <button
                                            onClick={() => handleAction('approve')}
                                            className="px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Phê duyệt
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Read-only Feedback View */}
                            {(request.status !== 'pending' && request.reviewNote) && (
                                <div className="p-6 border-t border-slate-100 bg-amber-50/50">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Ghi chú xử lý ({request.status})
                                    </label>
                                    <div className="p-3 bg-white border border-amber-100 rounded-lg text-sm text-slate-700 italic">
                                        "{request.reviewNote}"
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestApprovalDetailPage;
