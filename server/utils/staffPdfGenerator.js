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
 * Generates a professional Official Work Bill / Payslip PDF for staff
 * @param {Object} staffInvoice - Populated StaffInvoice object from MongoDB
 * @param {Object} businessDetails - BusinessDetails configuration document from MongoDB
 * @param {Object} res - Express Response object
 */
const generateStaffInvoicePDF = (staffInvoice, businessDetails, res) => {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  doc.pipe(res);

  // Professional corporate colors
  const PRIMARY_BLUE = "#1E40AF"; // Corporate Blue
  const SECONDARY_BLUE = "#3B82F6"; // Lighter Blue
  const TEXT_DARK = "#1E293B";
  const TEXT_MUTED = "#64748B";
  const BG_LIGHT = "#F1F5F9";
  const BORDER_COLOR = "#CBD5E1";
  const SUCCESS_GREEN = "#059669";
  const WARNING_AMBER = "#D97706";

  // Extract business details
  const bizName = businessDetails?.name || "";
  const bizAddress = businessDetails?.address || "";
  const bizPhone = businessDetails?.phoneNumber || "";
  const bizEmail = businessDetails?.email || "";
  const bizState = businessDetails?.state || "";
  const bizWebsite = businessDetails?.website || "";
  const bizSignatureImage = businessDetails?.signatureImage || "";

  // Extract staff details
  const staff = staffInvoice.staffId || {};
  const staffName = staff.name || "N/A";
  const staffDesignation = staff.designation || "N/A";
  const staffDepartment = staff.department || "N/A";
  const staffPhone = staff.phoneNumber || "N/A";
  const staffAddress = staff.address || "N/A";
  const staffUpiId = staff.upiId || "N/A";

  // --- 1. HEADER SECTION ---
  // Company Logo/Name (Left)
  doc
    .fillColor(PRIMARY_BLUE)
    .font("Helvetica-Bold")
    .fontSize(20)
    .text(bizName.toUpperCase(), 40, 45);

  doc
    .fillColor(TEXT_DARK)
    .font("Helvetica")
    .fontSize(8)
    .text(bizAddress, 40, 70)
    .text(`Phone: ${bizPhone} | Email: ${bizEmail}`, 40, 82)
    .text(`State: ${bizState} | Website: ${bizWebsite}`, 40, 94);

  // Invoice Number (Right)
  doc
    .fillColor(TEXT_DARK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(`Bill No: ${staffInvoice.invoiceNumber}`, 400, 50, { align: "right" })
    .font("Helvetica")
    .fontSize(8)
    .text(
      `Date: ${new Date(staffInvoice.invoiceDate).toLocaleDateString("en-IN")}`,
      400,
      65,
      {
        align: "right",
      },
    )
    .text(`Status: ${staffInvoice.paymentStatus.toUpperCase()}`, 400, 80, {
      align: "right",
    });

  // Header separator
  doc
    .moveTo(40, 115)
    .lineTo(555, 115)
    .strokeColor(PRIMARY_BLUE)
    .lineWidth(2)
    .stroke();

  // --- 2. STAFF INFORMATION SECTION ---
  const infoY = 130;
  doc
    .rect(40, infoY, 515, 60)
    .fill(BG_LIGHT)
    .strokeColor(BORDER_COLOR)
    .lineWidth(0.5)
    .stroke();

  doc
    .fillColor(PRIMARY_BLUE)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("STAFF INFORMATION", 45, infoY + 8);

  doc
    .fillColor(TEXT_DARK)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("Name:", 45, infoY + 22)
    .font("Helvetica")
    .fontSize(8)
    .text(staffName.toUpperCase(), 85, infoY + 22);

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("Designation:", 45, infoY + 34)
    .font("Helvetica")
    .fontSize(8)
    .text(staffDesignation, 100, infoY + 34);

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("Department:", 250, infoY + 22)
    .font("Helvetica")
    .fontSize(8)
    .text(staffDepartment, 310, infoY + 22);

  if (staffPhone && staffPhone !== "N/A") {
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .text("Phone:", 250, infoY + 34)
      .font("Helvetica")
      .fontSize(8)
      .text(staffPhone, 285, infoY + 34);
  }

  if (staffAddress && staffAddress !== "N/A") {
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .text("Address:", 250, infoY + 46)
      .font("Helvetica")
      .fontSize(8)
      .text(staffAddress, 290, infoY + 46);
  }

  // --- 3. BILLING PERIOD SECTION ---
  const periodY = infoY + 75;
  doc
    .rect(40, periodY, 515, 30)
    .fill(BG_LIGHT)
    .strokeColor(BORDER_COLOR)
    .lineWidth(0.5)
    .stroke();

  doc
    .fillColor(PRIMARY_BLUE)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("BILLING PERIOD", 45, periodY + 8);

  const billingDate = new Date(staffInvoice.billingPeriod.startDate);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  // Use UTC methods to avoid timezone issues
  const monthName = monthNames[billingDate.getUTCMonth()];
  const year = billingDate.getUTCFullYear();

  doc
    .fillColor(TEXT_DARK)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("Month:", 45, periodY + 20)
    .font("Helvetica")
    .fontSize(8)
    .text(`${monthName} ${year}`, 85, periodY + 20);

  // --- 4. AMOUNT SECTION ---
  let tableTop = periodY + 45;
  let currentY = tableTop;

  // Total Amount
  doc.rect(40, currentY, 515, 16).fill(BG_LIGHT);
  doc
    .fillColor(PRIMARY_BLUE)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("TOTAL SALARY", 45, currentY + 4, { width: 200, align: "left" });
  doc
    .fillColor(TEXT_DARK)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text(`Rs. ${staffInvoice.totalAmount.toFixed(2)}`, 390, currentY + 4, {
      width: 80,
      align: "right",
    });

  currentY += 16;

  // Deduction
  doc.rect(40, currentY, 515, 16).fill(BG_LIGHT);
  doc
    .fillColor(WARNING_AMBER)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("DEDUCTION", 45, currentY + 4, { width: 200, align: "left" });
  doc
    .fillColor(TEXT_DARK)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text(`Rs. ${staffInvoice.deduction.toFixed(2)}`, 390, currentY + 4, {
      width: 80,
      align: "right",
    });

  currentY += 16;

  // Amount Paid
  doc.rect(40, currentY, 515, 16).fill(BG_LIGHT);
  doc
    .fillColor(PRIMARY_BLUE)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("AMOUNT PAID", 45, currentY + 4, { width: 200, align: "left" });
  doc
    .fillColor(TEXT_DARK)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text(`Rs. ${staffInvoice.amountPaid.toFixed(2)}`, 390, currentY + 4, {
      width: 80,
      align: "right",
    });

  doc
    .moveTo(40, currentY + 16)
    .lineTo(555, currentY + 16)
    .strokeColor(BORDER_COLOR)
    .lineWidth(1)
    .stroke();

  // --- 5. SUMMARY SECTION ---
  const summaryY = currentY + 30;

  // Net Payable Highlight
  doc.rect(40, summaryY, 515, 25).fill(PRIMARY_BLUE);
  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("NET PAYABLE (BALANCE)", 45, summaryY + 8, {
      width: 200,
      align: "left",
    });
  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(`Rs. ${staffInvoice.balance.toFixed(2)}`, 390, summaryY + 6, {
      width: 80,
      align: "right",
    });

  // Amount in words
  const wordsY = summaryY + 40;
  doc
    .fillColor(TEXT_MUTED)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("Amount in Words:", 40, wordsY)
    .fillColor(TEXT_DARK)
    .font("Helvetica")
    .fontSize(8)
    .text(numberToWords(staffInvoice.amountPaid), 40, wordsY + 12, {
      width: 515,
    });

  // Payment Details
  const payY = wordsY + 35;
  doc
    .rect(40, payY, 515, 40)
    .fill(BG_LIGHT)
    .strokeColor(BORDER_COLOR)
    .lineWidth(0.5)
    .stroke();

  doc
    .fillColor(PRIMARY_BLUE)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("PAYMENT DETAILS", 45, payY + 8);

  doc
    .fillColor(TEXT_DARK)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("Payment Method:", 45, payY + 22)
    .font("Helvetica")
    .fontSize(8)
    .text(staffInvoice.paymentMethod, 130, payY + 22);

  if (
    staffInvoice.paymentMethod === "UPI" &&
    staffUpiId &&
    staffUpiId !== "N/A"
  ) {
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .text("UPI ID:", 250, payY + 22)
      .font("Helvetica")
      .fontSize(8)
      .text(staffUpiId, 290, payY + 22);
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("Amount Paid:", 400, payY + 22)
    .font("Helvetica")
    .fontSize(8)
    .text(`Rs. ${staffInvoice.amountPaid.toFixed(2)}`, 460, payY + 22);

  // --- 7. SIGNATURE SECTION ---
  const signY = payY + 60;

  // Left: Staff Signature
  doc
    .fillColor(TEXT_MUTED)
    .font("Helvetica")
    .fontSize(7)
    .text("Staff Signature", 40, signY);
  doc
    .moveTo(40, signY + 15)
    .lineTo(180, signY + 15)
    .strokeColor(TEXT_MUTED)
    .lineWidth(0.5)
    .stroke();

  // Right: Authorized Signature
  doc
    .fillColor(TEXT_MUTED)
    .font("Helvetica")
    .fontSize(7)
    .text("Authorized Signature", 370, signY);
  doc
    .moveTo(370, signY + 15)
    .lineTo(555, signY + 15)
    .strokeColor(TEXT_MUTED)
    .lineWidth(0.5)
    .stroke();

  // Signature image if available
  if (bizSignatureImage) {
    const base64Data = bizSignatureImage.replace(
      /^data:image\/\w+;base64,/,
      "",
    );
    const buffer = Buffer.from(base64Data, "base64");
    doc.image(buffer, 430, signY - 25, { width: 120, height: 40 });
  }

  // --- 8. FOOTER ---
  const footerY = 770;
  doc
    .moveTo(40, footerY)
    .lineTo(555, footerY)
    .strokeColor(BORDER_COLOR)
    .lineWidth(0.5)
    .stroke();

  doc
    .fillColor(TEXT_MUTED)
    .font("Helvetica")
    .fontSize(7)
    .text(
      "This is a computer-generated official work bill. No signature required for validity.",
      40,
      footerY + 8,
      { width: 515, align: "center" },
    )
    .text(
      `Generated on: ${new Date().toLocaleString("en-IN")}`,
      40,
      footerY + 18,
      { width: 515, align: "center" },
    );

  doc.end();
};

export { generateStaffInvoicePDF };
