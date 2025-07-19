'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changeType, icon, color }) => {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${changeColors[changeType || 'neutral']}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

interface ApplicationItemProps {
  id: string;
  projectName: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedDate?: string;
  amount?: number;
}

const ApplicationItem: React.FC<ApplicationItemProps> = ({ projectName, status, submittedDate, amount }) => {
  const { t } = useLanguage();
  
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    draft: t('wbso.status.draft'),
    submitted: t('wbso.status.submitted'),
    approved: t('wbso.status.approved'),
    rejected: t('wbso.status.rejected')
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{projectName}</p>
        {submittedDate && (
          <p className="text-sm text-gray-500">{t('common.submitted')}: {submittedDate}</p>
        )}
      </div>
      <div className="flex items-center space-x-4">
        {amount && (
          <span className="text-sm font-medium text-gray-600">
            €{amount.toLocaleString()}
          </span>
        )}
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </div>
    </div>
  );
};

const DashboardOverview: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Mock data - will be replaced with real data from Firebase/API
  const metrics = [
    {
      title: t('dashboard.totalApplications'),
      value: '12',
      change: '+3 ' + t('demo.thisMonth'),
      changeType: 'positive' as const,
      icon: '📋',
      color: 'bg-blue-50'
    },
    {
      title: t('dashboard.submitted'),
      value: '8',
      change: t('demo.approved'),
      changeType: 'positive' as const,
      icon: '✅',
      color: 'bg-green-50'
    },
    {
      title: t('dashboard.pendingReview'),
      value: '4',
      change: t('demo.inProgress'),
      changeType: 'neutral' as const,
      icon: '⏳',
      color: 'bg-yellow-50'
    },
    {
      title: t('dashboard.totalValue'),
      value: '€245K',
      change: '+€45K ' + t('demo.thisYear'),
      changeType: 'positive' as const,
      icon: '💰',
      color: 'bg-purple-50'
    }
  ];

  const recentApplications = [
    {
      id: '1',
      projectName: 'AI-Powered Data Analytics Platform',
      status: 'submitted' as const,
      submittedDate: '2024-01-15',
      amount: 85000
    },
    {
      id: '2',
      projectName: 'Blockchain Security Framework',
      status: 'approved' as const,
      submittedDate: '2024-01-10',
      amount: 120000
    },
    {
      id: '3',
      projectName: 'IoT Smart Manufacturing System',
      status: 'draft' as const,
      amount: 95000
    },
    {
      id: '4',
      projectName: 'Machine Learning Optimization',
      status: 'submitted' as const,
      submittedDate: '2024-01-08',
      amount: 75000
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {t('dashboard.welcome')}, {user?.displayName || t('dashboard.user')}!
            </h2>
            <p className="mt-2 opacity-90">
              {t('dashboard.welcomeMessage')}
            </p>
          </div>
          <div className="text-6xl opacity-80">
            🚀
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('dashboard.recentApplications')}
              </h3>
              <a 
                href="/applications"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {t('common.viewAll')}
              </a>
            </div>
          </div>
          <div className="p-6">
            {recentApplications.map((app) => (
              <ApplicationItem key={app.id} {...app} />
            ))}
          </div>
        </div>

        {/* Quick Actions & Progress */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('dashboard.quickActions')}
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                {t('wbso.createApplication')}
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                {t('wbso.generateWithAI')}
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors">
                {t('company.setupProfile')}
              </button>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('dashboard.progress')}
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{t('dashboard.profileComplete')}</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{t('dashboard.yearlyTarget')}</span>
                  <span>60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview; 