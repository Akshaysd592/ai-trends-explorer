'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '../../lib/trends-api';
import type { DashboardStats } from '@/lib/types/index';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
  });

  if (error) {
    return (
      <div className="page">
        <main className="container">
          <div className="error-banner">
            <span className="error-banner__icon">⚠️</span>
            <div>
              <strong>Unable to load dashboard</strong>
              <p>{error instanceof Error ? error.message : 'Failed to load dashboard data'}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <main className="container">
        {/* Stats Overview */}
        <div className="dashboard__stats-grid">
          <Card>
            <CardHeader className="dashboard__stat-header">
              <CardTitle className="dashboard__stat-title">Total Trends</CardTitle>
              <CardDescription>All tracked projects</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="dashboard__stat-value" />
              ) : (
                <div className="dashboard__stat-value">{stats?.totalTrends.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="dashboard__stat-header">
              <CardTitle className="dashboard__stat-title">Total Stars</CardTitle>
              <CardDescription>GitHub stars</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="dashboard__stat-value" />
              ) : (
                <div className="dashboard__stat-value">{stats?.totalStars.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="dashboard__stat-header">
              <CardTitle className="dashboard__stat-title">Avg Score</CardTitle>
              <CardDescription>Average trend score</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="dashboard__stat-value" />
              ) : (
                <div className="dashboard__stat-value">{stats?.averageScore.toFixed(1)}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="dashboard__stat-header">
              <CardTitle className="dashboard__stat-title">Sources</CardTitle>
              <CardDescription>Active data sources</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="dashboard__stat-value" />
              ) : (
                <div className="dashboard__stat-value">
                  {(stats?.sources.github || 0) + (stats?.sources.huggingface || 0)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="dashboard__charts-grid">
          {/* Top Languages Chart */}
          <Card className="dashboard__chart-card">
            <CardHeader>
              <CardTitle>Top Languages</CardTitle>
              <CardDescription>Most popular programming languages</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : stats?.topLanguages && stats.topLanguages.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={stats.topLanguages}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis
                      dataKey="language"
                      stroke="#64748b"
                      style={{ fontSize: '0.75rem' }}
                    />
                    <YAxis stroke="#64748b" style={{ fontSize: '0.75rem' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '0.5rem',
                        color: '#e2e8f0',
                      }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="dashboard__no-data">No data available</div>
              )}
            </CardContent>
          </Card>

          {/* Source Distribution Chart */}
          <Card className="dashboard__chart-card">
            <CardHeader>
              <CardTitle>Source Distribution</CardTitle>
              <CardDescription>Trends by data source</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : stats?.sources ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'GitHub', value: stats.sources.github },
                        { name: 'Hugging Face', value: stats.sources.huggingface },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#6366f1" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '0.5rem',
                        color: '#e2e8f0',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="dashboard__no-data">No data available</div>
              )}
            </CardContent>
          </Card>

          {/* Top Topics Chart */}
          <Card className="dashboard__chart-card dashboard__chart-card--full">
            <CardHeader>
              <CardTitle>Top Topics</CardTitle>
              <CardDescription>Most popular AI/ML topics</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : stats?.topTopics && stats.topTopics.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={stats.topTopics} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis type="number" stroke="#64748b" style={{ fontSize: '0.75rem' }} />
                    <YAxis
                      type="category"
                      dataKey="topic"
                      stroke="#64748b"
                      style={{ fontSize: '0.75rem' }}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '0.5rem',
                        color: '#e2e8f0',
                      }}
                    />
                    <Bar dataKey="count" fill="#22d3ee" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="dashboard__no-data">No data available</div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>
            AI Trend Explorer — Dashboard Analytics
          </p>
        </div>
      </footer>
    </div>
  );
}