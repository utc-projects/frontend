import { useState, useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LayerControl from './LayerControl';
import PointsLayer from './PointsLayer';
import RoutesLayer from './RoutesLayer';
import RouteEndpointsMarkers from './RouteEndpointsMarkers';
import ProvidersLayer from './ProvidersLayer';
import mapService from '../../services/mapService';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// Fix Leaflet default marker icon issue
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// Component to handle map events and flying to location
function MapController({ selectedRoute, routes, selectedLocation }) {
    const map = useMap();

    useEffect(() => {
        if (selectedRoute && routes.length > 0) {
            const route = routes.find(r => r._id === selectedRoute);
            if (route && route.points && route.points.length > 0) {
                const bounds = L.latLngBounds(
                    route.points
                        .filter(p => p.location?.coordinates)
                        .map(p => [p.location.coordinates[1], p.location.coordinates[0]])
                );
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [selectedRoute, routes, map]);

    useEffect(() => {
        if (selectedLocation) {
            map.flyTo([selectedLocation.lat, selectedLocation.lng], 16, {
                duration: 2,
                easeLinearity: 0.25
            });
        }
    }, [selectedLocation, map]);

    return null;
}

// Media Viewer Component
const MediaViewer = ({ items, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Reset index if items change or dialog re-opens
    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex, items]);

    const handleNext = (e) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const handlePrev = (e) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!items || items.length === 0) return null;

    const currentItem = items[currentIndex];

    return (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200" onClick={onClose}>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50 focus:outline-none"
            >
                <X className="w-8 h-8" />
            </button>

            {items.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50 focus:outline-none"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50 focus:outline-none"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                </>
            )}

            <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-12" onClick={e => e.stopPropagation()}>
                {currentItem.type === 'image' ? (
                    <img
                        src={currentItem.src}
                        alt={`Slide ${currentIndex + 1}`}
                        className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm select-none"
                    />
                ) : (
                    <video
                        src={currentItem.src}
                        controls
                        autoPlay
                        className="max-w-full max-h-[85vh] shadow-2xl rounded-sm outline-none"
                    />
                )}

                {items.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {items.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

function MapComponent({ selectedRoute, onRouteSelect, selectedLocation }) {
    const [points, setPoints] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [routesGeoJSON, setRoutesGeoJSON] = useState(null);
    const [providers, setProviders] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mediaViewer, setMediaViewer] = useState({ open: false, items: [], index: 0 });

    // Layer visibility state
    const [layers, setLayers] = useState({
        routes: true,
        points: true,
        providers: true,
    });

    // All provider types always visible
    const providerTypes = {
        accommodation: true,
        dining: true,
        transportation: true,
        entertainment: true,
        support: true,
    };

    // Center of Vietnam
    const defaultCenter = [16.0544, 108.2022];
    const defaultZoom = 6;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [pointsData, routesData, routesGeoData, providersData] = await Promise.all([
                    mapService.getPoints(),
                    mapService.getRoutes(),
                    mapService.getAllRoutesGeoJSON(),
                    mapService.getProviders(),
                ]);
                setPoints(pointsData);
                setRoutes(routesData);
                setRoutesGeoJSON(routesGeoData);
                setProviders(providersData);
            } catch (error) {
                console.error('Error fetching map data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Listen for custom media viewer events from Popup
    useEffect(() => {
        const handleOpenMedia = (e) => {
            const { items, index } = e.detail;
            setMediaViewer({ open: true, items, index: index || 0 });
        };

        window.addEventListener('open-media-viewer', handleOpenMedia);
        return () => window.removeEventListener('open-media-viewer', handleOpenMedia);
    }, []);

    const toggleLayer = (layerName) => {
        setLayers(prev => ({
            ...prev,
            [layerName]: !prev[layerName],
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-slate-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500 mx-auto mb-3"></div>
                    <p className="text-slate-500 text-sm">Đang tải bản đồ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full">
            <LeafletMapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                <MapController selectedRoute={selectedRoute} routes={routes} selectedLocation={selectedLocation} />

                {/* Routes Layer - show all when enabled, or just selected when disabled but route is selected */}
                {(layers.routes || selectedRoute) && routesGeoJSON && (
                    <RoutesLayer
                        data={layers.routes ? routesGeoJSON : {
                            ...routesGeoJSON,
                            features: routesGeoJSON.features.filter(f => f.properties._id === selectedRoute)
                        }}
                        selectedRoute={selectedRoute}
                        onRouteSelect={onRouteSelect}
                    />
                )}

                {/* Points Layer */}
                {layers.points && points && (
                    <PointsLayer data={points} selectedLocation={selectedLocation} />
                )}

                {/* Route Start/End Markers */}
                <RouteEndpointsMarkers routes={routes} selectedRoute={selectedRoute} />

                {/* Providers Layer */}
                {layers.providers && providers && (
                    <ProvidersLayer
                        data={providers}
                        visibleTypes={providerTypes}
                        selectedLocation={selectedLocation}
                    />
                )}
            </LeafletMapContainer>

            <LayerControl
                layers={layers}
                toggleLayer={toggleLayer}
            />

            {/* Media Viewer Overlay */}
            {mediaViewer.open && (
                <MediaViewer
                    items={mediaViewer.items}
                    initialIndex={mediaViewer.index}
                    onClose={() => setMediaViewer({ ...mediaViewer, open: false })}
                />
            )}
        </div>
    );
}

export default MapComponent;
