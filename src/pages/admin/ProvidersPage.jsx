import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { ArrowLeft, Plus, MapPin, Edit, Trash2, Search, X, Save, Star, Phone, Globe, Building2, Image as ImageIcon, Video } from 'lucide-react';
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

// Service type categories and sub-types
const SERVICE_CATEGORIES = {
    accommodation: { label: 'Lưu trú', icon: '🏨' },
    dining: { label: 'Ăn uống', icon: '🍜' },
    transportation: { label: 'Vận chuyển', icon: '🚐' },
    entertainment: { label: 'Giải trí', icon: '🎢' },
    support: { label: 'Hỗ trợ', icon: '🎫' },
};

const SERVICE_SUB_TYPES = {
    hotel: { label: 'Khách sạn', category: 'accommodation' },
    homestay: { label: 'Homestay', category: 'accommodation' },
    resort: { label: 'Resort', category: 'accommodation' },
    restaurant: { label: 'Nhà hàng', category: 'dining' },
    local_food: { label: 'Ẩm thực địa phương', category: 'dining' },
    tour_bus: { label: 'Xe du lịch', category: 'transportation' },
    boat: { label: 'Tàu thuyền', category: 'transportation' },
    cable_car: { label: 'Cáp treo', category: 'transportation' },
    tourist_area: { label: 'Khu du lịch', category: 'entertainment' },
    amusement: { label: 'Điểm vui chơi', category: 'entertainment' },
    experience: { label: 'Trải nghiệm', category: 'entertainment' },
    guide: { label: 'Hướng dẫn viên', category: 'support' },
    shopping: { label: 'Mua sắm', category: 'support' },
    other: { label: 'Khác', category: 'support' },
};

