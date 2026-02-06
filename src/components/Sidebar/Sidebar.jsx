import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import mapService from '../../services/mapService';
import { Map, ChevronLeft, ChevronRight, Clock, ArrowLeft, MapPin, ChevronDown, Navigation } from 'lucide-react';

function Sidebar({ selectedRoute, onRouteSelect }) {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const data = await mapService.getRoutes();
                setRoutes(data);
            } catch (error) {
                console.error('Error fetching routes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoutes();
    }, []);

    if (collapsed) {
        return (
            <div className="w-12 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-3">
                <button
                    onClick={() => setCollapsed(false)}
                    className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all"
                    title="Mở rộng"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
                <Link to="/dashboard" className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all" title="Dashboard">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
            </div>
        );
    }

    return (
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-3">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-cyan-600 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Dashboard
                    </Link>
                    <button
                        onClick={() => setCollapsed(true)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Thu gọn"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-tr from-cyan-500 to-emerald-500 rounded-lg text-white">
                        <Map className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-bold text-slate-800">Tuyến du lịch</h2>
                </div>
            </div>

            {/* Routes List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
                    </div>
                ) : routes.length === 0 ? (
                    <div className="text-center py-8 px-4">
                        <p className="text-slate-400 text-sm">Chưa có tuyến du lịch</p>
                    </div>
                ) : (
                    routes.map((route) => {
                        const isSelected = selectedRoute === route._id;
                        return (
                            <div
                                key={route._id}
                                className={`
                                    rounded-xl transition-all border overflow-hidden
                                    ${isSelected
                                        ? 'bg-white border-cyan-400 shadow-sm ring-2 ring-cyan-100'
                                        : 'bg-white border-slate-200 hover:border-cyan-200 hover:shadow-sm'
                                    }
                                `}
                            >
                                {/* Route Header - Clickable */}
                                <div
                                    onClick={() => onRouteSelect(isSelected ? null : route._id)}
                                    className="p-3 cursor-pointer"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className={`font-semibold text-sm ${isSelected ? 'text-cyan-700' : 'text-slate-700'}`}>
                                            {route.routeName}
                                        </h3>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isSelected ? 'rotate-180' : ''}`} />
                                    </div>

                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="inline-flex items-center gap-1 text-slate-500">
                                            <Clock className="w-3 h-3" />
                                            {route.duration}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-cyan-600 font-medium">
                                            <Navigation className="w-3 h-3" />
                                            {route.totalDistance ? `${route.totalDistance} km` : 'N/A'}
                                        </span>
                                        <span className="text-slate-400">
                                            {route.points?.length || 0} điểm
                                        </span>
                                    </div>
                                </div>

                                {/* Points List - Expandable */}
                                {isSelected && route.points && route.points.length > 0 && (
                                    <div className="border-t border-cyan-100 bg-cyan-50/30 p-3">
                                        <p className="text-xs font-semibold text-cyan-700 mb-2 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            Lộ trình chi tiết
                                        </p>
                                        <div className="space-y-0">
                                            {route.points.map((point, index) => {
                                                // Calculate distance from previous point using Haversine formula
                                                let distanceFromPrev = 0;
                                                if (index > 0) {
                                                    const prevPoint = route.points[index - 1];
                                                    const getCoords = (p) => p.location?.coordinates || p.coordinates;
                                                    const prevCoords = getCoords(prevPoint);
                                                    const currCoords = getCoords(point);

                                                    if (prevCoords && currCoords) {
                                                        const [lng1, lat1] = prevCoords;
                                                        const [lng2, lat2] = currCoords;
                                                        const R = 6371; // Earth's radius in km
                                                        const dLat = (lat2 - lat1) * Math.PI / 180;
                                                        const dLng = (lng2 - lng1) * Math.PI / 180;
                                                        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                                            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                                                            Math.sin(dLng / 2) * Math.sin(dLng / 2);
                                                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                                                        distanceFromPrev = R * c;
                                                    }
                                                }

                                                return (
                                                    <div key={point._id || index}>
                                                        <div className="flex items-start gap-2">
                                                            {/* Step Number */}
                                                            <div className="flex flex-col items-center">
                                                                <div className={`
                                                                    w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                                                                    ${index === 0
                                                                        ? 'bg-emerald-500 text-white'
                                                                        : index === route.points.length - 1
                                                                            ? 'bg-red-500 text-white'
                                                                            : 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                                                                    }
                                                                `}>
                                                                    {index + 1}
                                                                </div>
                                                                {/* Connecting line to next point */}
                                                                {index < route.points.length - 1 && (
                                                                    <div className="w-0.5 h-6 bg-cyan-200 mt-1"></div>
                                                                )}
                                                            </div>

                                                            {/* Point Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-sm font-medium text-slate-700 truncate">
                                                                        {point.name}
                                                                    </p>
                                                                    {/* Distance badge */}
                                                                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ${index === 0
                                                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                                                                        }`}>
                                                                        {index === 0 ? '0 km' : `+${distanceFromPrev.toFixed(1)} km`}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-slate-400">
                                                                    {point.category || 'Điểm tham quan'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default Sidebar;
