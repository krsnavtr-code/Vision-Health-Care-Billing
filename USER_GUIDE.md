# Vision Health Care Billing Software - User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Business Settings](#business-settings)
3. [Patient Management](#patient-management)
4. [Inventory Management](#inventory-management)
5. [Creating Invoices](#creating-invoices)
6. [Viewing Invoices](#viewing-invoices)

---

## Getting Started

### Prerequisites

- Node.js installed
- MongoDB running locally or cloud instance
- Modern web browser (Chrome, Firefox, Edge)

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   cd server
   npm install

   cd ../client
   npm install
   ```

3. Set up environment variables in `server/.env`:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=6002
   ```
4. Start the servers:

   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

5. Open browser to `http://localhost:5173`

---

## Business Settings

### Overview

Configure your business details that appear on invoices and PDFs.

### Step-by-Step Setup

1. **Navigate to Business Settings**
   - Click on "Business Settings" in the sidebar
   - This is where you configure your clinic/hospital information

2. **Fill in Basic Information**
   - **Business Name**: Your clinic/hospital name (e.g., "Vision Health Care")
   - **Address**: Complete physical address
   - **Phone Number**: Contact number for billing inquiries
   - **Email**: Business email address
   - **State**: State code (e.g., "07-Delhi")
   - **Website**: Optional website URL

3. **Configure Bank Details**
   - **Account Holder Name**: Name of the account holder
   - **Bank Name**: Bank name (e.g., "Au Small Finance Bank Limited")
   - **Bank Branch**: Branch location
   - **Bank Account No**: Account number for payments
   - **IFSC Code**: Bank IFSC code (required)

4. **Upload Signature Image**
   - Click "Upload signature image"
   - Select a transparent PNG signature file
   - The signature will appear on invoices in the authorized signatory section
   - Click the red X button to remove and re-upload if needed

5. **Upload QR Code**
   - Click "Upload QR code image"
   - Select your payment QR code (PNG/JPEG)
   - The QR code will appear on invoices in the payment section
   - Click the red X button to remove and re-upload if needed

6. **Save Settings**
   - Click "Save Business Profile" button
   - Wait for success confirmation
   - Settings are saved to the database and will persist

### Important Notes

- Only one business settings record exists in the system
- Editing updates the existing record instead of creating duplicates
- Signature and QR code images are stored as base64 in the database
- Images should be optimized (under 1MB recommended) for faster loading

---

## Patient Management

### Overview

Register and manage patients for billing purposes.

### Adding a New Patient

1. **Navigate to Patient Directory**
   - Click "Patient Directory" in the sidebar

2. **Click "Add New Patient"**
   - Blue button in the top right corner

3. **Fill Patient Details**
   - **Patient Name** (Required): Full name of the patient
   - **Phone Number**: Contact number
   - **Email Address** (Optional): Patient's email
   - **Permanent Address**: Home address

4. **Register Patient**
   - Click "Register Patient" button
   - Patient is added to the directory
   - Patient can now be selected when creating invoices

### Editing a Patient

1. **Find the patient** in the directory list
2. **Click the blue Edit icon** (pencil) in the Actions column
3. **Modify the details** as needed
4. **Click "Update Patient"** to save changes

### Deleting a Patient

1. **Find the patient** in the directory list
2. **Click the red Delete icon** (trash) in the Actions column
3. **Confirm deletion** in the dialog
4. Patient is removed from the directory

### Searching Patients

- Use the search box to find patients by name or phone number
- Results filter in real-time as you type

---

## Inventory Management

### Overview

Manage products, equipment, and services available for billing.

### Adding Inventory Items

1. **Navigate to Inventory**
   - Click "Inventory" in the sidebar

2. **Add New Item**
   - Click the add button
   - Fill in item details:
     - **Item Name**: Product/service name
     - **Category**: Item category (e.g., Medicines, Equipment, Services)
     - **Price**: Selling price
     - **Stock Quantity**: Available stock
     - **Description**: Optional item description

3. **Save Item**
   - Click save to add to inventory

### Managing Stock

- Update stock quantities as items are sold
- Low stock alerts can be configured
- Track inventory movements

---

## Creating Invoices

### Overview

Generate bills for patients using inventory items.

### Step-by-Step Invoice Creation

1. **Navigate to POS/Billing**
   - Click "POS" or "Billing" in the sidebar

2. **Select Patient**
   - Choose patient from dropdown or search
   - Patient details auto-populate

3. **Add Items to Invoice**
   - Search and select items from inventory
   - Adjust quantities as needed
   - Prices auto-calculate based on inventory

4. **Apply Discounts**
   - Apply percentage or fixed discounts
   - Discount reflects in total calculation

5. **Set Payment Details**
   - Enter amount paid
   - Balance due is calculated automatically

6. **Generate Invoice**
   - Click "Generate Invoice"
   - Invoice is saved to database
   - PDF is generated automatically

### Invoice Features

- Automatic invoice numbering
- Date and time stamping
- Business details from Business Settings
- Patient information
- Itemized billing with quantities and prices
- Discount calculations
- Payment breakdown (paid vs balance)
- QR code for payment (if uploaded)
- Signature display (if uploaded)

---

## Viewing Invoices

### Overview

Access and download previously generated invoices.

### Viewing Invoice List

1. **Navigate to Invoices**
   - Click "Invoices" in the sidebar

2. **View All Invoices**
   - List shows all generated invoices
   - Includes invoice number, date, patient name, and total amount

### Downloading PDF

1. **Find the invoice** in the list
2. **Click "Download PDF"** button
3. PDF downloads with:
   - Business header with logo placeholder
   - Business contact details
   - Patient information
   - Itemized billing table
   - Payment summary
   - QR code for payment
   - Authorized signature
   - Terms and conditions

### Invoice Status

- **Paid**: Full payment received
- **Partial**: Partial payment received
- **Unpaid**: No payment received
- Balance amounts are tracked and displayed

---

## Tips and Best Practices

### Business Settings

- Keep signature and QR code images optimized for fast PDF generation
- Update bank details whenever they change
- Verify all contact information before generating invoices

### Patient Management

- Use consistent naming conventions for easier searching
- Keep patient contact information up to date
- Archive old patients periodically to keep directory clean

### Invoice Generation

- Always verify patient details before generating invoice
- Double-check item quantities and prices
- Review discounts before finalizing
- Download PDF immediately after generation for backup

### Troubleshooting

**Images not saving:**

- Ensure server is restarted after payload limit changes
- Check that images are under 10MB in size
- Verify server is running and accessible

**PDF generation issues:**

- Ensure business settings are configured
- Check that signature and QR code images are valid
- Verify inventory items have correct prices

**Patient not found:**

- Check spelling in search
- Verify patient is registered in directory
- Use phone number search as alternative

---

## Support

For technical issues or questions:

- Check browser console for error messages
- Verify server is running on port 6002
- Ensure MongoDB connection is active
- Review environment variables configuration

---

## System Requirements

- **Backend**: Node.js 16+, MongoDB 4.4+
- **Frontend**: Modern browser with JavaScript enabled
- **Network**: Local network or internet for cloud MongoDB
- **Storage**: Sufficient disk space for database and logs

---

## Security Notes

- Keep MongoDB connection string secure
- Use strong passwords for user accounts
- Regularly backup database
- Update dependencies for security patches
- Restrict access to admin functions

---

_Last Updated: June 2026_
_Version: 1.0_
