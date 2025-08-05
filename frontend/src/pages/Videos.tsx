import { Video, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Videos() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Videos</h1>
          <p className="text-gray-600 mt-1">
            Manage all your screen recordings
          </p>
        </div>
        <Link
          to="/dashboard/record"
          className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-150"
        >
          <Video className="h-4 w-4 mr-2" />
          New Recording
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
          </div>
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option>All Videos</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
          <div className="flex items-center space-x-2 ml-auto">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search videos..."
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Content placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Videos page coming soon</h3>
        <p className="text-gray-600">This page will show all your videos with advanced filtering and management options.</p>
      </div>
    </div>
  );
}
