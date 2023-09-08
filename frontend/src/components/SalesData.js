import React from 'react'
import AggregatedSaleDetails from './AggregatedSaleDetails'
import QuerySalesData from './QuerySalesData'

export default function SalesData() {
  return (
    <div>
        <h1>Monthly Sales Graph</h1>
        <QuerySalesData />
      <AggregatedSaleDetails/>
    </div>
  )
}
