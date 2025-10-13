'use client';

// StatCards - Top statistics cards with trend indicators
import { Car, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Vehicle } from '@/lib/types';
import { formatPrice, formatPercentage, getTrendColor } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

interface StatCardsProps {
  vehicles: Vehicle[];
  previousCount?: number;
  previousValue?: number;
  previousAvgPrice?: number;
  className?: string;
}

export function StatCards({
  vehicles,
  previousCount = 0,
  previousValue = 0,
  previousAvgPrice = 0,
  className,
}: StatCardsProps) {
  const totalVehicles = vehicles.length;
  const totalValue = vehicles.reduce((sum, v) => sum + v.price, 0);
  const avgPrice = totalVehicles > 0 ? totalValue / totalVehicles : 0;

  // Calculate trends
  const countChange =
    previousCount > 0 ? ((totalVehicles - previousCount) / previousCount) * 100 : 0;
  const valueChange =
    previousValue > 0 ? ((totalValue - previousValue) / previousValue) * 100 : 0;
  const avgPriceChange =
    previousAvgPrice > 0 ? ((avgPrice - previousAvgPrice) / previousAvgPrice) * 100 : 0;

  const stats = [
    {
      label: 'Total Vehicles',
      value: totalVehicles.toString(),
      icon: Car,
      trend: countChange,
      trendLabel: 'vs. previous',
    },
    {
      label: 'Total Value',
      value: formatPrice(totalValue),
      icon: DollarSign,
      trend: valueChange,
      trendLabel: 'vs. previous',
    },
    {
      label: 'Avg. Price',
      value: formatPrice(avgPrice),
      icon: DollarSign,
      trend: avgPriceChange,
      trendLabel: 'vs. previous',
    },
  ];

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const trendColor = getTrendColor(stat.trend);
        const TrendIcon = stat.trend > 0 ? TrendingUp : TrendingDown;

        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                {stat.trend !== 0 && (
                  <div className={cn('flex items-center text-sm', trendColor.textClass)}>
                    <TrendIcon className="h-4 w-4 mr-1" />
                    {formatPercentage(Math.abs(stat.trend))}
                  </div>
                )}
              </div>

              {stat.trend !== 0 && (
                <p className="mt-2 text-xs text-gray-500">{stat.trendLabel}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
