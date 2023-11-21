import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4',
    alignItems: 'center',
    padding: 22,
  },
  section: {
    //margin: 0,
    position: 'relative',
    marginTop: 12,
    flexGrow: 1,
    padding: 2
  },

  address:{
    position: 'absolute',
    alignSelf: 'flex-end',
    right: 5,
    padding: 3,
  },

  adressText:{
    textAlign: 'center',
    fontSize: 12

  },

  header: {
    fontSize: 12,
    fontWeight: 'bold',
    padding: '2px',
    width:'100%'
  },
  subHeader: {
    fontSize: 12,
    padding: '5px'
  },
  logo: {
    width: '40%',
    position: 'absolute',
    top: 14,
    right: '40%',
    height: 66,
  },
  table: {
    display: 'table',
    width: '80%',
    borderStyle: 'solid',
    //borderWidth: 1,
    borderCollapse: 'collapse',
    marginTop: 20,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
    width:'100%'
  },
  tableCell: {
    width: '100%',
    borderStyle: 'solid',
    //borderColor: '#000',
    borderWidth: 1,
    padding: 3,
  },

  totalTable: {
    display: 'table',
    width: '80%',
    height: 120,
    marginTop: 20,
  },
  totalTableRow: {
    flexDirection: 'row',
  },
  totalTableHeader: {
    width: '75%',
    borderStyle: 'solid',
    borderColor: '#000',
    borderWidth: 1,
    fontSize: 12,
    padding: 5,
  },
  totalTableCell: {
    width: '100%',
    borderStyle: 'solid',
    borderColor: '#000',
    borderWidth: 1,
    fontSize: 12,
    padding: 3,
  },
  tableFont:{
    fontSize: 12
  },
  footer:{
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 12,
    alignSelf: 'center',
    fontSize: 8,
    padding: 3,
    width: '70%'
  },
  footnote:{
    textAlign: 'center',
    fontWeight: 100,
    width:'100%',
    marginTop: '90px'
  }
});

const InvoiceTwo = ({ sale }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>Invoice: {sale.InvoiceCode}</Text>
        <Text style={styles.subHeader}>Name: {sale.customer}</Text>
        <Text style={styles.subHeader}>Paid By: {sale.paidBy}</Text>
        <Text style={styles.subHeader}>Date: {sale.date}</Text>
        <Text style={styles.subHeader}>Status: {sale.free ? 'F.O.C' : 'CHARGED'}</Text>

        <View style={styles.address}>
        <Text style={styles.adressText}>UPLIFTING FLORAL STUDIO</Text>
        <Text style={styles.adressText}>Business Bay Dubai</Text>
        <Text style={styles.adressText}>BUILDING: BB02</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.header}>Product</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.header}>Quantity</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.header}>Price</Text>
            </View>
          </View>

          {sale.saleItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.tableFont}>{item.name}</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.tableFont}>{item.quantity}</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.tableFont}>{item.price}</Text>
              </View>
            </View>
            
          ))}
        </View>
        {/* Table for Subtotal, VAT, Discount, and Total */}
      <View style={styles.totalTable}>
        <View style={styles.totalTableRow}>
          <View style={styles.totalTableHeader}>
            <Text style={styles.header}>Description</Text>
          </View>
          <View style={styles.totalTableCell}>
            <Text style={styles.header}>Amount</Text>
          </View>
        </View>
        <View style={styles.totalTableRow}>
          <View style={styles.totalTableHeader}>
            <Text>Subtotal</Text>
          </View>
          <View style={styles.totalTableCell}>
            <Text>AED {sale.subTotal}</Text>
          </View>
        </View>
        <View style={styles.totalTableRow}>
          <View style={styles.totalTableHeader}>
            <Text>VAT (5%)</Text>
          </View>
          <View style={styles.totalTableCell}>
            <Text>AED {sale.taxPrice}</Text>
          </View>
        </View>
        <View style={styles.totalTableRow}>
          <View style={styles.totalTableHeader}>
            <Text>Discount</Text>
          </View>
          <View style={styles.totalTableCell}>
            <Text>AED {sale.discount}</Text>
          </View>
        </View>
        <View style={styles.totalTableRow}>
          <View style={styles.totalTableHeader}>
            <Text>Total</Text>
          </View>
          <View style={styles.totalTableCell}>
            <Text>AED {sale.totalPrice}</Text>
          </View>
          </View>
        </View>
        
        <View style={styles.footnote}>
            <Text style={styles.footnote}>
                Welcome To Our Floral Paradise
            </Text>
        </View>
        <View style={styles.footer}>
            <Text style={styles.footer}>WEBSITE: uplifting.ae</Text>
            <Text style={styles.footer}>INSTAGRAM: Upliftingdxb</Text>
            <Text style={styles.footer}>WHATSAPP: +971542045427</Text>
        </View>
      </View> 
      <Image src="/images/logo-upl.png" style={styles.logo} />
    </Page>
  </Document>
);

export default InvoiceTwo;