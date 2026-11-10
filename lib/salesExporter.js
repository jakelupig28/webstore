import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  ShadingType
} from 'docx';

const formatPhp = (val) => {
  const num = typeof val === 'number' ? val : parseFloat(val) || 0;
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
  } catch {
    return dateStr;
  }
};

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

const normalizeOrder = (o) => ({
  id: o.id,
  orderNumber: o.order_number || o.orderNumber || `ORD-${o.id}`,
  createdAt: o.created_at || o.createdAt,
  customerName: o.customer_name || o.customerName || 'N/A',
  customerEmail: o.customer_email || o.customerEmail || 'N/A',
  customerPhone: o.customer_phone || o.customerPhone || 'N/A',
  shippingAddress: o.shipping_address || o.shippingAddress || 'N/A',
  city: o.city || 'N/A',
  province: o.province || 'N/A',
  postalCode: o.postal_code || o.postalCode || 'N/A',
  paymentMethod: o.payment_method || o.paymentMethod || 'COD',
  status: o.status || 'Pending',
  totalAmount: Number(o.total_amount || o.totalAmount || 0),
  items: o.items || []
});

/**
 * 1. EXPORT TO EXCEL (.xlsx)
 */
export const exportSalesReportXLSX = (rawOrders = [], metrics = {}) => {
  const orders = rawOrders.map(normalizeOrder);
  const today = new Date().toISOString().slice(0, 10);
  const filename = `LARO_SPORTS_Sales_Report_${today}.xlsx`;

  const rows = [];

  // Title Block
  rows.push(['LARO SPORTS™ — OFFICIAL SALES & REVENUE REPORT']);
  rows.push(['Collection:', 'PAIN STAIN 2025']);
  rows.push(['Exported Date:', new Date().toLocaleString()]);
  rows.push(['Total Orders:', orders.length]);
  rows.push(['Gross Sales:', `PHP ${formatPhp(metrics.totalSales || 0)}`]);
  rows.push(['Average Order Value:', `PHP ${formatPhp(metrics.aov || 0)}`]);
  rows.push(['Completed / Delivered Orders:', metrics.completedCount || 0]);
  rows.push([]);

  // Table Headers
  rows.push([
    'Order #',
    'Date & Time',
    'Customer Name',
    'Customer Email',
    'Phone',
    'Delivery Address',
    'City / Municipality',
    'Province',
    'Postal Code',
    'Items & Sizes',
    'Total Units',
    'Payment Method',
    'Order Status',
    'Order Total (PHP)'
  ]);

  let grandTotal = 0;
  let totalUnits = 0;

  orders.forEach((o) => {
    grandTotal += o.totalAmount;

    const itemsSummary = (o.items || [])
      .map((it) => `${it.title} [Size: ${it.size || 'M'}, Qty: ${it.quantity || 1}]`)
      .join('; ');

    const units = (o.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);
    totalUnits += units;

    rows.push([
      o.orderNumber,
      formatDate(o.createdAt),
      o.customerName,
      o.customerEmail,
      o.customerPhone,
      o.shippingAddress,
      o.city,
      o.province,
      o.postalCode,
      itemsSummary || 'N/A',
      units,
      o.paymentMethod.toUpperCase(),
      o.status.toUpperCase(),
      o.totalAmount
    ]);
  });

  // Summary Row
  rows.push([]);
  rows.push([
    'TOTAL SUMMARY',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'Total Units:',
    totalUnits,
    'Gross Revenue:',
    'PHP',
    grandTotal
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [
    { wch: 20 }, // Order #
    { wch: 22 }, // Date
    { wch: 22 }, // Name
    { wch: 28 }, // Email
    { wch: 16 }, // Phone
    { wch: 32 }, // Address
    { wch: 18 }, // City
    { wch: 18 }, // Province
    { wch: 12 }, // Postal
    { wch: 42 }, // Items
    { wch: 12 }, // Units
    { wch: 18 }, // Payment
    { wch: 16 }, // Status
    { wch: 20 }  // Total
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });
  triggerDownload(blob, filename);
};

/**
 * 2. EXPORT TO PDF (.pdf)
 */
export const exportSalesReportPDF = (rawOrders = [], metrics = {}) => {
  const orders = rawOrders.map(normalizeOrder);
  const today = new Date().toISOString().slice(0, 10);
  const filename = `LARO_SPORTS_Sales_Report_${today}.pdf`;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Dark brand header
  doc.setFillColor(15, 15, 18);
  doc.rect(0, 0, pageWidth, 75, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('LARO SPORTS™', 40, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.text('OFFICIAL SALES & REVENUE REPORT — PAIN STAIN 2025', 40, 54);

  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 40, 36, { align: 'right' });
  doc.text('Confidential Store Analytics', pageWidth - 40, 52, { align: 'right' });

  // KPI Metrics Banner
  const cardY = 90;
  const cardHeight = 48;
  const margin = 40;
  const totalCardsWidth = pageWidth - margin * 2;
  const cardWidth = (totalCardsWidth - 30) / 4;

  const kpis = [
    { label: 'TOTAL REVENUE', val: `PHP ${formatPhp(metrics.totalSales || 0)}` },
    { label: 'TOTAL ORDERS', val: `${orders.length} Orders` },
    { label: 'AVG ORDER VALUE', val: `PHP ${formatPhp(metrics.aov || 0)}` },
    { label: 'COMPLETED / PAID', val: `${metrics.completedCount || 0} Orders` }
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * (cardWidth + 10);
    doc.setFillColor(245, 245, 247);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 4, 4, 'F');
    doc.setDrawColor(220, 220, 225);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 4, 4, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 120);
    doc.text(kpi.label, x + 10, cardY + 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(18, 18, 22);
    doc.text(kpi.val, x + 10, cardY + 36);
  });

  const tableData = orders.map((o) => {
    const itemsSummary = (o.items || [])
      .map((it) => `${it.title} (${it.size || 'M'} x${it.quantity || 1})`)
      .join(', ');

    return [
      o.orderNumber,
      formatDate(o.createdAt),
      o.customerName,
      itemsSummary || 'N/A',
      o.paymentMethod.toUpperCase(),
      o.status.toUpperCase(),
      `PHP ${formatPhp(o.totalAmount)}`
    ];
  });

  doc.autoTable({
    startY: 154,
    head: [['Order #', 'Date & Time', 'Customer', 'Items Ordered', 'Payment', 'Status', 'Total Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [18, 18, 22],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
      cellPadding: 6
    },
    styles: {
      fontSize: 8.5,
      textColor: [30, 30, 35],
      cellPadding: 5,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 90, fontStyle: 'bold' },
      1: { cellWidth: 105 },
      2: { cellWidth: 100 },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 80 },
      5: { cellWidth: 75, fontStyle: 'bold' },
      6: { cellWidth: 95, halign: 'right', fontStyle: 'bold' }
    },
    alternateRowStyles: {
      fillColor: [250, 250, 252]
    },
    margin: { left: 40, right: 40, bottom: 40 },
    didDrawPage: () => {
      const pageH = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text('LARO SPORTS™ • Street Culture • WE ONLY COME OUT AT NIGHT', 40, pageH - 20);
      doc.text(
        `Page ${doc.internal.getNumberOfPages()}`,
        pageWidth - 40,
        pageH - 20,
        { align: 'right' }
      );
    }
  });

  doc.save(filename);
};

