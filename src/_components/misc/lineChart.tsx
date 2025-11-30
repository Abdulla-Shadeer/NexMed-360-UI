import { KeyValuePair } from '@/types';
import ReactEChart from 'echarts-for-react';

export default function LineChart({
  data,
  title,
}: {
  data: KeyValuePair<string, number>[];
  title?: string;
}) {
  const options = {
    grid: { top: 10, right: 10, bottom: 24, left: 36 },
    xAxis: {
      type: 'category',
      data: data.flatMap((value) => value.key),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: data.flatMap((value) => value.value),
        type: 'line',
        smooth: true,
      },
    ],
    tooltip: {
      trigger: 'axis',
    },
  };

  return (
    <div className="w-full h-fit border-default border-border-primary p-4 rounded-default bg-background drop-shadow-default">
      {title && <h2 className="w-full text-title-small py-4">{title}</h2>}
      <ReactEChart option={options} className="w-full h-full" />
    </div>
  );
}
