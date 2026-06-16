import PDFDocument from "pdfkit";

/**
 * Converts a numeric amount to Indian Rupees in words
 * @param {Number} num - The amount to convert
 * @returns {String} - Amount in words
 */
const numberToWords = (num) => {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const numToWordsLessThanThousand = (n) => {
    let str = "";
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += b[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      str += a[n] + " ";
    }
    return str.trim();
  };

  if (num === 0) return "Zero Rupees only";

  const parts = num.toFixed(2).split(".");
  const integerPart = parseInt(parts[0], 10);
  const decimalPart = parseInt(parts[1], 10);

  let words = "";
  let remaining = integerPart;

  if (remaining >= 10000000) {
    const crore = Math.floor(remaining / 10000000);
    words += numToWordsLessThanThousand(crore) + " Crore ";
    remaining %= 10000000;
  }
  if (remaining >= 100000) {
    const lakh = Math.floor(remaining / 100000);
    words += numToWordsLessThanThousand(lakh) + " Lakh ";
    remaining %= 100000;
  }
  if (remaining >= 1000) {
    const thousand = Math.floor(remaining / 1000);
    words += numToWordsLessThanThousand(thousand) + " Thousand ";
    remaining %= 1000;
  }
  if (remaining > 0) {
    words += numToWordsLessThanThousand(remaining) + " ";
  }

  words = words.trim() + " Rupees";

  if (decimalPart > 0) {
    words += " and " + numToWordsLessThanThousand(decimalPart) + " Paisa";
  }

  return words + " only";
};

/**
 * Generates a professional Vyapar-style PDF Invoice and streams it to the response
 * @param {Object} invoice - Populated Invoice object from MongoDB
 * @param {Object} res - Express Response object
 */
