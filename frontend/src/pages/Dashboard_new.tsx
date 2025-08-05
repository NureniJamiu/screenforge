import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Plus, Video, Edit, Share2, Trash2, Eye, Clock, Calendar, TrendingUp, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

interface VideoRecording {
  id: string;
  title: string;
  duration: string;
  createdAt: string;
  thumbnailUrl: string;
  shareToken: string;
  downloadEnabled: boolean;
  views: number;
}

interface DashboardStats {
  totalVideos: number;
  totalViews: number;
  totalDuration: string;
  thisWeekViews: number;
}

export function Dashboard() {
  const { user } = useUser();
  const [videos, setVideos] = useState<VideoRecording[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalVideos: 0,
    totalViews: 0,
    totalDuration: '0:00',
    thisWeekViews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with actual API call
    setTimeout(() => {
      const mockVideos = [
        {
          id: '1',
          title: 'Product Demo Recording',
          duration: '3:45',
          createdAt: '2025-08-01',
          thumbnailUrl: '/api/placeholder/320/180',
          shareToken: 'abc123',
          downloadEnabled: true,
          views: 42
        },
        {
          id: '2',
          title: 'Tutorial - Getting Started',
          duration: '8:22',
          createdAt: '2025-07-30',
          thumbnailUrl: '/api/placeholder/320/180',
          shareToken: 'def456',
          downloadEnabled: false,
          views: 128
        },
        {
          id: '3',
          title: 'Feature Walkthrough',
          duration: '5:15',
          createdAt: '2025-07-28',
          thumbnailUrl: '/api/placeholder/320/180',
          shareToken: 'ghi789',
          downloadEnabled: true,
          views: 64
        }
      ];

      setVideos(mockVideos);
      setStats({
        totalVideos: mockVideos.length,
        totalViews: mockVideos.reduce((acc, video) => acc + video.views, 0),
        totalDuration: '17:22',
        thisWeekViews: 156
      });
      setLoading(false);
    }, 1000);
  }, []);

  const statCards = [
    {
      title: 'Total Videos',
      value: stats.totalVideos,
      icon: Video,
      description: 'All recordings',
      trend: '+12%',
      color: 'blue'
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      description: 'Lifetime views',
      trend: '+23%',
      color: 'green'
    },
    {
      title: 'Total Duration',
      value: stats.totalDuration,
      icon: Clock,
      description: 'Recording time',
      trend: '+8%',
      color: 'purple'
    },
    {
      title: 'This Week',
      value: stats.thisWeekViews,
      icon: TrendingUp,
      description: 'Weekly views',
      trend: '+34%',
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                    <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome back, {user?.firstName || 'User'}! 👋
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your recordings today.
            </p>
          </div>
          <Link
            to="/record"
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-150 shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Recording
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-green-600 text-sm font-medium">{card.trend}</span>
                    <span className="text-gray-500 text-sm ml-2">{card.description}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg border ${getColorClasses(card.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Videos */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Videos</h2>
            <Link to="/videos" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all
            </Link>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-3 bg-gray-100 rounded-full mb-4">
              <Video className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recordings yet</h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Start by creating your first screen recording to share with your team or audience.
            </p>
            <Link
              to="/record"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-150"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Recording
            </Link>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-150">
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-150 flex items-center justify-center">
                      <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
                      {video.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(video.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {video.views} views
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        video.downloadEnabled
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {video.downloadEnabled ? 'Download enabled' : 'View only'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/edit/${video.id}`}
                        className="flex-1 flex items-center justify-center bg-gray-50 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-150 text-sm font-medium"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                      <Link
                        to={`/video/${video.shareToken}`}
                        className="flex-1 flex items-center justify-center bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-150 text-sm font-medium"
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Link>
                      <button className="flex items-center justify-center text-red-600 px-3 py-2 rounded-md hover:bg-red-50 transition-colors duration-150">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
