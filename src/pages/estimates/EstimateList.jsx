import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Trash2, Edit, Copy, MoreVertical, Calendar, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

const EstimateList = () => {
    const [estimates, setEstimates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const navigate = useNavigate();

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setPage(1); // Reset page on search change
            fetchEstimates();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Fetch on filter/page change
    useEffect(() => {
        fetchEstimates();
    }, [page, limit, statusFilter]);

    // Reset page when status filter changes
    useEffect(() => {
        setPage(1);
    }, [statusFilter]);

    const fetchEstimates = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                search: searchTerm,
                status: statusFilter
            };
            const res = await api.get('/estimates', { params });

            if (res.data.pagination) {
                setEstimates(res.data.data);
                setTotalPages(res.data.pagination.totalPages);
                setTotalItems(res.data.pagination.totalItems);
            } else {
                setEstimates(res.data.data);
                setTotalPages(1);
                setTotalItems(res.data.data.length);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, code) => {
        if (window.confirm(`Bạn có chắc muốn xóa dự toán [${code}] không?`)) {
            try {
                await api.delete(`/estimates/${id}`);
                fetchEstimates(); // Refresh list after delete to keep pagination correct
            } catch (error) {
                alert('Xóa thất bại');
            }
        }
    };

    const handleClone = async (id) => {
        try {
            const res = await api.post(`/estimates/${id}/clone`);
            const newEstimate = res.data.data;
            alert(`Đã sao chép thành công bản ghi mới: ${newEstimate.code}`);
            // Navigate to edit the new clone
            navigate(`/estimates/${newEstimate._id}/edit`);
        } catch (error) {
            console.error(error);
            alert('Sao chép thất bại');
        }
    };

    // Removed client-side filteredEstimates logic, use estimates direct from state

    return (
        <div className="max-w-[1400px] mx-auto p-6 bg-gray-50 min-h-screen">
            {/* Back Button */}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="text-blue-600" /> Quản lý Dự toán Tour
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Danh sách các tour đang lên kế hoạch và báo giá</p>
                </div>
                <Link to="/estimates/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-all">
                    <Plus size={18} /> Tạo Dự toán mới
                </Link>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
                <Search className="text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Tìm kiếm theo mã đoàn, tên khách hàng..."
                    className="flex-1 outline-none text-gray-700"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border-l border-gray-200 pl-4 py-1.5 text-sm text-gray-600 bg-transparent outline-none cursor-pointer hover:text-blue-600"
                >
                    <option value="All">Tất cả trạng thái</option>
                    <option value="Draft">Bản thảo</option>
                    <option value="Official">Chính thức</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
                ) : estimates.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800">Chưa có dự toán nào</h3>
                        <p className="text-gray-500 mb-4">Bắt đầu bằng cách tạo dự toán mới đầu tiên của bạn.</p>
                        <Link to="/estimates/new" className="text-blue-600 font-medium hover:underline">Tạo ngay &rarr;</Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Mã đoàn</th>
                                    <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Khách hàng / Hành trình</th>
                                    <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Thời gian</th>
                                    <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">Doanh thu</th>
                                    <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">Lợi nhuận</th>
                                    <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">Trạng thái</th>
                                    <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {estimates.map(estimate => (
                                    <tr key={estimate._id} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="p-4 font-medium text-blue-600 whitespace-nowrap">
                                            {estimate.code}
                                            <span className="block text-xs text-gray-400 font-normal mt-1">{estimate.operator || '-'}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">{estimate.name}</div>
                                            <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{estimate.route || 'Chưa có lịch trình'}</span>
                                                <span className="text-xs">• {estimate.guestsCount} khách</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                                            {estimate.startDate ? (
                                                <>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={14} className="text-gray-400" />
                                                        {new Date(estimate.startDate).toLocaleDateString('vi-VN')}
                                                    </div>
                                                    <div className="text-xs text-gray-400 ml-5">
                                                        {estimate.duration} ngày
                                                    </div>
                                                </>
                                            ) : <span className="text-gray-400 italic">Chưa chốt</span>}
                                        </td>
                                        <td className="p-4 text-right font-medium text-gray-800">
                                            {estimate.totalRevenue?.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estimate.expectedProfit >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {estimate.expectedProfit?.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${estimate.status === 'Official' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {estimate.status === 'Official' ? 'Chính thức' : 'Nháp'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => navigate(`/estimates/${estimate._id}/edit`)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleClone(estimate._id)}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                    title="Sao chép"
                                                >
                                                    <Copy size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(estimate._id, estimate.code)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                <div className="p-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Hiển thị</span>
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            className="border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white cursor-pointer"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span>bản ghi mỗi trang</span>
                        <span className="ml-2 text-gray-400 border-l border-gray-200 pl-3">
                            Hiển thị {Math.min((page - 1) * limit + 1, totalItems)} - {Math.min(page * limit, totalItems)} trên tổng số {totalItems} bản ghi
                        </span>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(1)}
                                disabled={page === 1}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white text-gray-600 transition-colors text-sm font-medium"
                                title="Trang đầu"
                            >
                                «
                            </button>
                            <button
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white text-gray-600 transition-colors text-sm font-medium"
                            >
                                Trước
                            </button>

                            <div className="flex gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                                    .map((p, index, array) => {
                                        // Add ellipsis
                                        if (index > 0 && array[index - 1] !== p - 1) {
                                            return (
                                                <span key={`ellipsis-${p}`} className="px-2 py-1 text-gray-400">...</span>
                                            );
                                        }
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === p
                                                        ? 'bg-blue-600 text-white shadow-sm'
                                                        : 'text-gray-600 hover:bg-white border border-transparent hover:border-gray-200'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}
                            </div>

                            <button
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white text-gray-600 transition-colors text-sm font-medium"
                            >
                                Sau
                            </button>
                            <button
                                onClick={() => setPage(totalPages)}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white text-gray-600 transition-colors text-sm font-medium"
                                title="Trang cuối"
                            >
                                »
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EstimateList;