const generateInvoicePDF = (invoice, res) => {
  // Create PDF Document with standard A4 margins
  const doc = new PDFDocument({ size: "A4", margin: 40 });

  // Stream PDF directly to client response
  doc.pipe(res);

  // Colors matching the Red Vyapar theme
  const PRIMARY_RED = "#B91C1C"; // Burgundy Red
  const TEXT_DARK = "#1E293B"; // Slate Dark
  const TEXT_MUTED = "#64748B"; // Slate Grey
  const BG_LIGHT = "#F8FAFC"; // Cool Light grey
  const BORDER_COLOR = "#CBD5E1"; // Borders grey

  // --- 1. HEADER SECTION ---
  // Clinic / Company Details (Left)
  doc
    .fillColor(PRIMARY_RED)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Vision Health Care and Home Care Services", 40, 45);

  doc
    .fillColor(TEXT_DARK)
    .font("Helvetica")
    .fontSize(8.5)
    .text("Sector 62, Noida, NCR Delhi", 40, 65)
    .text("Phone no.: +91 99887 76655", 40, 77)
    .text("Email: billing@visionhealthcare.com", 40, 89)
    .text("GSTIN: 07GPYPS6223A1ZH", 40, 101)
    .text("State: 07-Delhi", 40, 113);

  // Logo Placeholder (Right)
  const logoRight = 500;
  const logoTop = 45;
  doc
    .strokeColor(PRIMARY_RED)
    .lineWidth(2)
    .circle(logoRight + 25, logoTop + 25, 20)
    .stroke();
  doc
    .fillColor(PRIMARY_RED)
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("V", logoRight + 20, logoTop + 18);

  // Thin separator line
  doc
    .moveTo(40, 132)
    .lineTo(555, 132)
    .strokeColor(BORDER_COLOR)
    .lineWidth(0.5)
    .stroke();

  // --- 2. TITLE SECTION (Tax Invoice Banner) ---
  doc
    .fillColor(PRIMARY_RED)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text("Tax Invoice", 40, 142, { align: "center" });

  doc
    .moveTo(40, 160)
    .lineTo(555, 160)
    .strokeColor(BORDER_COLOR)
    .lineWidth(0.5)
    .stroke();

  // --- 3. INVOICE METADATA ---
  // Bill To (Left)
  const patient = invoice.patientId || {
    name: "N/A",
    phoneNumber: "N/A",
    address: "N/A",
  };
  doc
    .fillColor(TEXT_MUTED)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("Bill To", 40, 172)
    .fillColor(TEXT_DARK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(patient.name.toUpperCase(), 40, 184)
    .font("Helvetica")
    .fontSize(8.5)
    .text(`Contact No.: ${patient.phoneNumber || "N/A"}`, 40, 198)
    .text(`Address: ${patient.address || "N/A"}`, 40, 210);

  // Invoice details (Right)
  doc
    .fillColor(TEXT_MUTED)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("Invoice Details", 400, 172, { align: "right" })
    .fillColor(TEXT_DARK)
    .font("Helvetica-Bold")
    .fontSize(9.5)
    .text(`Invoice No.: ${invoice.invoiceNumber || "93"}`, 400, 184, {
      align: "right",
    })
    .font("Helvetica")
    .fontSize(8.5)
    .text(
      `Date: ${new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}`,
      400,
      198,
      { align: "right" },
    )
    .text(`Status: ${invoice.paymentStatus.toUpperCase()}`, 400, 210, {
      align: "right",
    });

  // --- 4. ITEMS TABLE SECTION ---
  let tableTop = 230;

  // Header background (Vyapar Red)
  doc.rect(40, tableTop, 515, 18).fill(PRIMARY_RED);

  // Header Columns labels
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(8);
  doc.text("#", 45, tableTop + 5, { width: 20, align: "center" });
  doc.text("Item Name", 70, tableTop + 5, { width: 160, align: "left" });
  doc.text("HSN/ SAC", 235, tableTop + 5, { width: 55, align: "center" });
  doc.text("Quantity", 295, tableTop + 5, { width: 40, align: "center" });
  doc.text("Price/ Unit", 340, tableTop + 5, { width: 55, align: "right" });
  doc.text("Discount", 400, tableTop + 5, { width: 75, align: "right" });
  doc.text("Amount", 480, tableTop + 5, { width: 70, align: "right" });

  let currentY = tableTop + 18;
  doc.font("Helvetica").fontSize(8).fillColor(TEXT_DARK);

  let totalQty = 0;
  let totalDiscountVal = 0;

  invoice.items.forEach((item, index) => {
    totalQty += item.quantity;
    totalDiscountVal += item.discount;

    // Row alternating background
    if (index % 2 === 1) {
      doc.rect(40, currentY, 515, 18).fill(BG_LIGHT);
    }

    doc.fillColor(TEXT_DARK);
    doc.text(String(index + 1), 45, currentY + 5, {
      width: 20,
      align: "center",
    });

    // Snap item name
    const itemName =
      item.name.length > 35 ? item.name.substring(0, 32) + "..." : item.name;
    doc.text(itemName, 70, currentY + 5, { width: 160, align: "left" });

    // HSN Code
    const hsn = item.hsnCode || "-";
    doc.text(hsn, 235, currentY + 5, { width: 55, align: "center" });

    // Quantity
    doc.text(String(item.quantity), 295, currentY + 5, {
      width: 40,
      align: "center",
    });

    // Price/Unit
    doc.text(`Rs. ${item.unitPrice.toFixed(2)}`, 340, currentY + 5, {
      width: 55,
      align: "right",
    });

    // Discount: showing both amount and percentage just like Shreyansh's bill!
    const baseVal = item.unitPrice * item.quantity;
    const discountPct =
      baseVal > 0 ? ((item.discount / baseVal) * 100).toFixed(0) : "0";
    doc.text(
      `Rs. ${item.discount.toFixed(2)} (${discountPct}%)`,
      400,
      currentY + 5,
      { width: 75, align: "right" },
    );

    // Total Price
    doc.text(`Rs. ${item.totalPrice.toFixed(2)}`, 480, currentY + 5, {
      width: 70,
      align: "right",
    });

    // Grid border line
    doc
      .moveTo(40, currentY + 18)
      .lineTo(555, currentY + 18)
      .strokeColor(BORDER_COLOR)
      .lineWidth(0.5)
      .stroke();

    currentY += 18;
  });

  // Table total row
  doc.rect(40, currentY, 515, 18).fill(BG_LIGHT);
  doc.fillColor(TEXT_DARK).font("Helvetica-Bold").fontSize(8);
  doc.text("Total", 70, currentY + 5, { width: 160, align: "left" });
  doc.text(String(totalQty), 295, currentY + 5, { width: 40, align: "center" });
  doc.text(`Rs. ${totalDiscountVal.toFixed(2)}`, 400, currentY + 5, {
    width: 75,
    align: "right",
  });
  doc.text(`Rs. ${invoice.grandTotal.toFixed(2)}`, 480, currentY + 5, {
    width: 70,
    align: "right",
  });

  doc
    .moveTo(40, currentY + 18)
    .lineTo(555, currentY + 18)
    .strokeColor(BORDER_COLOR)
    .lineWidth(1)
    .stroke();

  // --- 5. BOTTOM SECTION ---
  const summaryY = currentY + 28;

  // Left Section (Amount in words, terms, payment instructions)
  doc
    .fillColor(TEXT_MUTED)
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .text("Invoice Amount In Words", 40, summaryY)
    .fillColor(TEXT_DARK)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text(numberToWords(invoice.grandTotal), 40, summaryY + 12, { width: 220 })
    .fillColor(TEXT_MUTED)
    .font("Helvetica-Bold")
    .text("Terms And Conditions", 40, summaryY + 45)
    .font("Helvetica")
    .fontSize(7.5)
    .text("Thank you for doing business with us.", 40, summaryY + 55, {
      width: 220,
    });

  // Bank Info & QR Pay (Draw exact layout like Shreyansh's Vyapar PDF)
  const payToY = summaryY + 80;
  doc
    .strokeColor(BORDER_COLOR)
    .lineWidth(0.5)
    .rect(40, payToY, 230, 92)
    .stroke();

  // Draw QR code mock drawing lines inside box
  doc
    .strokeColor(TEXT_DARK)
    .lineWidth(1)
    .rect(46, payToY + 6, 40, 40)
    .stroke();
  doc
    .rect(52, payToY + 12, 10, 10)
    .fill(TEXT_DARK)
    .rect(70, payToY + 12, 10, 10)
    .fill(TEXT_DARK)
    .rect(52, payToY + 30, 10, 10)
    .fill(TEXT_DARK)
    .rect(72, payToY + 32, 6, 6)
    .fill(TEXT_DARK);

  // Bank / Pay details
  doc
    .fillColor(TEXT_DARK)
    .font("Helvetica-Bold")
    .fontSize(7)
    .text("Pay To:", 95, payToY + 6)
    .font("Helvetica")
    .fontSize(6.5)
    .text("Bank: Au Small Finance Bank Limited, Noida", 95, payToY + 16)
    .text("Account No.: 2402210060989650", 95, payToY + 26)
    .text("IFSC Code: AUBL0002100", 95, payToY + 36)
    .text("Holder: Vision Health Care Services", 95, payToY + 46);

  // UPI scan badge
  doc.rect(46, payToY + 55, 110, 12).fill("#0284C7");
  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(6)
    .text("UPI SCAN TO PAY", 46, payToY + 58, { width: 110, align: "center" });

  doc
    .fillColor(TEXT_MUTED)
    .font("Helvetica")
    .fontSize(6)
    .text("www.visionhealthcare.com", 46, payToY + 74, { width: 218 });

  // Right Section (Summary breakdown and totals)
  const calcX = 350;
  const valX = 470;
  let summaryRowY = summaryY;

  const drawSummaryRow = (
    label,
    value,
    isBold = false,
    isHighlight = false,
  ) => {
    if (isHighlight) {
      // Draw Red Highlight Bar for Grand Total!
      doc.rect(calcX - 5, summaryRowY - 3, 210, 15).fill(PRIMARY_RED);
      doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(8.5);
    } else {
      doc
        .fillColor(isBold ? PRIMARY_RED : TEXT_DARK)
        .font(isBold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(8);
    }

    doc.text(label, calcX, summaryRowY, { width: 110, align: "right" });
    doc.text(value, valX, summaryRowY, { width: 80, align: "right" });
    summaryRowY += 14;
  };

  drawSummaryRow("Sub Total", `Rs. ${invoice.subTotal.toFixed(2)}`);
  drawSummaryRow("Discount", `Rs. ${invoice.totalDiscount.toFixed(2)}`);
  drawSummaryRow("Total", `Rs. ${invoice.grandTotal.toFixed(2)}`, true, true);
  summaryRowY += 4; // space after highlight bar
  drawSummaryRow("Received", `Rs. ${invoice.amountPaid.toFixed(2)}`);
  drawSummaryRow(
    "Balance",
    `Rs. ${invoice.balance.toFixed(2)}`,
    invoice.balance > 0,
  );
  drawSummaryRow("You Saved", `Rs. ${invoice.totalDiscount.toFixed(2)}`, true);

  // --- 6. AUTHORIZED SIGNATURE (Right bottom corner) ---
  const signatoryY = summaryRowY + 45;
  doc
    .fillColor(TEXT_DARK)
    .font("Helvetica")
    .fontSize(7.5)
    .text("For : Vision Health Care and Home Care Services", 330, signatoryY, {
      width: 220,
      align: "right",
    });

  // Stylized Handwritten font simulation for Signature!
  doc
    .fillColor("#1E3A8A") // Signature ink blue
    .font("Courier-Oblique")
    .fontSize(11)
    .text("Dilip", 400, signatoryY + 18, { width: 150, align: "right" });

  doc
    .moveTo(400, signatoryY + 30)
    .lineTo(550, signatoryY + 30)
    .strokeColor(TEXT_MUTED)
    .lineWidth(0.5)
    .stroke();

  doc
    .fillColor(TEXT_DARK)
    .font("Helvetica-Bold")
    .fontSize(7.5)
    .text("Authorized Signatory", 400, signatoryY + 34, {
      width: 150,
      align: "right",
    });

  // Stream close & final compilation
  doc.end();
};

export { generateInvoicePDF };
