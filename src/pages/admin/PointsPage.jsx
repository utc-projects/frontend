import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { ArrowLeft, Plus, MapPin, Edit, Trash2, Search, Filter, X, Save, AlertCircle, Image as ImageIcon, Video } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

const PointsPage = () => {
    const navigate = useNavigate();
    const { checkPermission } = useAuth();
    const canEdit = checkPermission('points', 'edit');
    const canCreate = checkPermission('points', 'create');
    const canDelete = checkPermission('points', 'delete');
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPoint, setEditingPoint] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // File states
    const [newImages, setNewImages] = useState([]);
    const [newVideos, setNewVideos] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [previewVideos, setPreviewVideos] = useState([]);

    // Initial form state
    const [formData, setFormData] = useState({
        name: '',
        category: 'Di tích lịch sử',
        description: '',
        coordinates: '', // stored as string "lon, lat" for backend compat if needed, or handle conversion
        role: 'Điểm tham quan chính',
        status: 'active',
        highlights: ''
    });

    const categories = [
        'Tự nhiên',
        'Văn hóa',
        'Lịch sử',
        'Tâm linh',
        'Sinh thái'
    ];

    useEffect(() => {
        fetchPoints();
    }, []);

    const fetchPoints = async () => {
        try {
            setLoading(true);
            const response = await api.get('/points');
            // Parse GeoJSON to flat array
            const parsedPoints = response.data.features.map(feature => ({
                _id: feature.properties._id,
                name: feature.properties.name,
                coordinates: feature.geometry.coordinates, // [lon, lat]
                category: feature.properties.category,
                role: feature.properties.role,
                routeCount: feature.properties.routeCount,
                images: feature.properties.images,
                videos: feature.properties.videos,
                highlights: feature.properties.highlights,
                description: feature.properties.description,
                status: feature.properties.status
            }));
            setPoints(parsedPoints);
        } catch (err) {
            console.error('Failed to fetch points:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOpenModal = (point = null) => {
        if (point) {
            setEditingPoint(point);
            setFormData({
                name: point.name,
                category: point.category,
                description: point.description || '',
                coordinates: point.coordinates.join(', '), // Display as string
                role: point.role,
                status: point.status || 'active',
                highlights: point.highlights || '',
                existingImages: point.images || [],
                existingVideos: point.videos || []
            });
            // Reset new files
            setNewImages([]);
            setNewVideos([]);
            setPreviewImages([]);
            setPreviewVideos([]);
        } else {
            setEditingPoint(null);
            setFormData({
                name: '',
                category: 'Tự nhiên', // Valid matching default
                description: '',
                coordinates: '105.85, 21.02', // Default to ~Hanoi center
                role: 'Điểm tham quan chính',
                status: 'active',
                highlights: '',
                existingImages: [],
                existingVideos: []
            });
            setNewImages([]);
            setNewVideos([]);
            setPreviewImages([]);
            setPreviewVideos([]);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingPoint(null);
    };

    const handleFileChange = (e, type) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (type === 'image') {
            // Validate limits
            if (newImages.length + files.length > 5) {
                alert('Tối đa 5 ảnh!');
                return;
            }

            // Validate size (1MB = 1024 * 1024 bytes)
            const oversized = files.filter(f => f.size > 1024 * 1024);
            if (oversized.length > 0) {
                alert(`Có ${oversized.length} ảnh vượt quá kích thước cho phép (1MB). Vui lòng chọn ảnh nhỏ hơn.`);
                return;
            }

            setNewImages(prev => [...prev, ...files]);

            // Create previews
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewImages(prev => [...prev, ...newPreviews]);
        } else {
            // Validate limits
            if (newVideos.length + files.length > 3) {
                alert('Tối đa 3 video!');
                return;
            }

            // Validate size (2MB = 2 * 1024 * 1024 bytes)
            const oversized = files.filter(f => f.size > 2 * 1024 * 1024);
            if (oversized.length > 0) {
                alert(`Có ${oversized.length} video vượt quá kích thước cho phép (2MB). Vui lòng chọn video nhỏ hơn.`);
                return;
            }

            setNewVideos(prev => [...prev, ...files]);
            // Create previews
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewVideos(prev => [...prev, ...newPreviews]);
        }
    };

    const removeNewFile = (index, type) => {
        if (type === 'image') {
            setNewImages(prev => prev.filter((_, i) => i !== index));
            setPreviewImages(prev => {
                // Revoke old url to avoid memory leak
                URL.revokeObjectURL(prev[index]);
                return prev.filter((_, i) => i !== index);
            });
        } else {
            setNewVideos(prev => prev.filter((_, i) => i !== index));
            setPreviewVideos(prev => {
                URL.revokeObjectURL(prev[index]);
                return prev.filter((_, i) => i !== index);
            });
        }
    };

    const removeExistingFile = (index, type) => {
        if (type === 'image') {
            setFormData(prev => ({
                ...prev,
                existingImages: prev.existingImages.filter((_, i) => i !== index)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                existingVideos: prev.existingVideos.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert coordinates string "105.xxx, 21.xxx" back to array [lng, lat]
            const [lng, lat] = formData.coordinates.split(',').map(num => parseFloat(num.trim()));

            const data = new FormData();
            data.append('name', formData.name);
            data.append('category', formData.category);
            data.append('description', formData.description);
            data.append('highlights', formData.highlights);
            data.append('role', formData.role);
            data.append('location', JSON.stringify({ type: 'Point', coordinates: [lng, lat] }));

            // Append new files
            newImages.forEach(file => data.append('images', file));
            newVideos.forEach(file => data.append('videos', file));

            // Append existing files (if any) to keep them
            if (formData.existingImages) {
                if (formData.existingImages.length === 0) {
                    // Append empty string to signal "clear all" (backend filters this but sees the field)
                    data.append('existingImages', '');
                } else {
                    formData.existingImages.forEach(path => data.append('existingImages', path));
                }
            }
            if (formData.existingVideos) {
                if (formData.existingVideos.length === 0) {
                    data.append('existingVideos', '');
                } else {
                    formData.existingVideos.forEach(path => data.append('existingVideos', path));
                }
            }

            // Note: Since we use FormData, we don't send JSON payload directly but FormData object
            // Use specialized API call or let axios handle it (it does automatically if data is FormData)
            // But our 'api' wrapper might stringify? 
            // Standard axios handles it. Let's verify 'api' wrapper. 
            // Assuming 'api' is an axios instance.

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            let res;
            if (editingPoint) {
                res = await api.put(`/points/${editingPoint._id}`, data, config);
            } else {
                res = await api.post('/points', data, config);
            }

            if (res.data.status === 'pending_approval') {
                alert('Yêu cầu của bạn đã được gửi và đang chờ phê duyệt.');
            } else {
                alert('Lưu thành công!');
            }

            handleCloseModal();
            fetchPoints();
        } catch (err) {
            console.error('Failed to save point:', err);
            alert('Có lỗi xảy ra khi lưu điểm du lịch');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa điểm du lịch này?')) {
            try {
                await api.delete(`/points/${id}`);
                fetchPoints();
            } catch (err) {
                console.error(err);
                // Check if backend returned route information
                if (err.response?.data?.routes) {
                    const routeNames = err.response.data.routes.join(', ');
                    alert(`Không thể xóa điểm du lịch này!\n\nĐiểm đang được sử dụng trong các tuyến:\n• ${err.response.data.routes.join('\n• ')}`);
                } else {
                    alert(err.response?.data?.message || 'Không thể xóa điểm du lịch');
                }
            }
        }
    };


    // Sub-component to handle map clicks
    const LocationMarker = () => {
        const [position, setPosition] = useState(null);

        // Parse current formData coordinates for initial position
        useEffect(() => {
            if (formData.coordinates) {
                const [lng, lat] = formData.coordinates.split(',').map(n => parseFloat(n.trim()));
                if (!isNaN(lng) && !isNaN(lat)) {
                    setPosition([lat, lng]); // Leaflet uses [lat, lng]
                }
            }
        }, []);

        const map = useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                // Update parent form data - store as "lng, lat" matches GeoJSON order
                setFormData(prev => ({
                    ...prev,
                    coordinates: `${lng.toFixed(6)}, ${lat.toFixed(6)}`
                }));
            },
        });

        // Fly to location if editing
        useEffect(() => {
            if (position) {
                map.flyTo(position, map.getZoom());
            }
        }, [position, map]);

        return position === null ? null : (
            <Marker position={position}></Marker>
        );
    };

    // Helper to get [lat, lng] for Map center from formData string
    const getMapCenter = () => {
        if (formData.coordinates) {
            const [lng, lat] = formData.coordinates.split(',').map(n => parseFloat(n.trim()));
            if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
        }
        return [21.0285, 105.8542]; // Default: Hanoi
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-2">
                            Quản lý Điểm Du lịch
                        </h1>
                        <p className="text-slate-500 text-lg">
                            Quản lý các địa danh, di tích và điểm tham quan trong hệ thống
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Search by name */}
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Tìm theo tên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-48"
                            />
                        </div>

                        {/* Filter by category */}
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        >
                            <option value="">Tất cả loại</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        {canCreate && (
                            <button
                                onClick={() => handleOpenModal()}
                                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-0.5 font-semibold"
                            >
                                <Plus className="w-5 h-5" />
                                Thêm địa điểm mới
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-5 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Thông tin địa điểm</th>
                                <th className="p-5 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Phân loại</th>
                                <th className="p-5 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Vị trí</th>
                                <th className="p-5 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider">Kết nối</th>
                                <th className="p-5 text-right text-xs font-extrabold text-slate-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {points
                                .filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .filter(p => !filterCategory || p.category === filterCategory)
                                .map((point) => (
                                    <tr key={point._id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-5">
                                            <div className="font-bold text-slate-800 text-lg mb-1">{point.name}</div>
                                            <div className="flex items-center text-sm text-slate-500">
                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium border border-slate-200">
                                                    {point.role}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${point.category === 'Tự nhiên' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                point.category === 'Văn hóa' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    point.category === 'Lịch sử' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                        'bg-blue-50 text-blue-700 border-blue-100'
                                                }`}>
                                                {point.category}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center text-slate-500 text-sm font-mono bg-slate-50/50 px-2 py-1 rounded w-fit">
                                                <MapPin className="w-3 h-3 mr-1.5 opacity-50" />
                                                {point.coordinates.map(c => c.toFixed(4)).join(', ')}
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold border border-indigo-100">
                                                {point.routeCount || 0}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {canEdit && (
                                                    <button
                                                        onClick={() => handleOpenModal(point)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDelete(point._id)}
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
                            {points.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                                <Search className="w-8 h-8" />
                                            </div>
                                            <p className="text-lg font-medium text-slate-500">Chưa có dữ liệu điểm du lịch</p>
                                            <p className="text-sm">Bắt đầu bằng cách thêm địa điểm mới</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-800">
                                    {editingPoint ? 'Cập nhật điểm du lịch' : 'Thêm điểm du lịch mới'}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Điền thông tin chi tiết về địa điểm</p>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Tên điểm *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                                        placeholder="Ví dụ: Hồ Hoàn Kiếm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Loại hình</label>
                                    <div className="relative">
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none bg-white"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        <Filter className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                                    <span>Vị trí trên bản đồ *</span>
                                    <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                        Click bản đồ để chọn
                                    </span>
                                </label>
                                <div className="h-64 rounded-xl overflow-hidden border-2 border-slate-200 relative z-0 hover:border-emerald-400 transition-colors group">
                                    <MapContainer
                                        center={getMapCenter()}
                                        zoom={13}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; OpenStreetMap contributors'
                                        />
                                        <LocationMarker />
                                    </MapContainer>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                                    Tọa độ: {formData.coordinates || 'Chưa chọn'}
                                </div>
                            </div>

                            {/* Images and Videos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Images */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                                        <span>Hình ảnh (Tối đa 5)</span>
                                        <span className="text-xs font-normal text-slate-400">
                                            {formData.existingImages.length + newImages.length}/5
                                        </span>
                                    </label>

                                    {/* Existing Images */}
                                    {formData.existingImages.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {formData.existingImages.map((img, idx) => (
                                                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 group">
                                                    <img src={`${API_URL}/${img}`} alt="" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-opacity">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExistingFile(idx, 'image')}
                                                            className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600 border border-white"
                                                            title="Xóa ảnh này"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Upload Area */}
                                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 hover:border-emerald-500 transition-colors bg-slate-50/50">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'image')}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload" className="flex flex-col items-center cursor-pointer">
                                            <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                                            <span className="text-xs text-slate-500 font-medium">Chọn ảnh (Max 1MB)</span>
                                        </label>
                                    </div>

                                    {/* New Previews */}
                                    {previewImages.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {previewImages.map((src, idx) => (
                                                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-emerald-200 ring-2 ring-emerald-100">
                                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewFile(idx, 'image')}
                                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5 hover:bg-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Videos */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                                        <span>Video (Tối đa 3)</span>
                                        <span className="text-xs font-normal text-slate-400">
                                            {formData.existingVideos.length + newVideos.length}/3
                                        </span>
                                    </label>

                                    {/* Existing Videos */}
                                    {formData.existingVideos.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {formData.existingVideos.map((vid, idx) => (
                                                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-black group">
                                                    <video src={`${API_URL}/${vid}`} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-opacity">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExistingFile(idx, 'video')}
                                                            className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600 border border-white"
                                                            title="Xóa video này"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 hover:border-emerald-500 transition-colors bg-slate-50/50">
                                        <input
                                            type="file"
                                            multiple
                                            accept="video/*"
                                            onChange={(e) => handleFileChange(e, 'video')}
                                            className="hidden"
                                            id="video-upload"
                                        />
                                        <label htmlFor="video-upload" className="flex flex-col items-center cursor-pointer">
                                            <Video className="w-8 h-8 text-slate-400 mb-2" />
                                            <span className="text-xs text-slate-500 font-medium">Chọn video (Max 2MB)</span>
                                        </label>
                                    </div>

                                    {/* New Video Previews */}
                                    {previewVideos.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {previewVideos.map((src, idx) => (
                                                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-emerald-200 ring-2 ring-emerald-100">
                                                    <video src={src} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewFile(idx, 'video')}
                                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5 hover:bg-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Điểm nổi bật *</label>
                                <textarea
                                    name="highlights"
                                    required
                                    value={formData.highlights}
                                    onChange={handleInputChange}
                                    rows="2"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                                    placeholder="Những nét đặc sắc của địa điểm này..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Mô tả chi tiết</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                                    placeholder="Thông tin chi tiết về điểm đến..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors font-medium border border-transparent hover:border-slate-200"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-medium"
                                >
                                    <Save className="w-4 h-4" />
                                    {editingPoint ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )}
        </div >
    );
}

export default PointsPage;
