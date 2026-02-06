import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Custom start marker icon (green flag)
const startIcon = new L.DivIcon({
    className: 'custom-start-marker',
    html: `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
    ">
      <div style="
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #10b981, #059669);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        border: 3px solid white;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 16px;
          color: white;
          font-weight: bold;
        ">▶</span>
      </div>
    </div>
  `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40],
});

// Custom end marker icon (red flag)
const endIcon = new L.DivIcon({
    className: 'custom-end-marker',
    html: `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
    ">
      <div style="
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        border: 3px solid white;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 16px;
          color: white;
          font-weight: bold;
        ">◼</span>
      </div>
    </div>
  `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40],
});

function RouteEndpointsMarkers({ routes, selectedRoute }) {
    if (!selectedRoute || !routes || routes.length === 0) {
        return null;
    }

    // Find the selected route
    const route = routes.find(r => r._id === selectedRoute);
    if (!route || !route.points || route.points.length < 2) {
        return null;
    }

    // Get the first and last points with valid coordinates
    const validPoints = route.points.filter(p => p.location?.coordinates);
    if (validPoints.length < 2) {
        return null;
    }

    const startPoint = validPoints[0];
    const endPoint = validPoints[validPoints.length - 1];

    return (
        <>
            {/* Start Marker */}
            <Marker
                position={[startPoint.location.coordinates[1], startPoint.location.coordinates[0]]}
                icon={startIcon}
                zIndexOffset={1000}
            >
                <Popup>
                    <div style={{ minWidth: '200px', fontFamily: 'system-ui, sans-serif' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            padding: '10px 14px',
                            margin: '-10px -10px 10px -10px',
                            borderRadius: '4px 4px 0 0',
                        }}>
                            <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                                🚀 Điểm bắt đầu
                            </span>
                        </div>
                        <div style={{ padding: '0 4px' }}>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                                {startPoint.name}
                            </h4>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                                {startPoint.category || 'Điểm tham quan'}
                            </p>
                        </div>
                    </div>
                </Popup>
            </Marker>

            {/* End Marker */}
            <Marker
                position={[endPoint.location.coordinates[1], endPoint.location.coordinates[0]]}
                icon={endIcon}
                zIndexOffset={1000}
            >
                <Popup>
                    <div style={{ minWidth: '200px', fontFamily: 'system-ui, sans-serif' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            padding: '10px 14px',
                            margin: '-10px -10px 10px -10px',
                            borderRadius: '4px 4px 0 0',
                        }}>
                            <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                                🏁 Điểm kết thúc
                            </span>
                        </div>
                        <div style={{ padding: '0 4px' }}>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                                {endPoint.name}
                            </h4>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                                {endPoint.category || 'Điểm tham quan'}
                            </p>
                        </div>
                    </div>
                </Popup>
            </Marker>
        </>
    );
}

export default RouteEndpointsMarkers;
