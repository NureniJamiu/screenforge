import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Plus, Video, Edit, Share2, Download, Trash2, Eye, Clock, Calendar, TrendingUp, Users, Play } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with actual API call
    setTimeout(() => {
      setVideos([
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
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName || 'Creator'}! 👋
        </h1>
        <p className="text-gray-600">
          Manage your screen recordings and track their performance
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/record"
            className="inline-flex items-center text-blue-600 px-6 py-3 rounded-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Recording
          </Link>
          <button className="flex items-center border border-gray-300 text-gray-700 px-6 py-3 rounded-lg">
            <Video className="h-5 w-5 mr-2" />
            Import Video
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Video className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Videos</p>
              <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {videos.reduce((sum, video) => sum + video.views, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Share2 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Shared Videos</p>
              <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Download className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Downloads Enabled</p>
              <p className="text-2xl font-bold text-gray-900">
                {videos.filter(v => v.downloadEnabled).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Recordings</h2>
        </div>

        {videos.length === 0 ? (
          <div className="p-12 text-center">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recordings yet</h3>
            <p className="text-gray-600 mb-6">Start by creating your first screen recording</p>
            <Link
              to="/record"
              className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Recording
            </Link>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-100 relative">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 truncate">{video.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Created on {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {video.views} views
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        video.downloadEnabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {video.downloadEnabled ? 'Download: ON' : 'Download: OFF'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/edit/${video.id}`}
                        className="flex-1 flex items-center justify-center bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                      <Link
                        to={`/video/${video.shareToken}`}
                        className="flex-1 flex items-center justify-center bg-primary-600 text-white px-3 py-2 rounded hover:bg-primary-700 transition-colors"
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Link>
                      <button className="flex items-center justify-center text-red-600 px-3 py-2 rounded hover:bg-red-50 transition-colors">
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
