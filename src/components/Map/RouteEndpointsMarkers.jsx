import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const getPointTypeLabel = (index, total) => {
    if (index === 0) return 'Điểm bắt đầu';
    if (index === total - 1) return 'Điểm kết thúc';
    return `Điểm trung gian #${index + 1}`;
};

const createStepIcon = (index, total) => {
    const isStart = index === 0;
    const isEnd = index === total - 1;
    const gradient = isStart
        ? 'linear-gradient(135deg, #10b981, #059669)'
        : isEnd
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : 'linear-gradient(135deg, #0ea5e9, #2563eb)';

    return new L.DivIcon({
        className: `route-step-marker route-step-marker-${index + 1}`,
        html: `
        <div style="
          width: 30px;
          height: 30px;
          border-radius: 9999px;
          border: 2px solid #ffffff;
          background: ${gradient};
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.35);
        ">
          ${index + 1}
        </div>
      `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -14],
    });
};

function RouteEndpointsMarkers({ routes, selectedRoute }) {
    if (!selectedRoute || !routes || routes.length === 0) {
        return null;
    }

    // Find the selected route
    const route = routes.find(r => r._id === selectedRoute);
    if (!route || !route.points || route.points.length < 2) {
        return null;
    }

    const validPoints = route.points.filter(p => p.location?.coordinates);
    if (validPoints.length < 1) {
        return null;
    }

    return (
        <>
            {validPoints.map((point, index) => (
                <Marker
                    key={point._id || `${point.name}-${index}`}
                    position={[point.location.coordinates[1], point.location.coordinates[0]]}
                    icon={createStepIcon(index, validPoints.length)}
                    zIndexOffset={index === 0 || index === validPoints.length - 1 ? 1200 : 900}
                >
                    <Popup>
                        <div style={{ minWidth: '220px', fontFamily: 'system-ui, sans-serif' }}>
                            <div style={{
                                background: index === 0
                                    ? 'linear-gradient(135deg, #10b981, #059669)'
                                    : index === validPoints.length - 1
                                        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                        : 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                                padding: '10px 14px',
                                margin: '-10px -10px 10px -10px',
                                borderRadius: '4px 4px 0 0',
                            }}>
                                <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                                    {getPointTypeLabel(index, validPoints.length)}
                                </span>
                            </div>
                            <div style={{ padding: '0 4px' }}>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                                    {point.name}
                                </h4>
                                <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#64748b' }}>
                                    {point.category || 'Điểm tham quan'}
                                </p>
                                <p style={{ margin: 0, fontSize: '12px', color: '#0f172a', fontWeight: 600 }}>
                                    Thứ tự tuyến: #{index + 1}
                                </p>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
}

export default RouteEndpointsMarkers;
