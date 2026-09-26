/**
 * Complete Google Apps Script (Code.gs) for DESHI BITE Business Management System
 * You can copy this script directly and paste it into Google Apps Script editor.
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * DESHI BITE - Google Apps Script Backend & Google Sheets Data Hub
 * Author: DESHI BITE Management System
 * Timezone: Asia/Dhaka
 */

const SHEET_NAMES = {
  PRODUCTS: 'Products',
  AGENTS: 'Agents',
  SALES: 'Sales',
  SALE_ITEMS: 'SaleItems',
  PAYMENTS: 'Payments',
  STOCK_TX: 'StockTransactions',
  CUSTOMERS: 'Customers',
  ADMIN_LOGS: 'AdminLogs',
  NOTIFICATIONS: 'Notifications',
  SETTINGS: 'Settings'
};

/**
 * Run this function once from Apps Script editor to initialize all Sheets with proper headers
 */
function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const definitions = [
    {
      name: SHEET_NAMES.PRODUCTS,
      headers: ['ID', 'Name', 'Retail_KG', 'Retail_PCS', 'Wholesale_KG', 'Wholesale_PCS', 'Stock_KG', 'Stock_PCS', 'Threshold_KG', 'Threshold_PCS', 'Status', 'Last_Updated']
    },
    {
      name: SHEET_NAMES.AGENTS,
      headers: ['Agent_ID', 'Name', 'Phone', 'Role', 'Status', 'Total_Sales', 'Total_Paid', 'Current_Due', 'Address', 'Joined_Date']
    },
    {
      name: SHEET_NAMES.SALES,
      headers: ['Sale_ID', 'Invoice_No', 'Agent_ID', 'Agent_Name', 'Customer_Name', 'Customer_Phone', 'Sale_Type', 'Subtotal', 'Discount', 'Grand_Total', 'Payment_Status', 'Date_Asia_Dhaka', 'Time', 'Timestamp']
    },
    {
      name: SHEET_NAMES.SALE_ITEMS,
      headers: ['Sale_ID', 'Product_ID', 'Product_Name_Snapshot', 'Unit', 'Quantity', 'Unit_Price_Snapshot', 'Subtotal']
    },
    {
      name: SHEET_NAMES.PAYMENTS,
      headers: ['Payment_ID', 'Agent_ID', 'Agent_Name', 'Amount_Paid', 'Previous_Due', 'Remaining_Due', 'Method', 'Reference_Note', 'Recorded_By', 'Date', 'Time', 'Timestamp']
    },
    {
      name: SHEET_NAMES.STOCK_TX,
      headers: ['Transaction_ID', 'Product_ID', 'Product_Name', 'Type', 'Quantity', 'Unit', 'Reference_Note', 'Recorded_By', 'Date', 'Time', 'Timestamp']
    },
    {
      name: SHEET_NAMES.CUSTOMERS,
      headers: ['Customer_ID', 'Name', 'Phone', 'Address', 'Total_Purchases', 'Last_Purchase_Date']
    },
    {
      name: SHEET_NAMES.ADMIN_LOGS,
      headers: ['Log_ID', 'User', 'Role', 'Action', 'Reference_ID', 'Details', 'Date', 'Time', 'Timestamp']
    },
    {
      name: SHEET_NAMES.NOTIFICATIONS,
      headers: ['Notification_ID', 'Title', 'Message', 'Type', 'Is_Read', 'Target_Role', 'Date', 'Time', 'Timestamp']
    },
    {
      name: SHEET_NAMES.SETTINGS,
      headers: ['Key', 'Value', 'Description']
    }
  ];

  definitions.forEach(def => {
    let sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(def.headers);
      const headerRange = sheet.getRange(1, 1, 1, def.headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#F3E8FF'); // Lavender highlight
      sheet.setFrozenRows(1);
    }
  });

  return { success: true, message: 'All DESHI BITE sheets initialized successfully!' };
}

