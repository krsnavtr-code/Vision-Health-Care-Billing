import PDFDocument from "pdfkit";

/**
 * Generates a professional Vyapar-style PDF Invoice and streams it to the response
 * @param {Object} invoice - Populated Invoice object from MongoDB
 * @param {Object} res - Express Response object
 */
const generateInvoicePDF = (invoice, res) => {
  const doc = new PDFDocument({ size: "A4", margin: 40 });

  // Stream PDF directly to client response
  doc.pipe(res);

  // Colors based on Vyapar theme (Modern Navy & Slate Blue)
  const PRIMARY_COLOR = "#1A365D"; // Dark Navy
  const SECONDARY_COLOR = "#2B6CB0"; // Slate Blue
  const TEXT_DARK = "#2D3748"; // Charcoal
  const TEXT_MUTED = "#718096"; // Grey
  const BG_LIGHT = "#EDF2F7"; // Cool Grey background
  const BORDER_COLOR = "#E2E8F0";

  // --- HEADER SECTION ---
  // Clinic Details (Left)
  doc
    .fillColor(PRIMARY_COLOR)
    .font("Helvetica-Bold")
    .fontSize(22)
    .text("VISION HEALTH CARE", 40, 45);

  doc
    .fillColor(TEXT_DARK)
    .font("Helvetica")
    .fontSize(9)
    .text("123, Healthcare Enclave, Sector 15,", 40, 72)
    .text("Noida, Uttar Pradesh - 201301", 40, 84)
    .text(
      "Phone: +91 98765 43210 | Email: billing@visionhealthcare.com",
      40,
      96,
    )
    .text("GSTIN: 09AAAFV1234F1Z1", 40, 108);

  // Invoice Title and Info (Right)
  doc
    .fillColor(PRIMARY_COLOR)
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("TAX INVOICE", 400, 45, { align: "right" });

  doc
    .fillColor(TEXT_DARK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(`Invoice No: ${invoice.invoiceNumber}`, 400, 72, { align: "right" })
    .font("Helvetica")
    .text(
      `Date: ${new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}`,
      400,
      86,
      { align: "right" },
    );

  // Status Badge (Right)
  const badgeColor =
    invoice.paymentStatus === "Paid"
      ? "#38A169" // Green
      : invoice.paymentStatus === "Partially Paid"
        ? "#DD6B20" // Orange
        : "#E53E3E"; // Red

  doc.rect(460, 102, 95, 18).fill(badgeColor);

  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(invoice.paymentStatus.toUpperCase(), 460, 107, {
      width: 95,
      align: "center",
    });

  // Divider Line
  doc
    .moveTo(40, 130)
    .lineTo(555, 130)
    .strokeColor(BORDER_COLOR)
    .lineWidth(1)
    .stroke();

  // --- BILL TO / PATIENT SECTION ---
  doc
    .fillColor(SECONDARY_COLOR)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("BILL TO (PATIENT DETAILS):", 40, 145);

  const patient = invoice.patientId;
  doc
    .fillColor(TEXT_DARK)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(patient.name.toUpperCase(), 40, 160)
    .font("Helvetica")
    .fontSize(9)
    .text(`Phone: ${patient.phoneNumber || "N/A"}`, 40, 174)
    .text(`Email: ${patient.email}`, 40, 186)
    .text(`Address: ${patient.address || "N/A"}`, 40, 198);

  // --- TABLE SECTION ---
  let tableTop = 230;

  // Table Header Background Banner
  doc.rect(40, tableTop, 515, 20).fill(PRIMARY_COLOR);

  // Table Header Text
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(8);

  doc.text("S.No", 45, tableTop + 6, { width: 25, align: "center" });
  doc.text("Item Name", 75, tableTop + 6, { width: 155, align: "left" });
  doc.text("Type", 235, tableTop + 6, { width: 50, align: "center" });
  doc.text("Qty", 290, tableTop + 6, { width: 30, align: "center" });
  doc.text("Unit Price", 325, tableTop + 6, { width: 55, align: "right" });
  doc.text("GST%", 385, tableTop + 6, { width: 30, align: "center" });
  doc.text("Discount", 420, tableTop + 6, { width: 45, align: "right" });
  doc.text("Amount", 470, tableTop + 6, { width: 80, align: "right" });

  let currentY = tableTop + 20;

  // Table Rows
  doc.font("Helvetica").fontSize(8).fillColor(TEXT_DARK);

  invoice.items.forEach((item, index) => {
    // Alternating rows background
    if (index % 2 === 1) {
      doc.rect(40, currentY, 515, 18).fill(BG_LIGHT);
    }

    doc.fillColor(TEXT_DARK);
    doc.text(String(index + 1), 45, currentY + 5, {
      width: 25,
      align: "center",
    });

    // Shorten item name if it's too long
    const itemName =
      item.name.length > 32 ? item.name.substring(0, 29) + "..." : item.name;
    doc.text(itemName, 75, currentY + 5, { width: 155, align: "left" });

    doc.text(item.itemType, 235, currentY + 5, { width: 50, align: "center" });
    doc.text(String(item.quantity), 290, currentY + 5, {
      width: 30,
      align: "center",
    });
    doc.text(`Rs. ${item.unitPrice.toFixed(2)}`, 325, currentY + 5, {
      width: 55,
      align: "right",
    });
    doc.text(`${item.gstRate}%`, 385, currentY + 5, {
      width: 30,
      align: "center",
    });
    doc.text(`Rs. ${item.discount.toFixed(2)}`, 420, currentY + 5, {
      width: 45,
      align: "right",
    });
    doc.text(`Rs. ${item.totalPrice.toFixed(2)}`, 470, currentY + 5, {
      width: 80,
      align: "right",
    });

    // Draw horizontal grid line
    doc
      .moveTo(40, currentY + 18)
      .lineTo(555, currentY + 18)
      .strokeColor(BORDER_COLOR)
      .lineWidth(0.5)
      .stroke();

    currentY += 18;
  });

  // --- SUMMARY / TOTALS SECTION ---
  const summaryY = currentY + 15;

  // Left Side: Notes & Terms
  doc
    .fillColor(SECONDARY_COLOR)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("Terms & Conditions:", 40, summaryY)
    .fillColor(TEXT_MUTED)
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      "1. All equipment rental requires security deposit refund validation.",
      40,
      summaryY + 12,
      { width: 220 },
    )
    .text(
      "2. Pharmacy medicine returns must be within 7 days with original bill.",
      40,
      summaryY + 22,
      { width: 220 },
    )
    .text(
      "3. This is a computer-generated tax invoice and requires no physical signature.",
      40,
      summaryY + 32,
      { width: 220 },
    );

  if (invoice.notes) {
    doc
      .fillColor(SECONDARY_COLOR)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text("Notes/Remarks:", 40, summaryY + 50)
      .fillColor(TEXT_DARK)
      .font("Helvetica")
      .fontSize(8)
      .text(invoice.notes, 40, summaryY + 60, { width: 220 });
  }

  // Right Side: Billing Summary Table
  const calcX = 350;
  const valX = 470;
  let summaryRowY = summaryY;

  const drawSummaryRow = (label, value, isBold = false, isHeader = false) => {
    doc
      .fillColor(isBold || isHeader ? PRIMARY_COLOR : TEXT_DARK)
      .font(isBold || isHeader ? "Helvetica-Bold" : "Helvetica")
      .fontSize(isHeader ? 9 : 8);

    doc.text(label, calcX, summaryRowY, { width: 110, align: "right" });
    doc.text(value, valX, summaryRowY, { width: 80, align: "right" });
    summaryRowY += 14;
  };

  drawSummaryRow(
    "Sub Total (Tax Excl.):",
    `Rs. ${invoice.subTotal.toFixed(2)}`,
  );
  drawSummaryRow("Total CGST/SGST Tax:", `Rs. ${invoice.taxAmount.toFixed(2)}`);
  drawSummaryRow(
    "Total Item Discount:",
    `- Rs. ${invoice.totalDiscount.toFixed(2)}`,
  );

  // Draw thin line before Grand Total
  doc
    .moveTo(calcX + 30, summaryRowY + 2)
    .lineTo(555, summaryRowY + 2)
    .strokeColor(BORDER_COLOR)
    .lineWidth(1)
    .stroke();
  summaryRowY += 6;

  drawSummaryRow(
    "Grand Total (Tax Incl.):",
    `Rs. ${invoice.grandTotal.toFixed(2)}`,
    true,
  );
  drawSummaryRow("Amount Paid:", `Rs. ${invoice.amountPaid.toFixed(2)}`);

  // Highlight Balance Due
  const hasBalance = invoice.balance > 0;
  drawSummaryRow(
    "Balance Due:",
    `Rs. ${invoice.balance.toFixed(2)}`,
    hasBalance,
    hasBalance,
  );

  // --- FOOTER SIGNATURE ---
  const footerY = 740;
  doc
    .moveTo(40, footerY)
    .lineTo(555, footerY)
    .strokeColor(PRIMARY_COLOR)
    .lineWidth(1.5)
    .stroke();

  doc
    .fillColor(TEXT_MUTED)
    .font("Helvetica")
    .fontSize(8)
    .text(
      "Thank you for choosing Vision Health Care. We wish you a speedy recovery!",
      40,
      footerY + 12,
      { align: "center" },
    );

  doc
    .fillColor(TEXT_DARK)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("Authorized Signatory", 400, footerY + 35, {
      align: "right",
      width: 150,
    });

  doc
    .moveTo(400, footerY + 32)
    .lineTo(550, footerY + 32)
    .strokeColor(TEXT_MUTED)
    .lineWidth(0.5)
    .stroke();

  // End Document
  doc.end();
};

export { generateInvoicePDF };
