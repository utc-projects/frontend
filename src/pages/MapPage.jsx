import { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import MapComponent from '../components/Map/MapComponent';

function MapPage() {
    const [selectedRoute, setSelectedRoute] = useState(null);

    return (
        <div className="h-screen flex bg-slate-50">
            {/* Sidebar */}
            <Sidebar
                selectedRoute={selectedRoute}
                onRouteSelect={setSelectedRoute}
            />

            {/* Map */}
            <div className="flex-1 relative">
                <MapComponent
                    selectedRoute={selectedRoute}
                    onRouteSelect={setSelectedRoute}
                />
            </div>
        </div>
    );
}

export default MapPage;
