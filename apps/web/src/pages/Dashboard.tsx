import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { api } from '../api/client';
import { MetricsSummary, Insight } from '../types';
import { TrendingUp, TrendingDown, Clock, Target, Award } from 'lucide-react';

export function Dashboard() {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, insightsData] = await Promise.all([
          api.metrics.getSummary(),
          api.insights.getAll(),
        ]);
        setMetrics(metricsData);
        setInsights(insightsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tasks</p>
                <p className="text-2xl font-bold">{metrics?.total_tasks || 0}</p>
              </div>
              <Target className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">{metrics?.completed_tasks || 0}</p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Hours</p>
                <p className="text-2xl font-bold">{metrics?.total_hours || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Score</p>
                <p className="text-2xl font-bold">{metrics?.total_score || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>Productivity Overview</CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Average Productivity</p>
                <p className="text-3xl font-bold text-primary-600">
                  {metrics?.average_productivity || 0}
                </p>
                <p className="text-xs text-gray-400">score per day</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Insights</CardHeader>
          <CardContent>
            {insights.length === 0 ? (
              <p className="text-gray-500 text-sm">No insights available yet.</p>
            ) : (
              <ul className="space-y-3">
                {insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    {insight.change && insight.change > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                    ) : insight.change && insight.change < 0 ? (
                      <TrendingDown className="w-4 h-4 text-red-500 mt-0.5" />
                    ) : (
                      <div className="w-4 h-4 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm text-gray-700">{insight.message}</p>
                      <p className="text-xs text-gray-400 capitalize">
                        {insight.type}{' '}
                        {insight.change && `- ${insight.change > 0 ? '+' : ''}${insight.change}%`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
