import { DatewiseStatsDto } from '@/types';

interface DateWiseStatsProps {
  stats: DatewiseStatsDto;
  name: string;
}

export default function DateWiseStats({ stats, name }: DateWiseStatsProps) {
  return (
    <div className="flex flex-col gap-2 w-fit p-4 border-default border-border-primary rounded-default bg-background drop-shadow-default">
      <h2 className="text-title-small capitalize w-full text-center">{name}</h2>
      <div className="flex flex-row justify-between items-center gap-3">
        <p>Today</p>
        <p>{stats.today}</p>
      </div>

      <div className="flex flex-row justify-between items-center gap-3">
        <p>This Week</p>
        <p>{stats.thisWeek}</p>
      </div>

      <div className="flex flex-row justify-between items-center gap-3">
        <p>This Month</p>
        <p>{stats.thisMonth}</p>
      </div>
    </div>
  );
}
