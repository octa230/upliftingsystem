import React from 'react'
import MonthSalesDataGraph from './MonthSalesDataGraph'
import AggregatedSaleDetails from './AggregatedSaleDetails'

export default function SalesData() {
  return (
    <div>
        <h1>Monthly Sales Graph</h1>
      <MonthSalesDataGraph />
      <AggregatedSaleDetails/>
    </div>
  )
}