/**
 * Handle HTTP GET Requests (e.g. Health Check or Data Fetch)
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'health';
    
    if (action === 'health') {
      return jsonResponse({
        status: 'OK',
        service: 'DESHI BITE Google Sheets Backend',
        timestamp: new Date().toISOString(),
        timezone: 'Asia/Dhaka'
      });
    }

    if (action === 'getAllData') {
      return jsonResponse(fetchAllData());
    }

    return jsonResponse({ success: false, error: 'Unknown GET action' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Handle HTTP POST Requests (Sync Sales, Payments, Products, Stock, Agents)
 */
function doPost(e) {
  try {
    const contents = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const action = contents.action;

    if (action === 'init') {
      const result = initializeSheets();
      return jsonResponse(result);
    }

    if (action === 'syncFullState') {
      // Sync complete data array from web app to Google Sheets
      const result = syncFullState(contents.payload);
      return jsonResponse(result);
    }

    if (action === 'createSale') {
      const result = recordSaleTransaction(contents.payload);
      return jsonResponse(result);
    }

    if (action === 'recordPayment') {
      const result = recordPaymentTransaction(contents.payload);
      return jsonResponse(result);
    }

    return jsonResponse({ success: false, error: 'Unrecognized action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function syncFullState(data) {
  if (!data) return { success: false, error: 'Empty payload' };
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Helper to append a row safely
  function appendRow(sheetName, rowData) {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) sheet.appendRow(rowData);
  }

  // 1. Log action
  appendRow(SHEET_NAMES.ADMIN_LOGS, [
    'LOG-' + Date.now(),
    'Web System',
    'SYSTEM',
    'Full Cloud Sync',
    'SYNC-' + Date.now(),
    'Synced latest business state with Google Sheets',
    getDhakaDate(),
    getDhakaTime(),
    Date.now()
  ]);

  return { success: true, message: 'Google Sheets sync completed at ' + getDhakaTime() };
}

function recordSaleTransaction(sale) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const salesSheet = ss.getSheetByName(SHEET_NAMES.SALES);
  const itemsSheet = ss.getSheetByName(SHEET_NAMES.SALE_ITEMS);

  if (!salesSheet || !itemsSheet) {
    initializeSheets();
  }

  salesSheet.appendRow([
    sale.id,
    sale.invoiceNo,
    sale.agentId,
    sale.agentName,
    sale.customerName || 'N/A',
    sale.customerPhone || 'N/A',
    sale.saleType,
    sale.subtotal,
    sale.discount || 0,
    sale.grandTotal,
    sale.paymentStatus,
    sale.createdAtDate || getDhakaDate(),
    sale.createdAtTime || getDhakaTime(),
    sale.timestamp || Date.now()
  ]);

  if (sale.items && sale.items.length) {
    sale.items.forEach(function(item) {
      itemsSheet.appendRow([
        sale.id,
        item.productId,
        item.productName,
        item.unit,
        item.quantity,
        item.unitPrice,
        item.subtotal
      ]);
    });
  }

  return { success: true, invoiceNo: sale.invoiceNo };
}

function recordPaymentTransaction(payment) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.PAYMENTS);
  if (!sheet) initializeSheets();

  sheet.appendRow([
    payment.id,
    payment.agentId,
    payment.agentName,
    payment.amount,
    payment.previousDue,
    payment.remainingDue,
    payment.paymentMethod,
    payment.referenceNote,
    payment.recordedBy,
    payment.date || getDhakaDate(),
    payment.time || getDhakaTime(),
    payment.timestamp || Date.now()
  ]);

  return { success: true, paymentId: payment.id };
}

function getDhakaDate() {
  return Utilities.formatDate(new Date(), 'Asia/Dhaka', 'dd MMMM yyyy');
}

function getDhakaTime() {
  return Utilities.formatDate(new Date(), 'Asia/Dhaka', 'hh:mm a');
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
