import React from 'react'
import { Document, Text, View, Page, StyleSheet } from '@react-pdf/renderer'


export default function MyDocument(props) {
    const {sale}=props 
    const styles = StyleSheet.create({
        page: {flexDirection: 'row'},
        section: {flexGrow: 1, margin: 10, padding: 10}
    })


  return (
    <Document>
        <Page size='A4' style={styles.page}>
            <View style={styles.section}>
                <Text>section #1</Text>
            </View>
            <View style={styles.section}>
                <Text>Section 2</Text>
            </View>
        </Page> 
    </Document>
  )
}
