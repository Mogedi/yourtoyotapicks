'use client';

// StatCards - Quality tier statistics for curator dashboard
import { Card, CardContent } from '@/components/ui/card';
import type { Vehicle } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatCardsProps {
  vehicles: Vehicle[];
  className?: string;
}

export function StatCards({ vehicles, className }: StatCardsProps) {
  // Calculate quality tier counts
  const topPicks = vehicles.filter((v) => v.priority_score >= 80).length;
  const goodBuys = vehicles.filter(
    (v) => v.priority_score >= 65 && v.priority_score < 80
  ).length;
  const caution = vehicles.filter((v) => v.priority_score < 65).length;

  const stats = [
    {
      label: '🟩 Top Picks',
      value: topPicks.toString(),
      description: 'Score 80+',
      bgClass: 'bg-green-50',
      iconColorClass: 'text-green-600',
      textClass: 'text-green-900',
    },
    {
      label: '🟨 Good Buys',
      value: goodBuys.toString(),
      description: 'Score 65-79',
      bgClass: 'bg-yellow-50',
      iconColorClass: 'text-yellow-600',
      textClass: 'text-yellow-900',
    },
    {
      label: '⚪ Needs Review',
      value: caution.toString(),
      description: 'Score <65',
      bgClass: 'bg-gray-50',
      iconColorClass: 'text-gray-600',
      textClass: 'text-gray-900',
    },
  ];

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}>
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <div className={cn('p-2 rounded-lg', stat.bgClass)}>
                <div className={cn('text-2xl', stat.iconColorClass)}>
                  {stat.label.split(' ')[0]}
                </div>
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <h3 className={cn('text-3xl font-bold', stat.textClass)}>
                {stat.value}
              </h3>
            </div>

            <p className="mt-2 text-xs text-gray-500">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
