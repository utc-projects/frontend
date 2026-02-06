import { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import MapComponent from '../components/Map/MapComponent';
import SearchBox from '../components/Map/SearchBox';

function MapPage() {
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);

    return (
        <div className="h-screen flex bg-slate-50">
            {/* Sidebar */}
            <Sidebar
                selectedRoute={selectedRoute}
                onRouteSelect={setSelectedRoute}
            />

            {/* Map */}
            <div className="flex-1 relative">
                <SearchBox onSelect={setSelectedLocation} />
                <MapComponent
                    selectedRoute={selectedRoute}
                    onRouteSelect={setSelectedRoute}
                    selectedLocation={selectedLocation}
                />
            </div>
        </div>
    );
}

export default MapPage;
