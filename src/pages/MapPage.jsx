import { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import MapComponent from '../components/Map/MapComponent';
import SearchBox from '../components/Map/SearchBox';

function MapPage() {
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);

    const handleRouteSelect = (route) => {
        setSelectedRoute(route);
        if (route) setSelectedLocation(null);
    };

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
        if (location) setSelectedRoute(null);
    };

    return (
        <div className="h-screen flex bg-slate-50">
            {/* Sidebar */}
            <Sidebar
                selectedRoute={selectedRoute}
                onRouteSelect={handleRouteSelect}
            />

            {/* Map */}
            <div className="flex-1 relative">
                <SearchBox onSelect={handleLocationSelect} />
                <MapComponent
                    selectedRoute={selectedRoute}
                    onRouteSelect={handleRouteSelect}
                    selectedLocation={selectedLocation}
                />
            </div>
        </div>
    );
}

export default MapPage;
