import { GeoJSON } from 'react-leaflet';

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

  const onEachFeature = (feature, layer) => {

    const props = feature.properties;

    const popupContent = `
      <div class="route-popup" style="min-width: 280px; font-family: system-ui, sans-serif;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 12px; margin: -10px -10px 12px -10px; border-radius: 4px 4px 0 0;">
          <h3 style="margin: 0; color: white; font-size: 16px; font-weight: 600;">🗺️ ${props.routeName}</h3>
          ${props.isRoadRoute ? '<span style="color: rgba(255,255,255,0.8); font-size: 10px; background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; margin-top: 4px; display: inline-block;">🛣️ Đường bộ thực tế</span>' : ''}
        </div>
        
        <div style="padding: 0 4px;">
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
    <GeoJSON
      key={selectedRoute || 'routes'} // Force re-render when selection changes
      data={data}
      style={routeStyle}
      onEachFeature={onEachFeature}
    />
  );
}

export default RoutesLayer;
