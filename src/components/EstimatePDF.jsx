import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register a font that supports Vietnamese (Roboto is a good choice if available, or standard)
// Note: Standard PDF fonts don't support Vietnamese well. We often need to register a custom font.
// For now, using standard fonts might cause garbled text for Vietnamese.
// I will try to use a CDN font or fallback.
// actually, standard fonts 'Helvetica' don't support unicode range for VN.
// Let's try to register a font from Google Fonts or similar if possible, or use a local one.
// Since I can't easily download a font right now without extra steps, I'll use standard font and hope for the best,
// BUT I know it will fail for VN.
// Ideally I should include a font file.
// For this environment, I'll use a standard font but warn the user or try to use a generally available unicode font if I can.
// Wait, I can register a font from a URL.

Font.register({
    family: 'Roboto',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf'
});

Font.register({
    family: 'Roboto-Bold',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf'
});

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Roboto',
        fontSize: 10,
        color: '#333'
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    headerLeft: {
        flexDirection: 'column'
    },
    title: {
        fontSize: 18,
        fontFamily: 'Roboto-Bold',
        textTransform: 'uppercase',
        color: '#2563eb'
    },
    subTitle: {
        fontSize: 10,
        color: '#666',
        marginTop: 4
    },
    section: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f8fafc',
        borderRadius: 4
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Roboto-Bold',
        marginBottom: 8,
        color: '#0f172a',
        textTransform: 'uppercase'
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4
    },
    label: {
        width: 100,
        color: '#64748b',
        fontSize: 9
    },
    value: {
        flex: 1,
        fontSize: 9
    },
    // Table
    table: {
        display: 'table',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginBottom: 20
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row'
    },
    tableHeader: {
        backgroundColor: '#f1f5f9',
        fontFamily: 'Roboto-Bold'
    },
    tableCol: {
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: '#e2e8f0',
        padding: 5
    },
    colName: { width: '40%' },
    colQty: { width: '15%', textAlign: 'center' },
    colPrice: { width: '20%', textAlign: 'right' },
    colTotal: { width: '25%', textAlign: 'right' },

    // Footer
    totalSection: {
        marginTop: 20,
        alignItems: 'flex-end'
    },
    totalRow: {
        flexDirection: 'row',
        marginBottom: 5,
        width: 200,
        justifyContent: 'space-between'
    },
    totalLabel: {
        fontFamily: 'Roboto-Bold'
    },
    totalValue: {
        fontSize: 11
    },
    profitValue: {
        fontSize: 12,
        fontFamily: 'Roboto-Bold',
        color: '#059669'
    }
});

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Generic Table Component
const CostTable = ({ title, items, columns }) => {
    if (!items || items.length === 0) return null;
    return (
        <View style={{ marginBottom: 15 }}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.table}>
                {/* Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                    <View style={[styles.tableCol, styles.colName]}><Text>Nội dung</Text></View>
                    <View style={[styles.tableCol, styles.colQty]}><Text>SL</Text></View>
                    <View style={[styles.tableCol, styles.colPrice]}><Text>Đơn giá</Text></View>
                    <View style={[styles.tableCol, styles.colTotal]}><Text>Thành tiền</Text></View>
                </View>
                {/* Rows */}
                {items.map((item, i) => (
                    <View style={styles.tableRow} key={i}>
                        <View style={[styles.tableCol, styles.colName]}><Text>{item.name || item.provider || item.hotel || item.location || item.item}</Text></View>
                        <View style={[styles.tableCol, styles.colQty]}><Text>{item.qty || item.pax || item.roomQty}</Text></View>
                        <View style={[styles.tableCol, styles.colPrice]}><Text>{formatCurrency(item.price || item.priceAdult || 0)}</Text></View>
                        <View style={[styles.tableCol, styles.colTotal]}><Text>{formatCurrency(item.total || item.totalAmount || 0)}</Text></View>
                    </View>
                ))}
            </View>
        </View>
    );
};

const EstimatePDF = ({ data, totals }) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.title}>DỰ TOÁN TOUR</Text>
                    <Text style={styles.subTitle}>Mã: {data.code}</Text>
                </View>
                <View>
                    <Text style={{ fontSize: 9, color: '#999' }}>Ngày: {new Date().toLocaleDateString('vi-VN')}</Text>
                </View>
            </View>

            {/* Info */}
            <View style={styles.section}>
                <View style={styles.row}>
                    <Text style={styles.label}>Tên đoàn:</Text>
                    <Text style={[styles.value, { fontFamily: 'Roboto-Bold' }]}>{data.name}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Hành trình:</Text>
                    <Text style={styles.value}>{data.route}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Thời gian:</Text>
                    <Text style={styles.value}>{data.startDate} - {data.endDate} ({data.days} ngày)</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Khách:</Text>
                    <Text style={styles.value}>{data.guestsCount} khách + {data.paxFOC} FOC</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Điều hành:</Text>
                    <Text style={styles.value}>{data.operator} - {data.contact}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Người liên hệ:</Text>
                    <Text style={styles.value}>{data.contactPerson}</Text>
                </View>
            </View>

            {/* Tables */}
            <CostTable title="DOANH THU" items={data.revenueItems} />
            <CostTable title="ĂN UỐNG" items={data.restaurants} />
            <CostTable title="KHÁCH SẠN" items={data.hotels} />
            <CostTable title="VÉ THAM QUAN" items={data.tickets} />
            <CostTable title="VẬN CHUYỂN" items={data.transport} />
            <CostTable title="CHI PHÍ KHÁC" items={data.others} />

            {/* Summary */}
            <View style={styles.totalSection}>
                <View style={{ width: 200, borderTopWidth: 1, borderColor: '#ccc', paddingTop: 10 }}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tổng Thu:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(totals.revTotal)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tổng Chi:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(totals.costTotal)}</Text>
                    </View>
                    <View style={[styles.totalRow, { marginTop: 5 }]}>
                        <Text style={styles.totalLabel}>Lợi nhuận:</Text>
                        <Text style={styles.profitValue}>{formatCurrency(totals.profit)}</Text>
                    </View>
                </View>
            </View>

        </Page>
    </Document>
);

export default EstimatePDF;
