import { jsPDF } from 'jspdf';

/**
 * Generates and downloads an authentic, official APMC Mandi Tax Invoice & Gate Pass in .PDF format
 * @param {Object} invoiceData 
 */
export function generateInvoicePDF(invoiceData = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [0, 85, 60]; // Deep Emerald
  const accentColor = [16, 149, 107];
  const darkGray = [30, 41, 59];
  const lightGray = [241, 245, 249];
  const borderGray = [203, 213, 225];

  const invoiceNo = invoiceData.invoiceNo || `PB-INV-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = invoiceData.date || new Date().toLocaleDateString('en-IN');
  const timeStr = invoiceData.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const farmerName = invoiceData.farmer || 'Ramesh Kumar';
  const farmName = invoiceData.farmName || 'Green Valley Farms';
  const farmerZone = invoiceData.farmerZone || 'Zone 4 (Ludhiana, Punjab)';
  const khasra = invoiceData.khasra || '412/18, Plot-B (8.5 Acres)';
  const pmKisanId = invoiceData.pmKisanId || 'PB-9921-4820';
  const sbiAccount = invoiceData.sbiAccount || '•••• •••• 8829';

  const traderName = invoiceData.trader || 'Apex Agro Millers & Commodities Ltd.';
  const traderLicense = invoiceData.traderLicense || 'PB-MND-88219';
  const gstin = invoiceData.gstin || '03AAACA1234F1Z8';

  const cropTitle = invoiceData.cropTitle || 'Organic Hybrid Tomatoes';
  const grade = invoiceData.grade || 'Grade A+';
  const moisture = invoiceData.moisture || '10.4%';
  const qty = invoiceData.quantityKg || 1200;
  const rate = parseFloat(invoiceData.pricePerKg || 42.50);
  const baseValue = parseFloat(invoiceData.baseValue || (qty * rate));
  const apmcFee = parseFloat(invoiceData.apmcFee || (baseValue * 0.015));
  const rdfCess = parseFloat(invoiceData.rdfCess || (baseValue * 0.010));
  const weighbridgeFee = parseFloat(invoiceData.weighbridgeFee || 250);
  const totalPayable = parseFloat(invoiceData.totalPayable || (baseValue + apmcFee + rdfCess + weighbridgeFee));

  // --- HEADER BANNER ---
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AgriShield™ Unified Settlement Portal', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Government of Punjab • Punjab State Agricultural Marketing Board (e-NAM Gateway)', 14, 19);
  doc.text('Official Form-J Mandi Tax Invoice & Agricultural Gate Pass', 14, 25);

  // Top Right Badge
  doc.setFillColor(230, 244, 234);
  doc.roundedRect(145, 8, 52, 16, 2, 2, 'F');
  doc.setTextColor(0, 85, 60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('APMC e-NAM VERIFIED', 150, 14);
  doc.setFontSize(7);
  doc.text('Secured by SBI Smart Escrow', 150, 19);

  // --- INVOICE META ROW ---
  let y = 42;
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`INVOICE NO: ${invoiceNo}`, 14, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Date: ${dateStr}  |  Time: ${timeStr} IST`, 120, y);

  y += 4;
  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.4);
  doc.line(14, y, 196, y);

  // --- SELLER & BUYER 2-COLUMN BOXES ---
  y += 6;
  const colWidth = 88;
  
  // Seller Box (Farmer)
  doc.setFillColor(...lightGray);
  doc.roundedRect(14, y, colWidth, 42, 2, 2, 'F');
  doc.setDrawColor(...borderGray);
  doc.roundedRect(14, y, colWidth, 42, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('SELLER (FARMER / PRODUCER)', 18, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkGray);
  doc.text(farmerName, 18, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Farm: ${farmName}`, 18, y + 17);
  doc.text(`Zone / Khasra: ${khasra}`, 18, y + 22);
  doc.text(`Location: ${farmerZone}`, 18, y + 27);
  doc.text(`PM-Kisan ID: ${pmKisanId}`, 18, y + 32);
  doc.text(`Bank A/C: ${sbiAccount}`, 18, y + 37);

  // Buyer Box (Trader)
  const bx = 108;
  doc.setFillColor(...lightGray);
  doc.roundedRect(bx, y, colWidth, 42, 2, 2, 'F');
  doc.setDrawColor(...borderGray);
  doc.roundedRect(bx, y, colWidth, 42, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('BUYER (APMC LICENSED TRADER)', bx + 4, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkGray);
  doc.text(traderName, bx + 4, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`APMC Mandi License: ${traderLicense}`, bx + 4, y + 17);
  doc.text(`GSTIN Number: ${gstin}`, bx + 4, y + 22);
  doc.text('Procurement Category: Wholesale Processing', bx + 4, y + 27);
  doc.text('Settlement Method: SBI Direct Smart Escrow', bx + 4, y + 32);
  doc.text('Mandi Hub: Khanna / Ludhiana Terminal', bx + 4, y + 37);

  // --- ITEM TABLE ---
  y += 50;

  // Table Header
  doc.setFillColor(...primaryColor);
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('SR', 17, y + 5.5);
  doc.text('COMMODITY & GRADE SPECIFICATION', 30, y + 5.5);
  doc.text('MOISTURE', 105, y + 5.5);
  doc.text('QUANTITY', 128, y + 5.5);
  doc.text('RATE / KG', 152, y + 5.5);
  doc.text('AMOUNT (INR)', 175, y + 5.5);

  // Table Row
  y += 8;
  doc.setFillColor(255, 255, 255);
  doc.rect(14, y, 182, 12, 'F');
  doc.setDrawColor(...borderGray);
  doc.rect(14, y, 182, 12, 'D');

  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('01', 17, y + 7);
  
  doc.setFont('helvetica', 'bold');
  doc.text(cropTitle, 30, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Assayed Grade: ${grade} • Zone 4 Mandi Lot`, 30, y + 9.5);

  doc.setTextColor(...darkGray);
  doc.setFontSize(8);
  doc.text(moisture, 107, y + 7);
  doc.text(`${qty.toLocaleString()} Kg`, 130, y + 7);
  doc.text(`Rs. ${rate.toFixed(2)}`, 154, y + 7);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs. ${baseValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 172, y + 7);

  // --- TAX & STATUTORY DEDUCTION SUMMARY ---
  y += 18;
  const sumW = 95;
  const sumX = 101;

  doc.setFillColor(...lightGray);
  doc.roundedRect(sumX, y, sumW, 46, 2, 2, 'F');
  doc.setDrawColor(...borderGray);
  doc.roundedRect(sumX, y, sumW, 46, 2, 2, 'D');

  let sy = y + 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...darkGray);

  doc.text('Gross Crop Value:', sumX + 5, sy);
  doc.text(`Rs. ${baseValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, sumX + sumW - 6, sy, { align: 'right' });

  sy += 6;
  doc.text('APMC Mandi Cess (1.5%):', sumX + 5, sy);
  doc.text(`Rs. ${apmcFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, sumX + sumW - 6, sy, { align: 'right' });

  sy += 6;
  doc.text('Rural Infrastructure Dev Fee (1.0%):', sumX + 5, sy);
  doc.text(`Rs. ${rdfCess.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, sumX + sumW - 6, sy, { align: 'right' });

  sy += 6;
  doc.text('Weighbridge & Assaying Charges:', sumX + 5, sy);
  doc.text(`Rs. ${weighbridgeFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, sumX + sumW - 6, sy, { align: 'right' });

  sy += 4;
  doc.setDrawColor(...borderGray);
  doc.line(sumX + 4, sy, sumX + sumW - 4, sy);

  sy += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('Total Escrow Payout:', sumX + 5, sy);
  doc.text(`Rs. ${totalPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, sumX + sumW - 6, sy, { align: 'right' });

  // Left Note / Security Box
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(14, y, 80, 46, 2, 2, 'F');
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14, y, 80, 46, 2, 2, 'D');

  doc.setTextColor(22, 101, 52);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('✓ SMART ESCROW SECURED', 18, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('• Funds digitally locked via SBI Smart Escrow.', 18, y + 16);
  doc.text('• Auto-settled upon weighbridge verification.', 18, y + 22);
  doc.text('• e-Way bill generated under Punjab APMC rules.', 18, y + 28);
  doc.text(`• Digital Hash: #PB-${invoiceNo}-SEC`, 18, y + 36);

  // --- SIGNATURE & FOOTER ---
  y += 56;
  doc.setDrawColor(...borderGray);
  doc.line(14, y, 196, y);

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);

  // Signature lines
  doc.text('Authorized APMC Officer / Mandi Inspector', 14, y + 8);
  doc.text('Buyer Authorized Signatory', 100, y + 8);
  doc.text('Farmer / Producer Signature', 155, y + 8);

  doc.setDrawColor(148, 163, 184);
  doc.line(14, y + 4, 75, y + 4);
  doc.line(100, y + 4, 140, y + 4);
  doc.line(155, y + 4, 195, y + 4);

  // Footer Disclaimer
  y += 20;
  doc.setFillColor(...primaryColor);
  doc.rect(0, 285, 210, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text('This is a system-generated electronic tax invoice authorized under Section 23 of the State APMC Act. No physical signature required.', 14, 292);

  // Download PDF directly
  const fileName = `AgriShield_Invoice_${invoiceNo}.pdf`;
  doc.save(fileName);
  return fileName;
}

export const generateApmcInvoicePdf = generateInvoicePDF;
export default generateInvoicePDF;
