import { useState } from 'react';
import { Layers } from 'lucide-react';

function LayerControl({ layers, toggleLayer }) {
    const [isOpen, setIsOpen] = useState(true);

    const layerItems = [
        { key: 'routes', label: 'Tuyến du lịch', icon: '🗺️' },
        { key: 'points', label: 'Điểm du lịch', icon: '📍' },
    ];

    return (
        <div className="absolute top-4 right-4 z-[1000]">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute top-0 right-0 p-2.5 bg-white rounded-xl shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                title="Lớp bản đồ"
            >
                <Layers className="w-5 h-5 text-slate-600" />
            </button>

            {/* Panel */}
            {isOpen && (
                <div className="mt-12 bg-white rounded-xl shadow-lg border border-slate-200 p-4 min-w-[200px]">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-slate-400" />
                        Lớp bản đồ
                    </h3>

                    <div className="space-y-2">
                        {layerItems.map(item => (
                            <label
                                key={item.key}
                                className="flex items-center gap-3 cursor-pointer group py-1"
                            >
                                <input
                                    type="checkbox"
                                    checked={layers[item.key]}
                                    onChange={() => toggleLayer(item.key)}
                                    className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0"
                                />
                                <span className="text-lg">{item.icon}</span>
                                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                                    {item.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LayerControl;
