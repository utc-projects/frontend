import { GeoJSON } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import L from 'leaflet';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function ProvidersLayer({ data, visibleTypes, selectedLocation }) {
  // Filter features by visible types
  const filteredData = {
    ...data,
    features: data.features.filter(f => visibleTypes[f.properties.serviceType]),
  };

  // Get icon from subTypeInfo if available, otherwise fall back to category icon
  const getMarkerIcon = (feature) => {
    const props = feature.properties;
    if (props.subTypeInfo?.icon) {
      return props.subTypeInfo.icon;
    }
    const icons = {
      accommodation: '🏨',
      dining: '🍜',
      transportation: '🚐',
      entertainment: '🎢',
      support: '🎫',
    };
    return icons[props.serviceType] || '📍';
  };

  const getMarkerColor = (serviceType) => {
    const colors = {
      accommodation: '#22c55e',
      dining: '#f97316',
      transportation: '#06b6d4',
      entertainment: '#ec4899',
      support: '#eab308',
    };
    return colors[serviceType] || '#6366f1';
  };

  const pointToLayer = (feature, latlng) => {
    const icon = L.divIcon({
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: ${getMarkerColor(feature.properties.serviceType)};
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ${feature.properties.isRecommended ? 'border-color: gold; border-width: 3px;' : ''}
        ">
          ${getMarkerIcon(feature)}
        </div>
        ${feature.properties.isRecommended ? '<div style="position: absolute; top: -4px; right: -4px; font-size: 10px;">⭐</div>' : ''}
      `,
      className: 'provider-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    return L.marker(latlng, { icon });
  };

  const onEachFeature = (feature, layer) => {
    const props = feature.properties;

    const priceRangeStyle = {
      'Bình dân': 'background: #dcfce7; color: #166534;',
      'Trung cấp': 'background: #fef3c7; color: #92400e;',
      'Cao cấp': 'background: #fce7f3; color: #9d174d;',
    };

    // Get sub-type label
    const subTypeLabel = props.subTypeInfo?.label || props.categoryInfo?.label || '';

    const popupContent = `
      <div class="provider-popup" style="min-width: 300px; font-family: system-ui, sans-serif;">
        <div style="background: linear-gradient(135deg, ${getMarkerColor(props.serviceType)}, ${getMarkerColor(props.serviceType)}dd); padding: 12px; margin: -10px -10px 12px -10px; border-radius: 4px 4px 0 0;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 28px;">${getMarkerIcon(feature)}</span>
            <div style="flex: 1;">
              <h3 style="margin: 0; color: white; font-size: 15px; font-weight: 600;">${props.name}</h3>
              <span style="color: rgba(255,255,255,0.9); font-size: 12px;">${subTypeLabel}</span>
            </div>
            ${props.isRecommended ? '<span style="background: gold; color: #333; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">✓ Khuyên dùng</span>' : ''}
          </div>
        </div>
        
        <div style="padding: 0 4px;">
          <div style="display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap;">
            <span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; ${priceRangeStyle[props.priceRange] || ''}">
              💰 ${props.priceRange}
            </span>
            <span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; background: #e0e7ff; color: #3730a3;">
              📍 ${props.serviceArea}
            </span>
            ${props.rating ? `
              <span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; background: #fef3c7; color: #92400e;">
                ⭐ ${props.rating}
              </span>
            ` : ''}
          </div>
          
          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Địa chỉ</p>
            <p style="margin: 0; color: #334155; font-size: 13px;">${props.address}</p>
          </div>
          
          ${props.description ? `
            <div style="margin-bottom: 12px;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Mô tả</p>
              <p style="margin: 0; color: #334155; font-size: 13px; line-height: 1.5;">${props.description}</p>
            </div>
          ` : ''}

          ${props.educationalNotes ? `
            <div style="margin-bottom: 12px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 10px;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">📚 Giá trị học liệu</p>
              <p style="margin: 0; color: #166534; font-size: 12px; line-height: 1.5;">${props.educationalNotes}</p>
            </div>
          ` : ''}
          
          ${(() => {
        const mediaList = [
          ...(props.images || []).map(img => ({ type: 'image', src: `${API_URL}/${img}` })),
          ...(props.videos || []).map(vid => ({ type: 'video', src: `${API_URL}/${vid}` }))
        ];
        const mediaListJson = JSON.stringify(mediaList).replace(/"/g, '&quot;');

        let html = '';

        if (props.images && props.images.length > 0) {
          html += `
                <div style="margin-bottom: 12px;">
                  <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Hình ảnh</p>
                  <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 4px;">
                    ${props.images.map((img, idx) => `
                        <div 
                            onclick='window.dispatchEvent(new CustomEvent("open-media-viewer", { detail: { items: ${mediaListJson}, index: ${idx} } }))'
                            style="flex: 0 0 80px; height: 60px; border-radius: 4px; overflow: hidden; border: 1px solid #e2e8f0; cursor: pointer; transition: opacity 0.2s;"
                            onmouseover="this.style.opacity=0.8"
                            onmouseout="this.style.opacity=1"
                        >
                             <img src="${API_URL}/${img}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://via.placeholder.com/80?text=Error'"/>
                        </div>
                    `).join('')}
                  </div>
                </div>`;
        }

        if (props.videos && props.videos.length > 0) {
          const videoStartIndex = (props.images || []).length;
          html += `
                <div style="margin-bottom: 12px;">
                   <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Video</p>
                    <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 4px;">
                      ${props.videos.map((vid, idx) => `
                          <div 
                            onclick='window.dispatchEvent(new CustomEvent("open-media-viewer", { detail: { items: ${mediaListJson}, index: ${videoStartIndex + idx} } }))'
                            style="flex: 0 0 100px; height: 70px; border-radius: 4px; overflow: hidden; border: 1px solid #e2e8f0; background: #000; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative;"
                          >
                             <video src="${API_URL}/${vid}" style="width: 100%; height: 100%; object-fit: cover;"></video>
                             <div style="position: absolute; width: 24px; height: 24px; background: rgba(0,0,0,0.5); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                             </div>
                          </div>
                      `).join('')}
                    </div>
                </div>`;
        }
        return html;
      })()}
          
          ${props.contact?.phone || props.contact?.website ? `
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${props.contact?.phone ? `
                <a href="tel:${props.contact.phone}" style="flex: 1; display: block; background: #f1f5f9; color: #334155; text-decoration: none; padding: 8px 12px; border-radius: 6px; font-size: 12px; text-align: center;">
                  📞 ${props.contact.phone}
                </a>
              ` : ''}
              ${props.contact?.website ? `
                <a href="${props.contact.website}" target="_blank" style="flex: 1; display: block; background: #0ea5e9; color: white; text-decoration: none; padding: 8px 12px; border-radius: 6px; font-size: 12px; text-align: center;">
                  🌐 Website
                </a>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    layer.bindPopup(popupContent, {
      maxWidth: 340,
      className: 'custom-popup',
    });
  };

  if (filteredData.features.length === 0) {
    return null;
  }

  const geoJsonRef = useRef(null);

  useEffect(() => {
    if (selectedLocation && selectedLocation.type === 'provider' && geoJsonRef.current) {
      // Timeout to ensure layer render if data changed (though data usually static here)
      setTimeout(() => {
        if (geoJsonRef.current) {
          const layers = geoJsonRef.current.getLayers();
          const targetLayer = layers.find(layer =>
            layer.feature && layer.feature.properties._id === selectedLocation.item.properties._id
          );

          if (targetLayer) {
            targetLayer.openPopup();
          }
        }
      }, 100);
    }
  }, [selectedLocation, visibleTypes]);

  return (
    <GeoJSON
      ref={geoJsonRef}
      key={Object.entries(visibleTypes).filter(([k, v]) => v).map(([k]) => k).join('-')}
      data={filteredData}
      pointToLayer={pointToLayer}
      onEachFeature={onEachFeature}
    />
  );
}

export default ProvidersLayer;
