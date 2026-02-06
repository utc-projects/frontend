import { Link } from 'react-router-dom';

function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="text-center max-w-4xl mx-auto">
                {/* Hero Section */}
                <div className="mb-8">
                    <span className="text-6xl mb-4 block">🗺️</span>
                    <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-6">
                        Hệ thống Quản lý Du lịch
                    </h1>
                    <p className="text-xl text-slate-300 mb-2">
                        Nền tảng học liệu số cho sinh viên ngành Du lịch
                    </p>
                    <p className="text-slate-400">
                        Khám phá tuyến điểm du lịch Việt Nam qua bản đồ tương tác
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-left hover:border-purple-500/50 transition-all">
                        <span className="text-3xl mb-3 block">📍</span>
                        <h3 className="text-lg font-semibold text-white mb-2">Điểm du lịch</h3>
                        <p className="text-sm text-slate-400">Khám phá các điểm du lịch nổi bật với thông tin giá trị học thuật</p>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-left hover:border-pink-500/50 transition-all">
                        <span className="text-3xl mb-3 block">🛤️</span>
                        <h3 className="text-lg font-semibold text-white mb-2">Tuyến du lịch</h3>
                        <p className="text-sm text-slate-400">Phân tích các tuyến du lịch với gợi ý khai thác chuyên nghiệp</p>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-left hover:border-cyan-500/50 transition-all">
                        <span className="text-3xl mb-3 block">🏨</span>
                        <h3 className="text-lg font-semibold text-white mb-2">Nhà cung cấp</h3>
                        <p className="text-sm text-slate-400">Quản lý 5 nhóm dịch vụ: lưu trú, ăn uống, vận chuyển...</p>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/map"
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                    >
                        <span>🗺️</span>
                        Mở Bản đồ Du lịch
                    </Link>
                    <a
                        href="/api/health"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-4 bg-slate-800/50 text-white font-semibold rounded-xl border border-slate-700 hover:border-purple-500 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <span>🔧</span>
                        API Status
                    </a>
                </div>

                {/* Stats */}
                <div className="mt-12 flex justify-center gap-8 text-center">
                    <div>
                        <p className="text-3xl font-bold text-purple-400">8</p>
                        <p className="text-sm text-slate-400">Điểm du lịch</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-pink-400">2</p>
                        <p className="text-sm text-slate-400">Tuyến mẫu</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-cyan-400">8</p>
                        <p className="text-sm text-slate-400">Nhà cung cấp</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 text-slate-500 text-sm">
                    <p>📚 Học phần: Tuyến điểm du lịch Việt Nam</p>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
