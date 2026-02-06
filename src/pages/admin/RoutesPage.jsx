import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Map, Calendar, Clock, Activity, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import routeService from '../../services/routeService';
import mapService from '../../services/mapService';
import RouteModal from './components/RouteModal';

function RoutesPage() {
    const navigate = useNavigate();
    const { checkPermission } = useAuth();
    const canEdit = checkPermission('routes', 'edit');
    const canCreate = checkPermission('routes', 'create');
    const canDelete = checkPermission('routes', 'delete');
    const [routes, setRoutes] = useState([]);
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [routesData, pointsData] = await Promise.all([
                routeService.getRoutes(),
                mapService.getPoints()
            ]);
            setRoutes(routesData);

            // Parse GeoJSON to flat array for modal
            const parsedPoints = pointsData.features ? pointsData.features.map(feature => ({
                _id: feature.properties._id,
                name: feature.properties.name,
                category: feature.properties.category,
                description: feature.properties.description,
                coordinates: feature.geometry.coordinates
            })) : [];

            setPoints(parsedPoints);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateWrapper = () => {
        setSelectedRoute(null);
        setIsModalOpen(true);
    };

    const handleEditWrapper = (route) => {
        setSelectedRoute(route);
        setIsModalOpen(true);
    };

    const handleDeleteWrapper = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tuyến này? Hành động này không thể hoàn tác.')) {
            try {
                await routeService.deleteRoute(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting route:', error);
                alert('Có lỗi xảy ra khi xóa tuyến.');
            }
        }
    };

    const handleSubmitWrapper = async (formData) => {
        try {
            let res;
            if (selectedRoute) {
                res = await routeService.updateRoute(selectedRoute._id, formData);
            } else {
                res = await routeService.createRoute(formData);
            }

            if (res && res.status === 'pending_approval') {
                alert('Yêu cầu của bạn đã được gửi và đang chờ phê duyệt.');
            } else {
                alert('Lưu thành công!');
            }

            fetchData();
        } catch (error) {
            console.error('Error saving route:', error);
            alert('Có lỗi xảy ra khi lưu tuyến: ' + (error.response?.data?.message || error.message));
            throw error; // Let modal handle loading state if needed
        }
    };

    const filteredRoutes = routes.filter(route =>
        route.routeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
            {/* Back Button */}
            <button
                onClick={() => navigate('/dashboard')}
                className="group flex items-center text-slate-500 hover:text-purple-600 transition-colors mb-6 font-medium"
            >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Quay lại Dashboard
            </button>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <span className="p-2 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-xl text-white shadow-lg shadow-purple-500/20">
                            <Map className="w-6 h-6" />
                        </span>
                        Quản lý Tuyến Du lịch
                    </h1>
                    <p className="text-slate-500 mt-1 ml-1">Xây dựng và quản lý các hành trình tham quan.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm tuyến..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all w-64"
                        />
                    </div>
                    {canCreate && (
                        <button
                            onClick={handleCreateWrapper}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all shadow-lg shadow-slate-200 hover:shadow-xl active:scale-95 font-medium text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm tuyến mới
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse h-64"></div>
                    ))}
                </div>
            ) : filteredRoutes.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Map className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">Chưa có tuyến du lịch nào</h3>
                    <p className="text-slate-400 mb-6">Hãy bắt đầu bằng việc tạo một tuyến mới.</p>
                    <button onClick={handleCreateWrapper} className="px-6 py-2 bg-purple-50 text-purple-600 rounded-xl font-medium hover:bg-purple-100 transition-colors">
                        Tạo tuyến ngay
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRoutes.map(route => {
                        // Calculate stats safely
                        const pointCount = route.points ? route.points.length : 0;

                        return (
                            <div key={route._id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 hover:border-purple-200 transition-all duration-300 flex flex-col overflow-hidden">
                                {/* Card Header */}
                                <div className="p-6 pb-4">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="px-3 py-1 rounded-full text-xs font-semibold border bg-purple-100 text-purple-700 border-purple-200">
                                            {route.duration || '1 ngày'}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {canEdit && (
                                                <button onClick={() => handleEditWrapper(route)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Chỉnh sửa">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button onClick={() => handleDeleteWrapper(route._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1" title={route.routeName}>
                                        {route.routeName}
                                    </h3>
                                    <p className="text-slate-500 text-sm line-clamp-2 h-10 mb-2">
                                        {route.description || 'Không có mô tả'}
                                    </p>
                                </div>

                                {/* Stats Bar */}
                                <div className="px-6 py-3 bg-slate-50 border-y border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                                    <div className="flex items-center gap-1.5" title="Thời gian">
                                        <Clock className="w-3.5 h-3.5" />
                                        {route.duration || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-1.5" title="Số điểm tham quan">
                                        <Map className="w-3.5 h-3.5" />
                                        {pointCount} điểm
                                    </div>
                                    <div className="flex items-center gap-1.5" title="Độ dài">
                                        <Activity className="w-3.5 h-3.5" />
                                        {route.totalDistance} km
                                    </div>
                                </div>

                                {/* Points Preview */}
                                <div className="p-4 bg-white flex-1 min-h-[80px]">
                                    <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Lộ trình</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {route.points && route.points.slice(0, 3).map((point, idx) => (
                                            <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-600 max-w-[100px] truncate">
                                                <span className="font-bold mr-1 text-slate-400">{idx + 1}.</span>
                                                {point.name}
                                            </span>
                                        ))}
                                        {pointCount > 3 && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-400 font-medium">
                                                +{pointCount - 3}
                                            </span>
                                        )}
                                        {pointCount === 0 && (
                                            <span className="text-xs text-slate-400 italic">Chưa có điểm nào</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <RouteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitWrapper}
                initialData={selectedRoute}
                availablePoints={points}
            />
        </div>
    );
}

export default RoutesPage;