/**
 * 3. EXPORT TO WORD (.docx)
 */
export const exportSalesReportDOCX = async (rawOrders = [], metrics = {}) => {
  const orders = rawOrders.map(normalizeOrder);
  const today = new Date().toISOString().slice(0, 10);
  const filename = `LARO_SPORTS_Sales_Report_${today}.docx`;

  const headerBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: '333333' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: '333333' },
    left: { style: BorderStyle.SINGLE, size: 1, color: '333333' },
    right: { style: BorderStyle.SINGLE, size: 1, color: '333333' }
  };

  const cellBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' }
  };

  const summaryTableRows = [
    new TableRow({
      children: [
        new TableCell({
          shading: { fill: '1A1A1A', type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: 'METRIC', bold: true, color: 'FFFFFF' })] })]
        }),
        new TableCell({
          shading: { fill: '1A1A1A', type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: 'VALUE', bold: true, color: 'FFFFFF' })] })]
        })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('Gross Revenue')] }),
        new TableCell({ children: [new Paragraph({ text: `PHP ${formatPhp(metrics.totalSales || 0)}`, bold: true })] })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('Total Orders Processed')] }),
        new TableCell({ children: [new Paragraph(`${orders.length} Orders`)] })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('Average Order Value (AOV)')] }),
        new TableCell({ children: [new Paragraph(`PHP ${formatPhp(metrics.aov || 0)}`)] })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('Completed Orders')] }),
        new TableCell({ children: [new Paragraph(`${metrics.completedCount || 0} Orders`)] })
      ]
    })
  ];

  const orderTableHeaders = [
    'Order #',
    'Date & Time',
    'Customer',
    'Contact Info',
    'Items & Sizes',
    'Payment',
    'Status',
    'Total Amount'
  ];

  const orderRows = [
    new TableRow({
      children: orderTableHeaders.map(
        (title) =>
          new TableCell({
            borders: headerBorders,
            shading: { fill: '161618', type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                alignment: title === 'Total Amount' ? AlignmentType.RIGHT : AlignmentType.LEFT,
                children: [new TextRun({ text: title, bold: true, color: 'FFFFFF', size: 18 })]
              })
            ]
          })
      )
    })
  ];

  orders.forEach((o) => {
    const itemsSummary = (o.items || [])
      .map((it) => `${it.title} (${it.size || 'M'} x${it.quantity || 1})`)
      .join('; ');

    const contactSummary = `${o.customerEmail}\n${o.customerPhone}`;

    orderRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: o.orderNumber, bold: true, size: 17 })] })]
          }),
          new TableCell({
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: formatDate(o.createdAt), size: 17 })] })]
          }),
          new TableCell({
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: o.customerName, size: 17 })] })]
          }),
          new TableCell({
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: contactSummary, size: 16 })] })]
          }),
          new TableCell({
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: itemsSummary || 'N/A', size: 16 })] })]
          }),
          new TableCell({
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: o.paymentMethod.toUpperCase(), size: 17 })] })]
          }),
          new TableCell({
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: o.status.toUpperCase(), bold: true, size: 17 })] })]
          }),
          new TableCell({
            borders: cellBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: `PHP ${formatPhp(o.totalAmount)}`, bold: true, size: 17 })]
              })
            ]
          })
        ]
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: 'LARO SPORTS™', bold: true, size: 36, color: '000000' })]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'OFFICIAL SALES & REVENUE REPORT — PAIN STAIN 2025',
                bold: true,
                size: 20,
                color: '666666'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Export Date: ${new Date().toLocaleString()} | Confidential Admin Analytics`,
                italics: true,
                size: 18,
                color: '888888'
              })
            ]
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: 'Executive Performance Summary', bold: true, size: 24 })]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: summaryTableRows
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: 'Detailed Orders Breakdown', bold: true, size: 24 })]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: orderRows
          }),

          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'LARO SPORTS • Street Culture & Night Hustle • WE ONLY COME OUT AT NIGHT',
                italics: true,
                size: 16,
                color: '999999'
              })
            ]
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, filename);
};
