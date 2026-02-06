import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, ArrowUp, ArrowDown, MapPin, Search, ChevronRight } from 'lucide-react';

function RouteModal({ isOpen, onClose, onSubmit, initialData = null, availablePoints = [] }) {
    const [formData, setFormData] = useState({
        routeName: '',
        description: '',
        duration: '',
        exploitationGuide: '',
        points: []
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    routeName: initialData.routeName || '',
                    description: initialData.description || '',
                    duration: initialData.duration || '',
                    exploitationGuide: initialData.exploitationGuide || '',
                    points: initialData.points ? initialData.points.map(p => p._id || p) : []
                });
            } else {
                setFormData({
                    routeName: '',
                    description: '',
                    duration: '',
                    exploitationGuide: '',
                    points: []
                });
            }
            setSearchTerm('');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    // Filter available points (exclude already selected ones)
    const availablePointsList = availablePoints.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !formData.points.includes(p._id)
    );

    const handleAddPoint = (pointId) => {
        setFormData(prev => ({
            ...prev,
            points: [...prev.points, pointId]
        }));
    };

    const handleRemovePoint = (index) => {
        setFormData(prev => ({
            ...prev,
            points: prev.points.filter((_, i) => i !== index)
        }));
    };

    const handleMovePoint = (index, direction) => {
        const newPoints = [...formData.points];
        if (direction === 'up' && index > 0) {
            [newPoints[index], newPoints[index - 1]] = [newPoints[index - 1], newPoints[index]];
        } else if (direction === 'down' && index < newPoints.length - 1) {
            [newPoints[index], newPoints[index + 1]] = [newPoints[index + 1], newPoints[index]];
        }
        setFormData(prev => ({ ...prev, points: newPoints }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to get point details by ID
    const getPointDetails = (id) => availablePoints.find(p => p._id === id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {initialData ? 'Chỉnh sửa Tuyến du lịch' : 'Thêm mới Tuyến du lịch'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                    <form id="route-form" onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 h-full">

                        {/* Left Column: Basic Info */}
                        <div className="w-full lg:w-1/3 space-y-5 h-full overflow-y-auto pr-2">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Thông tin chung</h3>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Tên tuyến (*)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.routeName}
                                    onChange={e => setFormData({ ...formData, routeName: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
                                    placeholder="Tên tuyến du lịch"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Thời gian (*)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
                                    placeholder="Ví dụ: 1 ngày"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Mô tả</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none resize-none"
                                    placeholder="Mô tả ngắn gọn..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Hướng dẫn khai thác (*)</label>
                                <textarea
                                    rows="5"
                                    required
                                    value={formData.exploitationGuide}
                                    onChange={e => setFormData({ ...formData, exploitationGuide: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none resize-none"
                                    placeholder="Hướng dẫn chi tiết..."
                                />
                            </div>
                        </div>

                        {/* Right Column: Dual List Selection */}
                        <div className="w-full lg:w-2/3 flex flex-col md:flex-row gap-4 h-[500px] md:h-[600px]">

                            {/* Available Points */}
                            <div className="flex-1 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
                                <div className="p-3 border-b border-slate-100 bg-slate-50">
                                    <h4 className="font-semibold text-slate-700 text-sm mb-2">Danh sách địa điểm có sẵn</h4>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-purple-500 outline-none"
                                            placeholder="Lọc theo tên..."
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {availablePointsList.map(point => (
                                        <div key={point._id} className="group flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-all cursor-pointer" onClick={() => handleAddPoint(point._id)}>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-700 truncate">{point.name}</p>
                                                <p className="text-xs text-slate-400 truncate">{point.category}</p>
                                            </div>
                                            <button type="button" className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-100 rounded-md transition-colors">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {availablePointsList.length === 0 && (
                                        <p className="text-center text-xs text-slate-400 py-4">Không tìm thấy điểm nào</p>
                                    )}
                                </div>
                            </div>

                            {/* Separator / Arrow (Hidden on mobile) */}
                            <div className="hidden md:flex items-center justify-center text-slate-300">
                                <ChevronRight className="w-6 h-6" />
                            </div>

                            {/* Selected Points */}
                            <div className="flex-1 bg-purple-50/50 rounded-2xl border border-purple-100 flex flex-col overflow-hidden relative">
                                <div className="p-3 border-b border-purple-100 bg-purple-50 flex justify-between items-center">
                                    <h4 className="font-semibold text-purple-900 text-sm flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Điểm trong lộ trình
                                    </h4>
                                    <span className="bg-purple-200 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {formData.points.length}
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                    {formData.points.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-purple-300 p-6 text-center border-2 border-dashed border-purple-200 rounded-xl m-2">
                                            <MapPin className="w-8 h-8 mb-2 opacity-50" />
                                            <p className="text-sm">Chưa có điểm nào được chọn</p>
                                            <p className="text-xs mt-1">Chọn điểm từ danh sách bên trái</p>
                                        </div>
                                    ) : (
                                        formData.points.map((pointId, index) => {
                                            const point = getPointDetails(pointId);
                                            if (!point) return null;
                                            return (
                                                <div key={`${pointId}-${index}`} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-purple-100 shadow-sm relative group">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 border border-purple-200 flex items-center justify-center text-xs font-bold">
                                                        {index + 1}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-slate-700 truncate">{point.name}</p>
                                                        <p className="text-xs text-slate-500">{point.category}</p>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-1">
                                                        <div className="flex flex-col gap-0.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleMovePoint(index, 'up')}
                                                                disabled={index === 0}
                                                                className="p-0.5 text-slate-400 hover:text-purple-600 disabled:opacity-30"
                                                            >
                                                                <ArrowUp className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleMovePoint(index, 'down')}
                                                                disabled={index === formData.points.length - 1}
                                                                className="p-0.5 text-slate-400 hover:text-purple-600 disabled:opacity-30"
                                                            >
                                                                <ArrowDown className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemovePoint(index)}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-end gap-3 z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        form="route-form"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2 "
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        {initialData ? 'Lưu thay đổi' : 'Tạo tuyến mới'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RouteModal;
