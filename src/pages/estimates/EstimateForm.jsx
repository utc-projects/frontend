import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, Calendar, Users, DollarSign, Copy, Utensils, Bed, Ticket, Bus, Layers, MapPin, Mail, Phone, User, Download, FileText, Loader2 } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import EstimatePDF from '../../components/EstimatePDF';
import api from '../../services/api';

// --- UI COMPONENTS ---

const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden ${className}`}>
        {children}
    </div>
);

const SectionTitle = ({ icon: Icon, title, color = "text-slate-800", total = null }) => (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
            {Icon && <Icon size={18} className={color} />}
            <h3 className="font-bold text-sm uppercase text-slate-700">{title}</h3>
        </div>
        {total !== null && (
            <div className="text-xs font-semibold text-slate-500 bg-white px-2 py-1 rounded border">
                Tổng: <span className="text-slate-900">{total.toLocaleString()}</span>
            </div>
        )}
    </div>
);

const InputGroup = ({ label, value, onChange, type = "text", placeholder = "", readOnly = false, className = "", error, min }) => (
    <div className={`flex flex-col ${className}`}>
        {label && <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>}
        <input
            type={type}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            placeholder={placeholder}
            min={min}
            className={`w-full px-3 py-2 bg-white border ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'} rounded text-sm text-slate-700 outline-none focus:ring-1 transition-all ${readOnly ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
        />
        {error && <span className="text-red-500 text-xs mt-1 font-medium">{error}</span>}
    </div>
);

const CurrencyInput = ({ value, onChange, className = "", readOnly = false }) => {
    const format = (val) => {
        if (!val && val !== 0) return "";
        return new Intl.NumberFormat('en-US').format(val);
    };
    const handleChange = (e) => {
        const rawValue = e.target.value.replace(/,/g, '');
        if (!isNaN(rawValue)) onChange(Number(rawValue));
    };
    return (
        <input
            type="text"
            value={format(value)}
            onChange={handleChange}
            readOnly={readOnly}
            className={`w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm text-right text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${readOnly ? 'bg-slate-50 text-slate-500' : ''} ${className}`}
        />
    );
};

// --- MAIN FORM ---

const EstimateForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    // --- STATE ---
    const [general, setGeneral] = useState({
        code: '', name: '', route: '',
        startDate: '', endDate: '', days: 0,
        guestsCount: 0, paxFOC: 0,

        operator: 'Mrs Hường', contactPerson: '', contact: '',
        status: 'Draft'
    });
    const [errors, setErrors] = useState({});

    const [revenueItems, setRevenueItems] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [transport, setTransport] = useState([]);
    const [others, setOthers] = useState([]);

    const payingGuests = Math.max(0, general.guestsCount - general.paxFOC);

    // --- EFFECTS ---
    useEffect(() => {
        if (isEditMode) {
            fetchEstimate();
        } else {
            if (revenueItems.length === 0) setRevenueItems([{ name: 'Tour Fee', paxAdult: 0, priceAdult: 0, paxChild: 0, priceChild: 0, totalAmount: 0 }]);
        }
    }, [id]);

    useEffect(() => {
        if (general.startDate && general.endDate) {
            const start = new Date(general.startDate);
            const end = new Date(general.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            setGeneral(prev => ({ ...prev, days: diffDays > 0 ? diffDays : 0 }));
        }
    }, [general.startDate, general.endDate]);

    const fetchEstimate = async () => {
        try {
            const res = await api.get(`/estimates/${id}`);
            const data = res.data.data;
            setGeneral({
                code: data.code,
                name: data.name,
                route: data.route,
                startDate: data.startDate?.split('T')[0] || '',
                endDate: data.endDate?.split('T')[0] || '',
                days: data.duration,
                guestsCount: data.guestsCount,
                paxFOC: data.paxFOC,
                operator: data.operator,
                contactPerson: data.contactPerson || '',
                contact: data.phone || '',
                status: data.status
            });
            setRevenueItems(data.revenueItems || []);
            setRestaurants(data.restaurants || []);
            setHotels(data.hotels || []);
            setTickets(data.tickets || []);
            setTransport(data.transport || []);
            setOthers(data.others || []);
        } catch (error) { console.error(error); }
    };

    // --- PRINTING REMOVED ---

    // --- CALCS ---
    const calculateTotals = () => {
        const revTotal = revenueItems.reduce((acc, item) => acc + item.totalAmount, 0);
        const restTotal = restaurants.reduce((acc, item) => acc + item.total, 0);
        const hotelTotal = hotels.reduce((acc, item) => acc + item.total, 0);
        const ticketTotal = tickets.reduce((acc, item) => acc + item.total, 0);
        const transTotal = transport.reduce((acc, item) => acc + item.total, 0);
        const otherTotal = others.reduce((acc, item) => acc + item.total, 0);

        const costTotal = restTotal + hotelTotal + ticketTotal + transTotal + otherTotal;
        const profit = revTotal - costTotal;

        return { revTotal, costTotal, profit, restTotal, hotelTotal, ticketTotal, transTotal, otherTotal };
    };

    const totals = calculateTotals();

    const validate = () => {
        const newErrors = {};
        if (!general.code?.trim()) newErrors.code = 'Vui lòng nhập mã đoàn';
        if (!general.name?.trim()) newErrors.name = 'Vui lòng nhập tên đoàn';
        if (!general.startDate) newErrors.startDate = 'Vui lòng chọn ngày đi';
        if (!general.endDate) newErrors.endDate = 'Vui lòng chọn ngày về';
        if (!general.guestsCount || general.guestsCount <= 0) newErrors.guestsCount = 'Số khách phải > 0';

        if (!general.operator?.trim()) newErrors.operator = 'Vui lòng nhập người điều hành';
        if (!general.contactPerson?.trim()) newErrors.contactPerson = 'Vui lòng nhập người liên hệ';
        if (!general.contact?.trim()) newErrors.contact = 'Vui lòng nhập số ĐT/Email';
        if (!general.route?.trim()) newErrors.route = 'Vui lòng nhập hành trình';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- ACTIONS ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const payload = {
            ...general, duration: general.days, phone: general.contact,
            revenueItems, restaurants, hotels, tickets, transport, others,
            totalRevenue: totals.revTotal, totalNetCost: totals.costTotal, expectedProfit: totals.profit
        };
        try {
            if (isEditMode) {
                await api.put(`/estimates/${id}`, payload);
                alert('Cập nhật thành công!');
            } else {
                await api.post('/estimates', payload);
                alert('Tạo mới thành công!');
                navigate('/estimates');
            }
        } catch (error) { alert('Lỗi: ' + error.message); }
    };

    // --- HELPERS ---
    const addItem = (setter, items, def) => setter([...items, def]);
    const removeItem = (setter, items, idx) => setter(items.filter((_, i) => i !== idx));
    const updateItem = (setter, items, idx, field, val, calc) => {
        const newItems = [...items];
        newItems[idx][field] = val;
        if (calc) calc(newItems[idx]);
        setter(newItems);
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-20 font-sans">

            {/* TOP HEADER */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/estimates')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors print:hidden"><ArrowLeft size={20} /></button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                {isEditMode ? `Chỉnh sửa Dự toán: ${general.code}` : 'Tạo Dự toán mới'}
                                <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase tracking-wide border border-yellow-200">
                                    {general.status === 'Official' ? 'Chính thức' : 'Bản thảo'}
                                </span>
                            </h1>
                            <p className="text-xs text-slate-400 mt-0.5">Cập nhật lần cuối: Vừa xong</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 print:hidden">
                        {isEditMode && (
                            <button
                                onClick={() => setGeneral({ ...general, status: general.status === 'Official' ? 'Draft' : 'Official' })}
                                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all shadow-sm ${general.status === 'Official' ? 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100' : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'}`}
                            >
                                {general.status === 'Official' ? 'Về Bản thảo' : 'Chốt Chính thức'}
                            </button>
                        )}
                        {isEditMode && (
                            <PDFDownloadLink
                                document={<EstimatePDF data={{ ...general, revenueItems, restaurants, hotels, tickets, transport, others }} totals={totals} />}
                                fileName={`Estimate_${general.code || 'export'}.pdf`}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium transition-all shadow-sm"
                            >
                                {({ blob, url, loading, error }) => (
                                    <>
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                                        {loading ? 'Đang tạo...' : 'Xuất PDF'}
                                    </>
                                )}
                            </PDFDownloadLink>
                        )}
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium transition-all shadow-sm">
                            <Copy size={16} /> Sao chép
                        </button>
                        <button onClick={handleSubmit} className="flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-bold shadow-md shadow-teal-600/20 transition-all">
                            <Save size={18} /> {isEditMode ? 'Cập nhật' : 'Lưu'}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8" id="estimate-form-content">

                {/* 1. INFO CARD */}
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
                        <div className="p-1.5 bg-teal-50 text-teal-600 rounded"><User size={18} /></div>
                        <h2 className="font-bold text-slate-800 uppercase text-sm">Thông tin chung</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputGroup label="Mã đoàn" value={general.code} onChange={e => { setGeneral({ ...general, code: e.target.value }); if (errors.code) setErrors({ ...errors, code: '' }); }} error={errors.code} />
                        <InputGroup label="Tên đoàn / Khách hàng" value={general.name} onChange={e => { setGeneral({ ...general, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: '' }); }} error={errors.name} />
                        <InputGroup label="Tổng số khách" type="number" value={general.guestsCount} onChange={e => { setGeneral({ ...general, guestsCount: Number(e.target.value) }); if (errors.guestsCount) setErrors({ ...errors, guestsCount: '' }); }} className="font-bold" error={errors.guestsCount} />

                        <InputGroup label="Ngày khởi hành" type="date" value={general.startDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={e => {
                                setGeneral({ ...general, startDate: e.target.value, endDate: '' });
                                if (errors.startDate) setErrors({ ...errors, startDate: '' });
                            }}
                            error={errors.startDate}
                        />
                        <InputGroup label="Ngày kết thúc" type="date" value={general.endDate}
                            min={general.startDate || new Date().toISOString().split('T')[0]}
                            onChange={e => { setGeneral({ ...general, endDate: e.target.value }); if (errors.endDate) setErrors({ ...errors, endDate: '' }); }}
                            error={errors.endDate}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Số ngày" value={general.days} readOnly />
                            <InputGroup label="Điều hành" value={general.operator} onChange={e => { setGeneral({ ...general, operator: e.target.value }); if (errors.operator) setErrors({ ...errors, operator: '' }); }} error={errors.operator} />
                        </div>

                        <InputGroup label="Người liên hệ" value={general.contactPerson} onChange={e => { setGeneral({ ...general, contactPerson: e.target.value }); if (errors.contactPerson) setErrors({ ...errors, contactPerson: '' }); }} placeholder="Nguyễn Văn A" error={errors.contactPerson} />
                        <InputGroup label="Số ĐT/Email" value={general.contact} onChange={e => { setGeneral({ ...general, contact: e.target.value }); if (errors.contact) setErrors({ ...errors, contact: '' }); }} placeholder="0912..." error={errors.contact} />
                        <InputGroup label="Hành trình" value={general.route} onChange={e => { setGeneral({ ...general, route: e.target.value }); if (errors.route) setErrors({ ...errors, route: '' }); }} placeholder="HN -..." error={errors.route} />
                    </div>
                </Card>


                <Card>
                    <SectionTitle icon={DollarSign} title="Nguồn thu (Doanh thu)" />
                    <div className="p-4">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase">
                                <tr>
                                    <th className="px-3 py-2 text-left">Nội dung</th>
                                    <th className="px-3 py-2 text-center w-24">Số lượng</th>
                                    <th className="px-3 py-2 text-right w-40">Đơn giá</th>
                                    <th className="px-3 py-2 text-right w-40">Thành tiền</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {revenueItems.map((item, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50">
                                        <td className="p-2"><input type="text" className="w-full bg-transparent outline-none font-medium text-slate-700" value={item.name} onChange={e => updateItem(setRevenueItems, revenueItems, i, 'name', e.target.value)} /></td>
                                        <td className="p-2 text-center"><input type="number" className="w-full text-center bg-transparent outline-none" value={item.paxAdult} onChange={e => updateItem(setRevenueItems, revenueItems, i, 'paxAdult', Number(e.target.value), r => r.totalAmount = r.paxAdult * r.priceAdult + r.paxChild * r.priceChild)} /></td>
                                        <td className="p-2 text-right"><CurrencyInput value={item.priceAdult} onChange={v => updateItem(setRevenueItems, revenueItems, i, 'priceAdult', v, r => r.totalAmount = r.paxAdult * r.priceAdult + r.paxChild * r.priceChild)} /></td>
                                        <td className="p-2 text-right font-bold text-slate-700">{item.totalAmount.toLocaleString()}</td>
                                        <td className="p-2 text-center"><button onClick={() => removeItem(setRevenueItems, revenueItems, i)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={() => addItem(setRevenueItems, revenueItems, { name: '', paxAdult: payingGuests, priceAdult: 0, paxChild: 0, priceChild: 0, totalAmount: 0 })} className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 uppercase">+ Thêm dòng</button>
                    </div>
                </Card>

                {/* COST GRIDS */}
                <div className="grid grid-cols-1 gap-8">

                    {/* RESTAURANTS */}
                    <Card>
                        <SectionTitle icon={Utensils} title="Ăn uống" total={totals.restTotal} color="text-orange-500" />
                        <div className="p-4">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Nhà hàng/Món</th>
                                        <th className="px-3 py-2 text-center w-24">Bữa</th>
                                        <th className="px-3 py-2 text-center w-24">Pax</th>
                                        <th className="px-3 py-2 text-center w-16">Lần</th>
                                        <th className="px-3 py-2 text-right w-32">Giá</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-600">
                                    {restaurants.map((item, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50">
                                            <td className="p-2"><input className="w-full outline-none bg-transparent" value={item.provider} onChange={e => updateItem(setRestaurants, restaurants, i, 'provider', e.target.value)} placeholder="Nhập tên..." /></td>
                                            <td className="p-2"><input className="w-full outline-none bg-transparent text-center" value={item.mealType} onChange={e => updateItem(setRestaurants, restaurants, i, 'mealType', e.target.value)} /></td>
                                            <td className="p-2"><input type="number" className="w-full outline-none bg-transparent text-center" value={item.pax} onChange={e => updateItem(setRestaurants, restaurants, i, 'pax', Number(e.target.value), r => r.total = r.pax * r.sessions * r.price)} /></td>
                                            <td className="p-2"><input type="number" className="w-full outline-none bg-transparent text-center" value={item.sessions} onChange={e => updateItem(setRestaurants, restaurants, i, 'sessions', Number(e.target.value), r => r.total = r.pax * r.sessions * r.price)} /></td>
                                            <td className="p-2 text-right"><CurrencyInput value={item.price} onChange={v => updateItem(setRestaurants, restaurants, i, 'price', v, r => r.total = r.pax * r.sessions * r.price)} /></td>
                                            <td className="p-2 text-center"><button onClick={() => removeItem(setRestaurants, restaurants, i)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={() => addItem(setRestaurants, restaurants, { provider: '', mealType: 'trưa', pax: payingGuests, sessions: 1, price: 0, total: 0 })} className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 uppercase">+ Thêm dòng</button>
                        </div>
                    </Card>

                    {/* HOTELS */}
                    <Card>
                        <SectionTitle icon={Bed} title="Khách sạn (K/S)" total={totals.hotelTotal} color="text-blue-500" />
                        <div className="p-4">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Khách sạn</th>
                                        <th className="px-3 py-2 text-center w-24">Loại</th>
                                        <th className="px-3 py-2 text-center w-24">P.g</th>
                                        <th className="px-3 py-2 text-center w-16">Đêm</th>
                                        <th className="px-3 py-2 text-right w-32">Giá</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-600">
                                    {hotels.map((item, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50">
                                            <td className="p-2"><input className="w-full outline-none bg-transparent" value={item.hotel} onChange={e => updateItem(setHotels, hotels, i, 'hotel', e.target.value)} placeholder="Tên khách sạn..." /></td>
                                            <td className="p-2"><input className="w-full outline-none bg-transparent text-center" value={item.roomType} onChange={e => updateItem(setHotels, hotels, i, 'roomType', e.target.value)} /></td>
                                            <td className="p-2"><input type="number" className="w-full outline-none bg-transparent text-center" value={item.roomQty} onChange={e => updateItem(setHotels, hotels, i, 'roomQty', Number(e.target.value), r => r.total = r.roomQty * r.nights * r.price)} /></td>
                                            <td className="p-2"><input type="number" className="w-full outline-none bg-transparent text-center" value={item.nights} onChange={e => updateItem(setHotels, hotels, i, 'nights', Number(e.target.value), r => r.total = r.roomQty * r.nights * r.price)} /></td>
                                            <td className="p-2 text-right"><CurrencyInput value={item.price} onChange={v => updateItem(setHotels, hotels, i, 'price', v, r => r.total = r.roomQty * r.nights * r.price)} /></td>
                                            <td className="p-2 text-center"><button onClick={() => removeItem(setHotels, hotels, i)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={() => addItem(setHotels, hotels, { hotel: '', roomType: 'TWN', roomQty: 1, nights: 1, price: 0, total: 0 })} className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 uppercase">+ Thêm dòng</button>
                        </div>
                    </Card>

                    {/* TICKETS */}
                    <Card>
                        <SectionTitle icon={Ticket} title="Vé thắng cảnh" total={totals.ticketTotal} color="text-green-600" />
                        <div className="p-4">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Điểm tham quan</th>
                                        <th className="px-3 py-2 text-center w-24">Loại</th>
                                        <th className="px-3 py-2 text-center w-24">Pax</th>
                                        <th className="px-3 py-2 text-right w-32">Giá vé</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-600">
                                    {tickets.map((item, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50">
                                            <td className="p-2"><input className="w-full outline-none bg-transparent" value={item.location} onChange={e => updateItem(setTickets, tickets, i, 'location', e.target.value)} placeholder="Địa điểm..." /></td>
                                            <td className="p-2"><input className="w-full outline-none bg-transparent text-center" value={item.object} onChange={e => updateItem(setTickets, tickets, i, 'object', e.target.value)} /></td>
                                            <td className="p-2"><input type="number" className="w-full outline-none bg-transparent text-center" value={item.pax} onChange={e => updateItem(setTickets, tickets, i, 'pax', Number(e.target.value), r => r.total = r.pax * r.price)} /></td>
                                            <td className="p-2 text-right"><CurrencyInput value={item.price} onChange={v => updateItem(setTickets, tickets, i, 'price', v, r => r.total = r.pax * r.price)} /></td>
                                            <td className="p-2 text-center"><button onClick={() => removeItem(setTickets, tickets, i)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={() => addItem(setTickets, tickets, { location: '', object: 'NL', pax: payingGuests, price: 0, total: 0 })} className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 uppercase">+ Thêm dòng</button>
                        </div>
                    </Card>

                    {/* TRANSPORT */}
                    <Card>
                        <SectionTitle icon={Bus} title="Vận chuyển" total={totals.transTotal} color="text-purple-600" />
                        <div className="p-4">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Phương tiện</th>
                                        <th className="px-3 py-2 text-center w-24">Loại</th>
                                        <th className="px-3 py-2 text-center w-24">SL</th>
                                        <th className="px-3 py-2 text-right w-32">Giá xe</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-600">
                                    {transport.map((item, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50">
                                            <td className="p-2"><input className="w-full outline-none bg-transparent" value={item.name} onChange={e => updateItem(setTransport, transport, i, 'name', e.target.value)} placeholder="Tên xe..." /></td>
                                            <td className="p-2"><input className="w-full outline-none bg-transparent text-center" value={item.type} onChange={e => updateItem(setTransport, transport, i, 'type', e.target.value)} /></td>
                                            <td className="p-2"><input type="number" className="w-full outline-none bg-transparent text-center" value={item.qty} onChange={e => updateItem(setTransport, transport, i, 'qty', Number(e.target.value), r => r.total = r.qty * r.price)} /></td>
                                            <td className="p-2 text-right"><CurrencyInput value={item.price} onChange={v => updateItem(setTransport, transport, i, 'price', v, r => r.total = r.qty * r.price)} /></td>
                                            <td className="p-2 text-center"><button onClick={() => removeItem(setTransport, transport, i)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={() => addItem(setTransport, transport, { name: '', type: '45 chỗ', qty: 1, price: 0, total: 0 })} className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 uppercase">+ Thêm dòng</button>
                        </div>
                    </Card>

                    {/* OTHERS (Full width) */}
                    <Card>
                        <SectionTitle icon={Layers} title="Chi phí khác" total={totals.otherTotal} color="text-gray-600" />
                        <div className="p-4">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Hạng mục</th>
                                        <th className="px-3 py-2 text-center w-24">Số lượng</th>
                                        <th className="px-3 py-2 text-center w-24">Pax</th>
                                        <th className="px-3 py-2 text-right w-32">Đơn giá</th>
                                        <th className="px-3 py-2 text-right w-32">Thành tiền</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-600">
                                    {others.map((item, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50">
                                            <td className="p-2"><input className="w-full outline-none bg-transparent" value={item.item} onChange={e => updateItem(setOthers, others, i, 'item', e.target.value)} placeholder="Tên chi phí..." /></td>
                                            <td className="p-2"><input type="number" className="w-full outline-none bg-transparent text-center" value={item.qty} onChange={e => updateItem(setOthers, others, i, 'qty', Number(e.target.value), r => r.total = r.qty * r.price)} /></td>
                                            <td className="p-2"><input type="number" className="w-full outline-none bg-transparent text-center" value={item.pax} onChange={e => updateItem(setOthers, others, i, 'pax', Number(e.target.value))} /></td>
                                            <td className="p-2 text-right"><CurrencyInput value={item.price} onChange={v => updateItem(setOthers, others, i, 'price', v, r => r.total = r.qty * r.price)} /></td>
                                            <td className="p-2 text-right font-medium relative">
                                                {item.total.toLocaleString()}
                                            </td>
                                            <td className="p-2 text-center"><button onClick={() => removeItem(setOthers, others, i)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={() => addItem(setOthers, others, { item: '', qty: 1, pax: payingGuests, price: 0, total: 0 })} className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 uppercase">+ Thêm dòng</button>
                        </div>
                    </Card>

                </div>

                {/* SUMMARY BAR */}
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-end gap-12 relative overflow-hidden">
                    {/* Decor */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 uppercase">Doanh thu</span>
                        <span className="text-xl font-bold text-slate-700">{totals.revTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 uppercase">Chi phí</span>
                        <span className="text-xl font-bold text-slate-700">{totals.costTotal.toLocaleString()}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 uppercase">Lợi nhuận</span>
                        <span className={`text-2xl font-bold ${totals.profit >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
                            {totals.profit.toLocaleString()}
                        </span>
                    </div>
                </div>

            </main>


        </div>
    );
};

export default EstimateForm;
