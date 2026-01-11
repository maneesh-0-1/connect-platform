import QRCode from 'qrcode';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

const QR_BASE_URL = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/qr` : 'http://localhost:3000/qr';

export async function generateAndDownloadZip(ids: string[]) {
    const zip = new JSZip();
    const folder = zip.folder("qr-codes");

    for (const id of ids) {
        const url = `${QR_BASE_URL}/${id}`;
        const dataUrl = await QRCode.toDataURL(url, { width: 400, margin: 2 });
        // Remove "data:image/png;base64," prefix
        const base64Data = dataUrl.split(',')[1];
        folder?.file(`AIESEC_QR_${id}.png`, base64Data, { base64: true });
    }

    // Create CSV
    const csvContent = ["QR ID,Status,Claimed By,Time"];
    ids.forEach(id => csvContent.push(`${id},UNCLAIMED,,`));
    zip.file("mapping.csv", csvContent.join("\n"));

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "qr-batch-images.zip");
}

export async function generateAndDownloadPDF(ids: string[]) {
    const doc = new jsPDF();
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297;
    const margin = 10;
    const qrSize = 50; // 50mm x 50mm
    const gap = 10;

    let x = margin;
    let y = margin;
    let col = 0;
    let row = 0;

    doc.setFontSize(20);
    doc.text("AIESEC Conference 2026 - Digital Cards", margin, margin);
    y += 20; // content start

    for (const id of ids) {
        const url = `${QR_BASE_URL}/${id}`;
        const dataUrl = await QRCode.toDataURL(url, { width: 400, margin: 1 });

        if (y + qrSize + 10 > pageHeight - margin) {
            doc.addPage();
            y = margin + 20; // Reset Y
            x = margin;
            col = 0;
            row = 0;
        }

        doc.addImage(dataUrl, 'PNG', x, y, qrSize, qrSize);
        doc.setFontSize(10);
        doc.text(id, x + qrSize / 2, y + qrSize + 5, { align: 'center' });

        // Grid Logic (3 columns)
        col++;
        if (col >= 3) {
            col = 0;
            row++;
            x = margin;
            y += qrSize + gap + 10; // +10 for text space
        } else {
            x += qrSize + gap;
        }
    }

    doc.save("qr-batch-print.pdf");
}
