import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import assignmentService from '../../services/assignmentService';
import classService from '../../services/classService';
import {
    BookOpen, Plus, Search, Edit2, Trash2, X,
    Calendar, FileText, CheckCircle, Loader2
} from 'lucide-react';
import dayjs from 'dayjs';

function AssignmentsPage() {
    const navigate = useNavigate();
    const { user, isLecturer, isAdmin } = useAuth();
    const canManage = isLecturer || isAdmin;

    const [assignments, setAssignments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('all');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedClass: '',
        dueDate: '',
        maxScore: 10,
        requirements: ''
    });

    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [assignmentsRes, classesRes] = await Promise.all([
                assignmentService.getAll(),
                classService.getAll()
            ]);
            setAssignments(assignmentsRes.assignments);
            setClasses(classesRes.classes);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (assignment = null) => {
        if (assignment) {
            setEditingAssignment(assignment);
            setFormData({
                title: assignment.title,
                description: assignment.description || '',
                assignedClass: assignment.assignedClass?._id || '',
                dueDate: assignment.dueDate ? dayjs(assignment.dueDate).format('YYYY-MM-DDTHH:mm') : '',
                maxScore: assignment.maxScore || 10,
                requirements: assignment.requirements || ''
            });
        } else {
            setEditingAssignment(null);
            setFormData({
                title: '',
                description: '',
                assignedClass: '',
                dueDate: '',
                maxScore: 10,
                requirements: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAssignment(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const data = {
                ...formData,
                assignedClass: formData.assignedClass || null // Handle empty string
            };

            if (editingAssignment) {
                await assignmentService.update(editingAssignment._id, data);
            } else {
                await assignmentService.create(data);
            }
            handleCloseModal();
            fetchData();
        } catch (error) {
            console.error('Error saving assignment:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await assignmentService.delete(id);
            setDeleteConfirm(null);
            fetchData();
        } catch (error) {
            console.error('Error deleting assignment:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    // Filter assignments
    const filteredAssignments = assignments.filter(assignment => {
        const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = filterClass === 'all' ||
            (assignment.assignedClass && assignment.assignedClass._id === filterClass);

        return matchesSearch && matchesClass;
    });

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 mb-2 flex items-center gap-3">
                            <span className="p-2 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
                                <FileText className="w-6 h-6" />
                            </span>
                            Quản lý Bài tập
                        </h1>
                        <p className="text-slate-500 text-lg ml-1">
                            {canManage ? 'Quản lý bài tập và giao bài cho lớp học.' : 'Danh sách bài tập của bạn.'}
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm bài tập..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none w-full md:w-64"
                            />
                        </div>

                        <select
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                        >
                            <option value="all">Tất cả lớp học</option>
                            {classes.map(cls => (
                                <option key={cls._id} value={cls._id}>{cls.name} ({cls.code})</option>
                            ))}
                        </select>

                        {canManage && (
                            <button
                                onClick={() => handleOpenModal()}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" />
                                Tạo Bài tập
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : filteredAssignments.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">Chưa có bài tập nào</h3>
                        <p className="text-slate-500 mt-2">Hãy tạo bài tập mới để giao cho sinh viên.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAssignments.map((assignment) => (
                            <div key={assignment._id} className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col">
                                <div className="p-6 flex-grow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                                            <BookOpen className="w-3 h-3" />
                                            {assignment.assignedClass ? assignment.assignedClass.code : 'Chung'}
                                        </div>
                                        {canManage && (
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(assignment)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(assignment)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                        {assignment.title}
                                    </h3>

                                    <p className="text-slate-500 text-sm mb-4 line-clamp-3">
                                        {assignment.description || 'Không có mô tả'}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {assignment.dueDate ? dayjs(assignment.dueDate).format('DD/MM/YYYY HH:mm') : 'Không thời hạn'}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle className="w-4 h-4 text-slate-400" />
                                            {assignment.maxScore} điểm
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                                    <button className="w-full py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
                            <h2 className="text-lg font-bold text-slate-800">
                                {editingAssignment ? 'Chỉnh sửa Bài tập' : 'Tạo Bài tập mới'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Tiêu đề bài tập <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                    placeholder="Nhập tiêu đề bài tập"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Lớp học phần <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                                    </label>
                                    <select
                                        value={formData.assignedClass}
                                        onChange={(e) => setFormData({ ...formData, assignedClass: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                    >
                                        <option value="">-- Chọn lớp học --</option>
                                        {classes.map(cls => (
                                            <option key={cls._id} value={cls._id}>{cls.name} - {cls.code}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Hạn nộp
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Mô tả chi tiết
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="4"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none"
                                    placeholder="Mô tả nội dung bài tập..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Yêu cầu nộp bài
                                </label>
                                <textarea
                                    value={formData.requirements}
                                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none"
                                    placeholder="Yêu cầu cụ thể về định dạng, nội dung..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Điểm tối đa
                                </label>
                                <input
                                    type="number"
                                    value={formData.maxScore}
                                    onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                    min="0"
                                    max="100"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                                    {editingAssignment ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Xác nhận xóa</h3>
                        <p className="text-slate-500 mb-6">
                            Bạn có chắc chắn muốn xóa bài tập <strong>{deleteConfirm.title}</strong>?
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-all"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm._id)}
                                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AssignmentsPage;