const ProvidersPage = () => {
    const navigate = useNavigate();
    const { checkPermission } = useAuth();
    const canEdit = checkPermission('providers', 'edit');
    const canCreate = checkPermission('providers', 'create');
    const canDelete = checkPermission('providers', 'delete');
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProvider, setEditingProvider] = useState(null);
    const [filterType, setFilterType] = useState('');
    const [filterPrice, setFilterPrice] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // File states
    const [newImages, setNewImages] = useState([]);
    const [newVideos, setNewVideos] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [previewVideos, setPreviewVideos] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        serviceType: 'accommodation',
        subType: 'hotel',
        address: '',
        coordinates: '105.85, 21.02',
        serviceArea: 'Địa phương',
        priceRange: 'Trung cấp',
        description: '',
        phone: '',
        website: '',
        rating: 4,
    });

    useEffect(() => {
        fetchProviders();
    }, [filterType, filterPrice]);

    const fetchProviders = async () => {
        try {
            setLoading(true);
            const url = filterType ? `/providers?serviceType=${filterType}` : '/providers';
            const response = await api.get(url);
            const parsedProviders = response.data.features.map(f => ({
                _id: f.properties._id,
                name: f.properties.name,
                serviceType: f.properties.serviceType,
                subType: f.properties.subType,
                address: f.properties.address,
                priceRange: f.properties.priceRange,
                rating: f.properties.rating,
                contact: f.properties.contact,
                coordinates: f.geometry.coordinates,
            }));
            setProviders(parsedProviders);
        } catch (err) {
            console.error('Failed to fetch providers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            // When serviceType changes, update subType to first available option
            if (name === 'serviceType') {
                const firstSubType = Object.entries(SERVICE_SUB_TYPES)
                    .find(([key, val]) => val.category === value)?.[0] || 'other';
                return { ...prev, [name]: value, subType: firstSubType };
            }
            return { ...prev, [name]: value };
        });
    };

    const getSubTypesForCategory = (category) => {
        return Object.entries(SERVICE_SUB_TYPES)
            .filter(([key, val]) => val.category === category)
            .map(([key, val]) => ({ value: key, label: val.label }));
    };

    const handleOpenModal = async (provider = null) => {
        if (provider) {
            // Fetch full provider data for editing
            try {
                const response = await api.get(`/providers/${provider._id}`);
                const p = response.data;
                setEditingProvider(p);
                setFormData({
                    name: p.name,
                    serviceType: p.serviceType,
                    subType: p.subType,
                    address: p.address,
                    coordinates: p.location.coordinates.join(', '),
                    serviceArea: p.serviceArea,
                    priceRange: p.priceRange,
                    description: p.description || '',
                    phone: p.contact?.phone || '',
                    website: p.contact?.website || '',
                    rating: p.rating || 4,
                    existingImages: p.images || [],
                    existingVideos: p.videos || []
                });
                // Reset new files
                setNewImages([]);
                setNewVideos([]);
                setPreviewImages([]);
                setPreviewVideos([]);
            } catch (err) {
                console.error('Failed to fetch provider details:', err);
                return;
            }
        } else {
            setEditingProvider(null);
            setFormData({
                name: '',
                serviceType: 'accommodation',
                subType: 'hotel',
                address: '',
                coordinates: '105.85, 21.02',
                serviceArea: 'Địa phương',
                priceRange: 'Trung cấp',
                description: '',
                phone: '',
                website: '',
                rating: 4,
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
        setEditingProvider(null);
    };

    const handleFileChange = (e, type) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (type === 'image') {
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
            if (newVideos.length + files.length > 3) {
                alert('Tối đa 3 video!');
                return;
            }
            // Validate size (2MB)
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
            const [lng, lat] = formData.coordinates.split(',').map(n => parseFloat(n.trim()));
            const data = new FormData();
            data.append('name', formData.name);
            data.append('serviceType', formData.serviceType);
            data.append('subType', formData.subType);
            data.append('address', formData.address);
            data.append('location', JSON.stringify({ type: 'Point', coordinates: [lng, lat] }));
            data.append('serviceArea', formData.serviceArea);
            data.append('priceRange', formData.priceRange);
            data.append('description', formData.description);
            data.append('contact', JSON.stringify({ phone: formData.phone, website: formData.website }));
            data.append('rating', parseFloat(formData.rating));

            // Append new files
            newImages.forEach(file => data.append('images', file));
            newVideos.forEach(file => data.append('videos', file));

            // Append existing files (if any) to keep them
            if (formData.existingImages) {
                if (formData.existingImages.length === 0) {
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

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            let res;
            if (editingProvider) {
                res = await api.put(`/providers/${editingProvider._id}`, data, config);
            } else {
                res = await api.post('/providers', data, config);
            }

            if (res.data.status === 'pending_approval') {
                alert('Yêu cầu của bạn đã được gửi và đang chờ phê duyệt.');
            } else {
                alert('Lưu thành công!');
            }

            handleCloseModal();
            fetchProviders();
        } catch (err) {
            console.error('Failed to save provider:', err);
            alert('Có lỗi xảy ra khi lưu nhà cung cấp');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
            try {
                await api.delete(`/providers/${id}`);
                fetchProviders();
            } catch (err) {
                console.error('Failed to delete provider:', err);
                alert(err.response?.data?.message || 'Không thể xóa nhà cung cấp');
            }
        }
    };

    // Location marker for map
    const LocationMarker = () => {
        const [position, setPosition] = useState(null);

        useEffect(() => {
            if (formData.coordinates) {
                const [lng, lat] = formData.coordinates.split(',').map(n => parseFloat(n.trim()));
                if (!isNaN(lng) && !isNaN(lat)) {
                    setPosition([lat, lng]);
                }
            }
        }, []);

        const map = useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                setFormData(prev => ({
                    ...prev,
                    coordinates: `${lng.toFixed(6)}, ${lat.toFixed(6)}`
                }));
            },
        });

        useEffect(() => {
            if (position) {
                map.flyTo(position, map.getZoom());
            }
        }, [position, map]);

        return position === null ? null : <Marker position={position} />;
    };

    const getMapCenter = () => {
        if (formData.coordinates) {
            const [lng, lat] = formData.coordinates.split(',').map(n => parseFloat(n.trim()));
            if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
        }
        return [21.0285, 105.8542];
    };

    const getPriceRangeColor = (priceRange) => {
        switch (priceRange) {
            case 'Bình dân': return 'bg-green-50 text-green-700 border-green-100';
            case 'Trung cấp': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Cao cấp': return 'bg-rose-50 text-rose-700 border-rose-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="group flex items-center text-slate-500 hover:text-blue-600 transition-colors mb-6 font-medium"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Quay lại Dashboard
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 mb-2">
                            Quản lý Nhà cung cấp
                        </h1>
                        <p className="text-slate-500 text-lg">
                            Quản lý khách sạn, nhà hàng, dịch vụ vận chuyển và các đối tác du lịch
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
                                className="pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-48"
                            />
                        </div>

                        {/* Filter by type */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        >
                            <option value="">Tất cả loại</option>
                            {Object.entries(SERVICE_CATEGORIES).map(([key, val]) => (
                                <option key={key} value={key}>{val.icon} {val.label}</option>
                            ))}
                        </select>

                        {/* Filter by price */}
                        <select
                            value={filterPrice}
                            onChange={(e) => setFilterPrice(e.target.value)}
                            className="px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        >
                            <option value="">Tất cả giá</option>
                            <option value="Bình dân">💚 Bình dân</option>
                            <option value="Trung cấp">💛 Trung cấp</option>
                            <option value="Cao cấp">💗 Cao cấp</option>
                        </select>

                        {canCreate && (
                            <button
                                onClick={() => handleOpenModal()}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5 font-semibold"
                            >
                                <Plus className="w-5 h-5" />
                                Thêm mới
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-5 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Nhà cung cấp</th>
                                <th className="p-5 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Loại dịch vụ</th>
                                <th className="p-5 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Giá</th>
                                <th className="p-5 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider">Đánh giá</th>
                                <th className="p-5 text-right text-xs font-extrabold text-slate-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {providers
                                .filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .filter(p => !filterPrice || p.priceRange === filterPrice)
                                .map((provider) => (
                                    <tr key={provider._id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-lg">
                                                    {SERVICE_CATEGORIES[provider.serviceType]?.icon || '📍'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 mb-1">{provider.name}</div>
                                                    <div className="text-sm text-slate-500 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {provider.address?.substring(0, 40)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium text-slate-700">
                                                    {SERVICE_CATEGORIES[provider.serviceType]?.label}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {SERVICE_SUB_TYPES[provider.subType]?.label}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriceRangeColor(provider.priceRange)}`}>
                                                {provider.priceRange}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                <span className="font-semibold text-slate-700">{provider.rating}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {canEdit && (
                                                    <button
                                                        onClick={() => handleOpenModal(provider)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDelete(provider._id)}
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
                            {providers.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                                <Building2 className="w-8 h-8" />
                                            </div>
                                            <p className="text-lg font-medium text-slate-500">Chưa có nhà cung cấp nào</p>
                                            <p className="text-sm">Bắt đầu bằng cách thêm nhà cung cấp mới</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-800">
                                        {editingProvider ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp mới'}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">Điền thông tin chi tiết về nhà cung cấp dịch vụ</p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Tên nhà cung cấp *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Ví dụ: Khách sạn Mường Thanh"
                                    />
                                </div>

                                {/* Service Type & Sub Type */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Loại dịch vụ</label>
                                        <select
                                            name="serviceType"
                                            value={formData.serviceType}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                                        >
                                            {Object.entries(SERVICE_CATEGORIES).map(([key, val]) => (
                                                <option key={key} value={key}>{val.icon} {val.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Chi tiết</label>
                                        <select
                                            name="subType"
                                            value={formData.subType}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                                        >
                                            {getSubTypesForCategory(formData.serviceType).map(sub => (
                                                <option key={sub.value} value={sub.value}>{sub.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Địa chỉ *</label>
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                    />
                                </div>

                                {/* Map */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                                        <span>Vị trí trên bản đồ *</span>
                                        <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                            Click bản đồ để chọn
                                        </span>
                                    </label>
                                    <div className="h-48 rounded-xl overflow-hidden border-2 border-slate-200 relative z-0 hover:border-blue-400 transition-colors">
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
                                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                        Tọa độ: {formData.coordinates || 'Chưa chọn'}
                                    </div>
                                </div>

                                {/* Price & Rating & Area */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Phân khúc giá</label>
                                        <select
                                            name="priceRange"
                                            value={formData.priceRange}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                                        >
                                            <option value="Bình dân">💚 Bình dân</option>
                                            <option value="Trung cấp">💛 Trung cấp</option>
                                            <option value="Cao cấp">💗 Cao cấp</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Đánh giá</label>
                                        <input
                                            type="number"
                                            name="rating"
                                            min="1"
                                            max="5"
                                            step="0.1"
                                            value={formData.rating}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Phạm vi</label>
                                        <select
                                            name="serviceArea"
                                            value={formData.serviceArea}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                                        >
                                            <option value="Địa phương">Địa phương</option>
                                            <option value="Tuyến">Tuyến</option>
                                            <option value="Vùng">Vùng</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Contact */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            Điện thoại
                                        </label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            placeholder="0123 456 789"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-slate-400" />
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                </div>

                                {/* Images and Videos */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Images */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                                            <span>Hình ảnh (Tối đa 5)</span>
                                            <span className="text-xs font-normal text-slate-400">
                                                {(formData.existingImages?.length || 0) + newImages.length}/5
                                            </span>
                                        </label>

                                        {/* Existing Images */}
                                        {formData.existingImages && formData.existingImages.length > 0 && (
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
                                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 hover:border-blue-500 transition-colors bg-slate-50/50">
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
                                                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-blue-200 ring-2 ring-blue-100">
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
                                                {(formData.existingVideos?.length || 0) + newVideos.length}/3
                                            </span>
                                        </label>

                                        {/* Existing Videos */}
                                        {formData.existingVideos && formData.existingVideos.length > 0 && (
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

                                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 hover:border-blue-500 transition-colors bg-slate-50/50">
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
                                                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-blue-200 ring-2 ring-blue-100">
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

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Mô tả</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                                        placeholder="Mô tả ngắn về nhà cung cấp..."
                                    />
                                </div>

                                {/* Actions */}
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
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-medium"
                                    >
                                        <Save className="w-4 h-4" />
                                        {editingProvider ? 'Cập nhật' : 'Thêm mới'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ProvidersPage;
