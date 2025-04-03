import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showValue = false,
  size = 'md',
  color = 'default',
  className = '',
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorStyles = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`${colorStyles[color]} rounded-full transition-all duration-300 ease-in-out ${sizeStyles[size]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {showValue && (
        <div className="mt-1 text-xs text-gray-500 text-right">
          {value} / {max}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
