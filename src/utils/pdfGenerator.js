import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateAttendancePdf = (monthDate, employees, attendanceData) => {
    const doc = new jsPDF({ orientation: 'landscape' });

    // Extract Month and Year - Force UTC to be safe
    const dateObj = new Date(monthDate);
    const monthName = dateObj.toLocaleDateString('it-IT', { timeZone: 'UTC', month: 'long' }).toUpperCase();
    const year = dateObj.getUTCFullYear();
    const month = dateObj.getUTCMonth();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    // --- HEADER ---
    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246); // Blue header like image
    doc.text("FOGLIO PRESENZE", 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`NUMERO: ____`, 14, 25);
    doc.text(`MESE: ${monthName} ${year}`, 50, 25);
    doc.text(`REPARTO: CANTIERE`, 120, 25);

    // Draw header box top-right like "VIDIMAZIONE"
    doc.setDrawColor(59, 130, 246);
    doc.rect(220, 10, 60, 20);
    doc.setFontSize(8);
    doc.text("VIDIMAZIONE", 222, 14);

    // --- PREPARE DATA FOR TABLE ---
    const daysColumns = [];
    for (let i = 1; i <= daysInMonth; i++) {
        daysColumns.push({ header: `${i}`, dataKey: `d${i}` });
    }

    const columns = [
        { header: 'N. MATR\nQUALIF.', dataKey: 'matricola' },
        { header: 'COGNOME\nNOME', dataKey: 'nome' },
        ...daysColumns,
        { header: 'TOTALI\nGG', dataKey: 'tot_gg' },
        { header: 'TOTALI\nORE', dataKey: 'tot_ore' },
    ];

    const pivot = {};
    employees.forEach(emp => {
        pivot[emp.id] = {
            name: emp.nome,
            role: emp.ruolo,
            matricola: emp.id,
            days: {},
            totalHours: 0,
            daysWorked: 0
        };
    });

    attendanceData.forEach(record => {
        const d = new Date((record.start || record.data).split('T')[0] + 'T00:00:00Z');
        if (d.getUTCMonth() !== month || d.getUTCFullYear() !== year) return;

        const day = d.getUTCDate();
        const empId = record.extendedProps?.dipendente_id || record.dipendente_id;

        if (pivot[empId]) {
            const hours = parseFloat(record.extendedProps?.ore || record.ore_lavorate || 0);
            pivot[empId].days[`d${day}`] = (pivot[empId].days[`d${day}`] || 0) + hours;
            pivot[empId].totalHours += hours;
        }
    });

    Object.values(pivot).forEach(p => {
        p.daysWorked = Object.values(p.days).filter(h => h > 0).length;
    });

    const tableRows = [];
    Object.values(pivot).forEach(p => {
        const row = {
            matricola: `${p.matricola}\n${p.role || ''}`,
            nome: p.name,
            tot_gg: p.daysWorked,
            tot_ore: p.totalHours,
        };
        for (let i = 1; i <= daysInMonth; i++) {
            row[`d${i}`] = p.days[`d${i}`] || '';
        }
        tableRows.push(row);
    });

    autoTable(doc, {
        startY: 35,
        head: [columns.map(c => c.header)],
        body: tableRows.map(r => columns.map(c => r[c.dataKey])),
        styles: {
            fontSize: 8,
            cellPadding: 1,
            lineColor: [44, 62, 80],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [59, 130, 246],
            fontStyle: 'bold',
            lineWidth: 0.1,
            lineColor: [59, 130, 246]
        },
        columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 40 },
            [columns.length - 2]: { cellWidth: 15, halign: 'center' },
            [columns.length - 1]: { cellWidth: 15, halign: 'center' },
        },
        theme: 'grid'
    });

    const finalY = (doc.lastAutoTable?.finalY || 35) + 10;
    doc.setFontSize(8);
    doc.text("Legenda: O=Ore Ordinarie, S=Straordinari, F=Ferie, M=Malattia", 14, finalY);

    doc.save(`Presenze_${monthName}_${year}.pdf`);
};
