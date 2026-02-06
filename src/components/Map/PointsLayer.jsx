import { GeoJSON, Popup } from 'react-leaflet';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function PointsLayer({ data }) {
  const pointStyle = (feature) => {
    const categoryColors = {
      'Tự nhiên': '#22c55e',
      'Văn hóa': '#8b5cf6',
      'Lịch sử': '#f59e0b',
      'Tâm linh': '#ec4899',
      'Sinh thái': '#14b8a6',
    };

    return {
      radius: 8,
      fillColor: categoryColors[feature.properties.category] || '#6366f1',
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
    };
  };

  const onEachFeature = (feature, layer) => {
    const props = feature.properties;

    const popupContent = `
      <div class="point-popup" style="min-width: 280px; font-family: system-ui, sans-serif;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 12px; margin: -10px -10px 12px -10px; border-radius: 4px 4px 0 0;">
          <h3 style="margin: 0; color: white; font-size: 16px; font-weight: 600;">${props.name}</h3>
          <span style="color: rgba(255,255,255,0.8); font-size: 12px; display: inline-block; margin-top: 4px; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px;">
            ${props.category}
          </span>
        </div>
        
        <div style="padding: 0 4px;">
          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Vai trò</p>
            <p style="margin: 0; color: #334155; font-size: 13px;">${props.role}</p>
          </div>
          
          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Giá trị nổi bật</p>
            <p style="margin: 0; color: #334155; font-size: 13px; line-height: 1.5;">${props.highlights}</p>
          </div>
          
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
          
          ${props.linkedModule ? `
            <div style="background: #f1f5f9; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">📚 Học phần: <strong style="color: #334155;">${props.linkedModule}</strong></p>
            </div>
          ` : ''}
          
          ${props.assignments && props.assignments.length > 0 ? `
            <button style="width: 100%; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; padding: 10px; border-radius: 6px; font-size: 13px; cursor: pointer; font-weight: 500;">
              📝 Xem bài tập liên quan (${props.assignments.length})
            </button>
          ` : ''}
        </div>
      </div>
    `;

    layer.bindPopup(popupContent, {
      maxWidth: 320,
      className: 'custom-popup',
    });
  };

  const pointToLayer = (feature, latlng) => {
    return L.circleMarker(latlng, pointStyle(feature));
  };

  return (
    <GeoJSON
      data={data}
      pointToLayer={pointToLayer}
      onEachFeature={onEachFeature}
    />
  );
}

export default PointsLayer;
