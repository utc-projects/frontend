import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, MapPin, Building2, Utensils, Bus, Ticket, Folder } from 'lucide-react';
import mapService from '../../services/mapService';

const SearchBox = ({ onSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ points: [], providers: [] });
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setLoading(true);
                try {
                    const [pointsData, providersData] = await Promise.all([
                        mapService.getPoints({ search: query }),
                        mapService.getProviders({ search: query })
                    ]);

                    setResults({
                        points: pointsData.features || [],
                        providers: providersData.features || []
                    });
                    setShowResults(true);
                } catch (error) {
                    console.error('Search error:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults({ points: [], providers: [] });
                setShowResults(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (item, type) => {
        setQuery(item.properties.name);
        setShowResults(false);

        // Extract coordinates (GeoJSON is [lng, lat], Leaflet needs [lat, lng])
        const [lng, lat] = item.geometry.coordinates;
        onSelect({ lat, lng, item, type });
    };

    const clearSearch = () => {
        setQuery('');
        setResults({ points: [], providers: [] });
        setShowResults(false);
    };

    const getIcon = (item, type) => {
        if (type === 'point') return <MapPin className="w-4 h-4 text-red-500" />;

        switch (item.properties.serviceType) {
            case 'accommodation': return <Building2 className="w-4 h-4 text-blue-500" />;
            case 'dining': return <Utensils className="w-4 h-4 text-orange-500" />;
            case 'transportation': return <Bus className="w-4 h-4 text-green-500" />;
            case 'entertainment': return <Ticket className="w-4 h-4 text-purple-500" />;
            default: return <Folder className="w-4 h-4 text-gray-500" />;
        }
    };

    const hasResults = results.points.length > 0 || results.providers.length > 0;

    return (
        <div ref={searchRef} className="absolute top-4 left-14 z-[1000] w-80 md:w-96">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {loading ? (
                        <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                    ) : (
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-cyan-600 transition-colors" />
                    )}
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-10 py-3 border-none rounded-xl leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-lg transition-all duration-200"
                    placeholder="Tìm điểm du lịch, khách sạn..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (query.length >= 2) setShowResults(true);
                    }}
                />
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-gray-600 text-gray-400 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {showResults && hasResults && (
                <div className="absolute mt-2 w-full bg-white rounded-xl shadow-xl max-h-[60vh] overflow-y-auto border border-gray-100 animate-in fade-in zoom-in-95 duration-200 scrollbar-thin scrollbar-thumb-gray-200">
                    {results.points.length > 0 && (
                        <div className="py-2">
                            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50 sticky top-0 backdrop-blur-sm">
                                Điểm du lịch
                            </h3>
                            <ul>
                                {results.points.map((point) => (
                                    <li
                                        key={point.properties._id}
                                        onClick={() => handleSelect(point, 'point')}
                                        className="px-4 py-2.5 hover:bg-cyan-50 cursor-pointer transition-colors flex items-start gap-3 border-b border-gray-50/50 last:border-none"
                                    >
                                        <div className="mt-1 flex-shrink-0 p-1.5 bg-red-50 rounded-full">
                                            {getIcon(point, 'point')}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-800">
                                                {point.properties.name}
                                            </div>
                                            <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                                {point.properties.category} • {point.properties.role}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {results.providers.length > 0 && (
                        <div className="py-2 border-t border-gray-100">
                            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50 sticky top-0 backdrop-blur-sm">
                                Nhà cung cấp
                            </h3>
                            <ul>
                                {results.providers.map((provider) => (
                                    <li
                                        key={provider.properties._id}
                                        onClick={() => handleSelect(provider, 'provider')}
                                        className="px-4 py-2.5 hover:bg-cyan-50 cursor-pointer transition-colors flex items-start gap-3 border-b border-gray-50/50 last:border-none"
                                    >
                                        <div className={`mt-1 flex-shrink-0 p-1.5 rounded-full bg-${getIcon(provider, 'provider').props.className.includes('blue') ? 'blue' : 'gray'}-50`}>
                                            {getIcon(provider, 'provider')}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-800">
                                                {provider.properties.name}
                                            </div>
                                            <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                                {provider.properties.subTypeInfo?.label || provider.properties.subType} • {provider.properties.address}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {showResults && !loading && !hasResults && query.trim().length >= 2 && (
                <div className="absolute mt-2 w-full bg-white rounded-xl shadow-xl p-4 text-center text-gray-500 text-sm border border-gray-100">
                    Không tìm thấy kết quả nào
                </div>
            )}
        </div>
    );
};

export default SearchBox;
