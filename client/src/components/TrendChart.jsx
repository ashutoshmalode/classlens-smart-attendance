import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export const TrendChart = () => {
  // Chart config and options with custom colors matching our HSL theme variables
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#9ca3af',
          font: {
            family: 'Inter',
            weight: '600',
          },
        },
      },
      tooltip: {
        backgroundColor: '#11131c',
        titleColor: '#fff',
        bodyColor: '#e5e7eb',
        borderColor: '#1e2230',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#9ca3af',
        },
      },
      x: {
        grid: {
          color: 'transparent',
        },
        ticks: {
          color: '#9ca3af',
        },
      },
    },
  };

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Present Rate (%)',
        data: [82, 85, 78, 91, 88, 72, 94],
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
      },
      {
        fill: true,
        label: 'Absence Rate (%)',
        data: [18, 15, 22, 9, 12, 28, 6],
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.05)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="glass p-6 rounded-2xl h-[340px]">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider text-left mb-4">
        Attendance trends (Past 7 sessions)
      </h3>
      <div className="h-[250px]">
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default TrendChart;
