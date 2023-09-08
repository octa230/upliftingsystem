import React from 'react'
import AggregatedSaleDetails from './AggregatedSaleDetails'
import QuerySalesData from './QuerySalesData'

export default function SalesData() {
  return (
    <div>
        <QuerySalesData />
      <AggregatedSaleDetails/>
    </div>
  )
}
