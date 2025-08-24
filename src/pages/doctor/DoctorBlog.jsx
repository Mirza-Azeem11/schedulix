import React from 'react';
import { FileText, Plus, Edit, Eye } from 'lucide-react';

const DoctorBlog = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'Understanding Heart Health: A Comprehensive Guide',
      excerpt: 'Learn about the importance of cardiovascular health and how to maintain a healthy heart through lifestyle changes...',
      date: '2024-01-20',
      status: 'Published',
      views: 1250
    },
    {
      id: 2,
      title: 'Managing Diabetes: Tips for Better Blood Sugar Control',
      excerpt: 'Practical advice for diabetes patients on managing their condition through diet, exercise, and medication...',
      date: '2024-01-18',
      status: 'Draft',
      views: 0
    },
    {
      id: 3,
      title: 'The Importance of Regular Health Checkups',
      excerpt: 'Why preventive care matters and how regular checkups can help detect health issues early...',
      date: '2024-01-15',
      status: 'Published',
      views: 890
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Post</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  post.status === 'Published' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                }`}>
                  {post.status}
                </span>
              </div>
              <div className="flex space-x-1">
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Edit className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Eye className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{post.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{post.excerpt}</p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{new Date(post.date).toLocaleDateString()}</span>
              <span>{post.views} views</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorBlog;