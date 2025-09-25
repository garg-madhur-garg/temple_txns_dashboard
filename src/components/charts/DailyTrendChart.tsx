import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { IncomeRecord } from '../../types';
import { dataProcessingService } from '../../services/dataProcessingService';
import { ChartCard } from '../ChartCard';
import styles from './DailyTrendChart.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DailyTrendChartProps {
  data: IncomeRecord[];
}

export const DailyTrendChart: React.FC<DailyTrendChartProps> = ({ data }) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  const chartData = React.useMemo(() => {
    if (data.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Group data by date
    const dailyData: Record<string, { cash: number; online: number }> = {};
    data.forEach(record => {
      if (!dailyData[record.date]) {
        dailyData[record.date] = { cash: 0, online: 0 };
      }
      dailyData[record.date].cash += record.cash;
      dailyData[record.date].online += record.online;
    });

    const sortedDates = Object.keys(dailyData).sort();
    const cashData = sortedDates.map(date => dailyData[date].cash);
    const onlineData = sortedDates.map(date => dailyData[date].online);

    return {
      labels: sortedDates.map(dataProcessingService.formatDate),
      datasets: [
        {
          label: 'Cash Income',
          data: cashData,
          borderColor: '#1FB8CD',
          backgroundColor: 'rgba(31, 184, 205, 0.1)',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Online Income',
          data: onlineData,
          borderColor: '#FFC185',
          backgroundColor: 'rgba(255, 193, 133, 0.1)',
          tension: 0.4,
          fill: false
        }
      ]
    };
  }, [data]);

  const options = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return context.dataset.label + ': ' + dataProcessingService.formatCurrency(context.parsed.y);
          }
        }
      }
    }
  }), []);

  const handleExport = () => {
    if (chartRef.current) {
      const canvas = chartRef.current.canvas;
      const link = document.createElement('a');
      link.download = `daily-trend-chart-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <ChartCard title="Daily Income Trend" onExport={handleExport}>
      <div className={styles.chartContainer}>
        <Line
          ref={chartRef}
          data={chartData}
          options={options}
        />
      </div>
    </ChartCard>
  );
};
