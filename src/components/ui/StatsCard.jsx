import { cn } from '../../utils/cn';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatsCard = ({
  title,
  value,
  change,
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  icon: Icon,
  description,
  className,
  ...props
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 dark:text-green-400';
      case 'negative':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTrendIcon = () => {
    if (changeType === 'positive') return FiTrendingUp;
    if (changeType === 'negative') return FiTrendingDown;
    return null;
  };

  const TrendIcon = getTrendIcon();

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {value}
          </p>
          
          {change && (
            <div className={cn("flex items-center gap-1 text-sm", getChangeColor())}>
              {TrendIcon && <TrendIcon className="w-4 h-4" />}
              <span>{change}</span>
            </div>
          )}
          
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {description}
            </p>
          )}
        </div>
        
        {Icon && (
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;