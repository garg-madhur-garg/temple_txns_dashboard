import React from 'react';
import { IncomeRecord } from '../types';
import { DailyTrendChart } from './charts/DailyTrendChart';
import { DepartmentChart } from './charts/DepartmentChart';
import { PaymentMethodChart } from './charts/PaymentMethodChart';
import styles from './ChartsSection.module.css';

interface ChartsSectionProps {
  data: IncomeRecord[];
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ data }) => {
  return (
    <section className={styles.chartsSection} aria-labelledby="charts-heading">
      <h2 id="charts-heading" className="sr-only">Data Visualization Charts</h2>
      <div className={styles.chartsGrid}>
        <DailyTrendChart data={data} />
        <DepartmentChart data={data} />
        <PaymentMethodChart data={data} />
      </div>
    </section>
  );
};
