import React from 'react';

const Chart = ({ title, data, type }) => {
  const maxValue = Math.max(...data.map(item => item[type] || 0));
  const getValue = (item) => item[type] || 0;

  return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{title}</h3>
        <div className="flex items-end justify-between h-64 space-x-2">
          {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                    className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-purple-600"
                    style={{
                      height: `${(getValue(item) / maxValue) * 100}%`,
                      minHeight: '4px'
                    }}
                />
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.month}</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {type === 'revenue'
                        ? `$${(getValue(item) / 1000).toFixed(0)}k`
                        : getValue(item)}
                  </p>
                </div>
              </div>
          ))}
        </div>
      </div>
  );
};

export default Chart;
