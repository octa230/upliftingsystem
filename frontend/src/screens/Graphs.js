import React, { useState, useEffect } from 'react';
import { Chart } from 'react-google-charts';
import axios from 'axios';

export default function Graphs() {
  const [chartData, setChartData] = useState({
    lineData: [['Month', 'Purchases', 'Sales', 'Loss']],
    barData: [['Category', 'Amount']]
  });

  // Function to fetch data
  const getData = async () => {
    try {
      const [visualizeData, visualizeLoss] = await Promise.all([
        axios.get('/api/transactions/visualize'),
        axios.get('/api/transactions/visualize-loss'),
      ]);
  
      // Simplify line chart data (monthly trends)
      const lineData = [
        ['Month', 'Purchases', 'Sales', 'Damages', 'Loss'],
        ...visualizeData.data.slice(1).map(item => [
          item[0],       // Month (e.g., "2023-01")
          item[1] || 0,  // Purchases (column 1 from API)
          item[2] || 0,  // Sales (column 2 from API)
          item[3] || 0,  // Damages (column 3 from API)
          (item[1] - item[2] - item[3]) // Loss (Purchases - Sales - Damages)
        ])
      ];
  
      // Simplify bar chart data (overall summary)
      const barData = [
        ['Category', 'Amount'],
        ['Total Purchases', visualizeLoss.data.barGraph[1][2]], // Using amount value
        ['Total Sales', visualizeLoss.data.barGraph[2][2]],
        ['Total Damages', visualizeLoss.data.barGraph[3][2]],
        ['Net Loss', visualizeLoss.data.barGraph[4][2]]
      ];
  
      setChartData({ lineData, barData });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  useEffect(()=>{
    getData()
  }, [])

  return (
    <div>
    <h2>Monthly Profit/Loss Trend</h2>
    <Chart
      chartType="LineChart"
      width="100%"
      height="400px"
      data={chartData.lineData}
      options={{
        hAxis: { title: 'Month' },
        vAxis: { title: 'Amount' },
        series: {
          0: { color: '#3366cc' }, // Purchases - blue
          1: { color: '#109618' }, // Sales - green
          2: { color: '#FF9800' }, // Damages - orange
          3: { color: '#dc3912' }  // Loss - red
        }
      }}
    />

    <h2>Profit/Loss Summary</h2>
    <Chart
      chartType="BarChart"
      width="100%"
      height="400px"
      data={chartData.barData}
      options={{
        hAxis: { title: 'Amount' },
        vAxis: { title: 'Category' },
        colors: ['#3366cc', '#109618', '#dc3912', '#ff9900']
      }}
    />
  </div>
  );
}
