import { GeoJSON, Marker } from 'react-leaflet';
import L from 'leaflet';

// Color palette for different routes
const ROUTE_COLORS = [
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#3b82f6', // blue
  '#f97316', // orange
  '#84cc16', // lime
  '#a855f7', // purple
  '#14b8a6', // teal
];

function RoutesLayer({ data, selectedRoute, onRouteSelect }) {
  // Build a map of route ID to color index
  const routeColorMap = {};
  if (data?.features) {
    data.features.forEach((feature, index) => {
      routeColorMap[feature.properties._id] = ROUTE_COLORS[index % ROUTE_COLORS.length];
    });
  }

  const routeStyle = (feature) => {
    const isSelected = selectedRoute === feature.properties._id;
    const routeColor = routeColorMap[feature.properties._id] || '#8b5cf6';

    return {
      color: isSelected ? '#ec4899' : routeColor,
      weight: isSelected ? 5 : 3,
      opacity: isSelected ? 1 : 0.7,
      dashArray: isSelected ? null : '10, 5',
    };
  };

  const createDirectionIcon = (angle, color, isSelected) => new L.DivIcon({
    className: `route-direction-arrow ${isSelected ? 'selected' : ''}`,
    html: `
      <div style="
        width: 18px;
        height: 18px;
        transform: rotate(${angle}deg);
        opacity: ${isSelected ? 0.95 : 0.8};
      ">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12H18" stroke="${color}" stroke-width="2.5" stroke-linecap="round" />
          <path d="M14 7L20 12L14 17" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  const directionMarkers = [];
  if (selectedRoute && data?.features) {
    data.features.forEach((feature) => {
      if (feature?.properties?._id !== selectedRoute) return;
      const coordinates = feature?.geometry?.coordinates || [];
      if (coordinates.length < 2) return;

      const routeColor = routeColorMap[feature.properties._id] || '#8b5cf6';
      const segmentCount = coordinates.length - 1;
      const arrowTarget = Math.min(10, Math.max(3, Math.floor(segmentCount / 3)));
      const step = Math.max(1, Math.floor(segmentCount / arrowTarget));

      for (let index = step; index < coordinates.length; index += step) {
        const prev = coordinates[Math.max(0, index - step)];
        const curr = coordinates[index];
        if (!prev || !curr) continue;

        const lngDelta = curr[0] - prev[0];
        const latDelta = curr[1] - prev[1];
        if (lngDelta === 0 && latDelta === 0) continue;

        const angle = Math.atan2(latDelta, lngDelta) * (180 / Math.PI);
        directionMarkers.push({
          id: `${feature.properties._id}-arrow-${index}`,
          position: [curr[1], curr[0]],
          angle,
          color: routeColor,
        });
      }
    });
  }

  const onEachFeature = (feature, layer) => {

    const props = feature.properties;

    const popupContent = `
      <div class="route-popup" style="min-width: 280px; font-family: system-ui, sans-serif;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 14px 16px; padding-right: 44px; border-radius: 12px 12px 0 0;">
          <h3 style="margin: 0; color: white; font-size: 16px; font-weight: 600;">🗺️ ${props.routeName}</h3>
          ${props.isRoadRoute ? '<span style="color: rgba(255,255,255,0.8); font-size: 10px; background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; margin-top: 4px; display: inline-block;">🛣️ Đường bộ thực tế</span>' : ''}
        </div>
        
        <div style="padding: 12px 16px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 12px;">
            <div style="background: #f1f5f9; padding: 8px 4px; border-radius: 6px; text-align: center;">
              <p style="margin: 0; font-size: 10px; color: #64748b;">Thời gian</p>
              <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: 600; color: #334155;">${props.duration}</p>
            </div>
            <div style="background: #f1f5f9; padding: 8px 4px; border-radius: 6px; text-align: center;">
              <p style="margin: 0; font-size: 10px; color: #64748b;">Khoảng cách</p>
              <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: 600; color: #334155;">${props.totalDistance} km</p>
            </div>
            ${props.roadDuration ? `
            <div style="background: #dbeafe; padding: 8px 4px; border-radius: 6px; text-align: center;">
              <p style="margin: 0; font-size: 10px; color: #1e40af;">🚗 Lái xe</p>
              <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: 600; color: #1e40af;">${Math.floor(props.roadDuration / 60)}h ${props.roadDuration % 60}m</p>
            </div>
            ` : ''}
          </div>
          
          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Các điểm (${props.pointsCount})</p>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${props.points ? props.points.map(p => `
                <span style="background: #e0e7ff; color: #3730a3; padding: 4px 8px; border-radius: 4px; font-size: 11px;">
                  ${p.name}
                </span>
              `).join('') : ''}
            </div>
          </div>
          
          <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">${props.description || ''}</p>
        </div>
      </div>
    `;

    layer.bindPopup(popupContent, {
      maxWidth: 320,
      className: 'custom-popup',
    });

    // Highlight on hover
    layer.on({
      mouseover: (e) => {
        if (selectedRoute !== props._id) {
          e.target.setStyle({
            weight: 4,
            opacity: 1,
          });
        }
      },
      mouseout: (e) => {
        if (selectedRoute !== props._id) {
          e.target.setStyle(routeStyle(feature));
        }
      },
      click: () => {
        if (onRouteSelect) {
          onRouteSelect(props._id);
        }
      },
    });
  };

  return (
    <>
      <GeoJSON
        key={selectedRoute || 'routes'} // Force re-render when selection changes
        data={data}
        style={routeStyle}
        onEachFeature={onEachFeature}
      />
      {directionMarkers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          icon={createDirectionIcon(marker.angle, marker.color, true)}
          interactive={false}
          zIndexOffset={700}
        />
      ))}
    </>
  );
}

export default RoutesLayer;
