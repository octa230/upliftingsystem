import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 20
  },
  logoContainer: {
    width: 120
  },
  logo: {
    width: '100%',
    height: 'auto',
    maxHeight: 60
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'right'
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25
  },
  infoColumn: {
    width: '48%'
  },
  label: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 3,
    fontWeight: 'medium'
  },
  value: {
    fontSize: 10,
    color: '#333333',
    marginBottom: 12,
    fontWeight: 'normal'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 5
  },
  table: {
    width: '100%',
    marginBottom: 30
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  tableCell: {
    fontSize: 10,
    paddingHorizontal: 5
  },
  itemCell: {
    width: '45%'
  },
  quantityCell: {
    width: '15%',
    textAlign: 'right'
  },
  rateCell: {
    width: '20%',
    textAlign: 'right'
  },
  amountCell: {
    width: '20%',
    textAlign: 'right'
  },
  totalsContainer: {
    alignSelf: 'flex-end',
    width: '40%',
    marginTop: 20
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  totalLabel: {
    fontSize: 10,
    color: '#666666'
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingTop: 5,
    marginTop: 5
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  grandTotalValue: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#999999',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10
  },
  watermark: {
    position: 'absolute',
    bottom: '40%',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#f0f0f0',
    fontSize: 60,
    fontWeight: 'bold',
    opacity: 0.1,
    transform: 'rotate(-30deg)'
  }
});

const Invoice = ({ sale }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Watermark (optional) */}
      <Text style={styles.watermark}>UPLIFTING</Text>
      
      {/* Header with logo and invoice title */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image src="/images/logo-upl.png" style={styles.logo} />
        </View>
        <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
      </View>
      
      {/* Company and invoice info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoColumn}>
          <Text style={styles.label}>UPLIFTING FLORAL STUDIO</Text>
          <Text style={styles.value}>MARASI DRIVE, BUSINESS BAY</Text>
          <Text style={styles.value}>BUILDING: BB02, DUBAI</Text>
          <Text style={styles.value}>TRN: 100551507500003</Text>
        </View>
        <View style={styles.infoColumn}>
          <Text style={styles.label}>INVOICE #</Text>
          <Text style={styles.value}>{sale.InvoiceCode}</Text>
          <Text style={styles.label}>DATE</Text>
          <Text style={styles.value}>{sale.date}</Text>
          <Text style={styles.label}>PREPARED BY</Text>
          <Text style={styles.value}>{sale.preparedBy}</Text>
        </View>
      </View>
      
      {/* Billing info */}
      <Text style={styles.sectionTitle}>BILL TO</Text>
      <View style={styles.infoContainer}>
        <View style={styles.infoColumn}>
          <Text style={styles.value}>{sale.name || 'Not provided'}</Text>
          <Text style={styles.value}>{sale.phone || 'Not provided'}</Text>
        </View>
        <View style={styles.infoColumn}>
          <Text style={styles.value}>{sale.email || 'Not provided'}</Text>
          <Text style={styles.value}>{sale.paidBy || 'Not provided'}</Text>
        </View>
      </View>
      
      {/* Items table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.itemCell, { fontWeight: 'bold' }]}>ITEM</Text>
          <Text style={[styles.tableCell, styles.quantityCell, { fontWeight: 'bold' }]}>QTY</Text>
          <Text style={[styles.tableCell, styles.rateCell, { fontWeight: 'bold' }]}>RATE</Text>
          <Text style={[styles.tableCell, styles.amountCell, { fontWeight: 'bold' }]}>AMOUNT</Text>
        </View>
        {sale.saleItems.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.itemCell]}>{item.productName}</Text>
            <Text style={[styles.tableCell, styles.quantityCell]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, styles.rateCell]}>AED {item.price.toFixed(2)}</Text>
            <Text style={[styles.tableCell, styles.amountCell]}>AED {(item.quantity * item.price).toFixed(2)}</Text>
          </View>
        ))}
      </View>
      
      {/* Totals */}
      <View style={styles.totalsContainer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>AED {sale.itemsTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Discount:</Text>
          <Text style={styles.totalValue}>- AED {sale.discount.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Taxable Amount:</Text>
          <Text style={styles.totalValue}>AED {sale.subTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>VAT (5%):</Text>
          <Text style={styles.totalValue}>AED {sale.vat.toFixed(2)}</Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.grandTotalLabel}>TOTAL DUE:</Text>
          <Text style={styles.grandTotalValue}>AED {sale.total.toFixed(2)}</Text>
        </View>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text>UPLIFTING FLORAL STUDIO | MARASI DRIVE, BUSINESS BAY, DUBAI | TRN: 100551507500003</Text>
        <Text>Website: uplifting.ae | Phone: +971542045427 | Email: info@uplifting.ae</Text>
        <Text style={{ marginTop: 5 }}>This is a computer generated invoice and does not require a signature</Text>
      </View>
    </Page>
  </Document>
);

export default Invoice;