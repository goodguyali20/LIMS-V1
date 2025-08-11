import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { ExportOptions, TestOrder, Patient, InventoryItem, QCSample } from '../types';

// Excel export functions
export const exportToExcel = (
  data: any[],
  filename: string,
  sheetName: string = 'Data'
) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Auto-size columns
  const columnWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = columnWidths;
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
};

// CSV export function
export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};

// PDF export functions
export const exportToPDF = (
  data: any[],
  filename: string,
  title: string,
  columns: string[] = []
) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  
  // Add timestamp
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
  if (data.length === 0) {
    doc.setFontSize(12);
    doc.text('No data available', 14, 50);
    doc.save(`${filename}.pdf`);
    return;
  }

  // Prepare table data
  const tableColumns = columns.length > 0 ? columns : Object.keys(data[0]);
  const tableData = data.map(row => 
    tableColumns.map(col => row[col]?.toString() || '')
  );

  // Add table
  (doc as any).autoTable({
    head: [tableColumns],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  doc.save(`${filename}.pdf`);
};

// Specific export functions for different data types
export const exportOrders = (
  orders: TestOrder[],
  options: ExportOptions
) => {
  const processedData = orders.map(order => ({
    'Order ID': order.id,
    'Patient Name': order.patientName,
    'Patient ID': order.patientId,
    'Referring Doctor': order.referringDoctor,
    'Order Date': new Date(order.orderDate).toLocaleDateString(),
    'Status': order.status,
    'Priority': order.priority,
    'Total Price': `$${order.totalPrice.toFixed(2)}`,
    'Tests Count': order.tests.length,
    'Created By': order.createdBy,
    'Created At': new Date(order.createdAt).toLocaleString(),
  }));

  const filename = `orders_${new Date().toISOString().split('T')[0]}`;
  
  switch (options.format) {
    case 'excel':
      exportToExcel(processedData, filename, 'Orders');
      break;
    case 'csv':
      exportToCSV(processedData, filename);
      break;
    case 'pdf':
      exportToPDF(processedData, filename, 'Test Orders Report');
      break;
  }
};

export const exportPatients = (
  patients: Patient[],
  options: ExportOptions
) => {
  const processedData = patients.map(patient => ({
    'Patient ID': patient.patientId,
    'Name': patient.name,
    'Age': patient.age,
    'Gender': patient.gender,
    'Phone': patient.phone,
    'Email': patient.email || '',
    'Address': patient.address || '',
    'Date of Birth': patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '',
    'Emergency Contact': patient.emergencyContact || '',
    'Insurance Provider': patient.insuranceProvider || '',
    'Insurance Number': patient.insuranceNumber || '',
    'Created At': new Date(patient.createdAt).toLocaleString(),
  }));

  const filename = `patients_${new Date().toISOString().split('T')[0]}`;
  
  switch (options.format) {
    case 'excel':
      exportToExcel(processedData, filename, 'Patients');
      break;
    case 'csv':
      exportToCSV(processedData, filename);
      break;
    case 'pdf':
      exportToPDF(processedData, filename, 'Patients Report');
      break;
  }
};

export const exportInventory = (
  inventory: InventoryItem[],
  options: ExportOptions
) => {
  const processedData = inventory.map(item => ({
    'Item Name': item.name,
    'Category': item.category,
    'Quantity': item.quantity,
    'Min Quantity': item.minQuantity,
    'Max Quantity': item.maxQuantity,
    'Unit': item.unit,
    'Status': item.status,
    'Expiry Date': item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '',
    'Supplier': item.supplier,
    'Cost': `$${item.cost.toFixed(2)}`,
    'Location': item.location,
    'Notes': item.notes || '',
    'Created At': new Date(item.createdAt).toLocaleString(),
  }));

  const filename = `inventory_${new Date().toISOString().split('T')[0]}`;
  
  switch (options.format) {
    case 'excel':
      exportToExcel(processedData, filename, 'Inventory');
      break;
    case 'csv':
      exportToCSV(processedData, filename);
      break;
    case 'pdf':
      exportToPDF(processedData, filename, 'Inventory Report');
      break;
  }
};

export const exportQCSamples = (
  samples: QCSample[],
  options: ExportOptions
) => {
  const processedData = samples.map(sample => ({
    'Sample ID': sample.id,
    'Test Name': sample.testName,
    'Department': sample.department,
    'Date': new Date(sample.date).toLocaleDateString(),
    'Status': sample.status,
    'Operator': sample.operator,
    'Results Count': sample.results.length,
    'Notes': sample.notes || '',
  }));

  const filename = `qc_samples_${new Date().toISOString().split('T')[0]}`;
  
  switch (options.format) {
    case 'excel':
      exportToExcel(processedData, filename, 'QC Samples');
      break;
    case 'csv':
      exportToCSV(processedData, filename);
      break;
    case 'pdf':
      exportToPDF(processedData, filename, 'QC Samples Report');
      break;
  }
};

// Analytics export
export const exportAnalytics = (
  data: any,
  _options: ExportOptions
) => {
  const processedData = [
    {
      'Metric': 'Total Orders',
      'Value': data.orders?.total || 0,
      'Unit': 'orders',
    },
    {
      'Metric': 'Pending Orders',
      'Value': data.orders?.pending || 0,
      'Unit': 'orders',
    },
    {
      'Metric': 'Completed Orders',
      'Value': data.orders?.completed || 0,
      'Unit': 'orders',
    },
    {
      'Metric': 'Monthly Revenue',
      'Value': `$${(data.revenue?.monthly || 0).toLocaleString()}`,
      'Unit': 'USD',
    },
    {
      'Metric': 'Total Tests',
      'Value': data.tests?.total || 0,
      'Unit': 'tests',
    },
    {
      'Metric': 'Average Turnaround Time',
      'Value': `${data.performance?.averageTurnaroundTime || 0}h`,
      'Unit': 'hours',
    },
    {
      'Metric': 'On-Time Delivery',
      'Value': `${data.performance?.onTimeDelivery || 0}%`,
      'Unit': 'percentage',
    },
  ];

  const filename = `analytics_${new Date().toISOString().split('T')[0]}`;
  
  switch (options.format) {
    case 'excel':
      exportToExcel(processedData, filename, 'Analytics');
      break;
    case 'csv':
      exportToCSV(processedData, filename);
      break;
    case 'pdf':
      exportToPDF(processedData, filename, 'Analytics Report');
      break;
  }
};

// Bulk export function
export const bulkExport = async (
  dataSets: {
    orders?: TestOrder[];
    patients?: Patient[];
    inventory?: InventoryItem[];
    qcSamples?: QCSample[];
    analytics?: any;
  },
  options: ExportOptions
) => {
  const workbook = XLSX.utils.book_new();
  
  if (dataSets.orders) {
    const ordersData = dataSets.orders.map(order => ({
      'Order ID': order.id,
      'Patient Name': order.patientName,
      'Status': order.status,
      'Priority': order.priority,
      'Total Price': order.totalPrice,
      'Order Date': new Date(order.orderDate).toLocaleDateString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
  }
  
  if (dataSets.patients) {
    const patientsData = dataSets.patients.map(patient => ({
      'Patient ID': patient.patientId,
      'Name': patient.name,
      'Age': patient.age,
      'Gender': patient.gender,
      'Phone': patient.phone,
    }));
    const worksheet = XLSX.utils.json_to_sheet(patientsData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients');
  }
  
  if (dataSets.inventory) {
    const inventoryData = dataSets.inventory.map(item => ({
      'Item Name': item.name,
      'Category': item.category,
      'Quantity': item.quantity,
      'Status': item.status,
      'Cost': item.cost,
    }));
    const worksheet = XLSX.utils.json_to_sheet(inventoryData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
  }
  
  if (dataSets.qcSamples) {
    const qcData = dataSets.qcSamples.map(sample => ({
      'Sample ID': sample.id,
      'Test Name': sample.testName,
      'Department': sample.department,
      'Status': sample.status,
      'Date': new Date(sample.date).toLocaleDateString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(qcData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'QC Samples');
  }
  
  const filename = `smartlab_export_${new Date().toISOString().split('T')[0]}`;
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
};

// Export utility functions
export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: Date | string, format: string = 'MM/DD/YYYY') => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return d.toLocaleDateString();
  }
};

export const formatDateTime = (date: Date | string) => {
  return new Date(date).toLocaleString();
};

// Export types
export type ExportFormat = 'excel' | 'csv' | 'pdf';
export type ExportData = TestOrder[] | Patient[] | InventoryItem[] | QCSample[] | any; 