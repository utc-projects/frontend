import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const getPointType = (index, total) => {
    if (index === 0) return 'start';
    if (index === total - 1) return 'end';
    return 'middle';
};

const getPointTypeLabel = (index, total) => {
    if (index === 0) return 'Điểm bắt đầu';
    if (index === total - 1) return 'Điểm kết thúc';
    return `Điểm trung gian #${index + 1}`;
};

const createStepIcon = (index, total) => {
    const pointType = getPointType(index, total);
    const gradient = pointType === 'start'
        ? 'linear-gradient(135deg, #10b981, #059669)'
        : pointType === 'end'
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
            {validPoints.map((point, index) => {
                const pointType = getPointType(index, validPoints.length);
                const progressPercent = Math.max(
                    0,
                    Math.min(100, Math.round(((index + 1) / validPoints.length) * 100)),
                );

                return (
                    <Marker
                        key={point._id || `${point.name}-${index}`}
                        position={[point.location.coordinates[1], point.location.coordinates[0]]}
                        icon={createStepIcon(index, validPoints.length)}
                        zIndexOffset={index === 0 || index === validPoints.length - 1 ? 1200 : 900}
                    >
                        <Popup className="route-step-popup" maxWidth={320}>
                            <div className="route-step-popup-card">
                                <div className={`route-step-popup-head route-step-popup-head--${pointType}`}>
                                    <span className="route-step-popup-head-label">{getPointTypeLabel(index, validPoints.length)}</span>
                                    <span className="route-step-popup-head-order">#{index + 1}/{validPoints.length}</span>
                                </div>

                                <div className="route-step-popup-body">
                                    <h4 className="route-step-popup-title">{point.name}</h4>

                                    <div className="route-step-popup-meta">
                                        <span className="route-step-popup-chip">{point.category || 'Điểm tham quan'}</span>
                                        <span className="route-step-popup-chip route-step-popup-chip--muted">
                                            Thứ tự #{index + 1}
                                        </span>
                                    </div>

                                    <div className="route-step-popup-progress">
                                        <div className="route-step-popup-progress-header">
                                            <span>Lộ trình tuyến</span>
                                            <span>{progressPercent}%</span>
                                        </div>
                                        <div className="route-step-popup-progress-track">
                                            <div
                                                className={`route-step-popup-progress-fill route-step-popup-progress-fill--${pointType}`}
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    {route.routeName && (
                                        <p className="route-step-popup-route">
                                            Tuyến: <strong>{route.routeName}</strong>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </>
    );
}

export default RouteEndpointsMarkers;
