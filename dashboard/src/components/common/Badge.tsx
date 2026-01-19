import { type ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
};

const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-500',
  primary: 'bg-primary-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />
      )}
      {children}
    </span>
  );
}

// Status-specific badge component
type StatusType = 'idle' | 'running' | 'pending_approval' | 'pending' | 'completed' | 'error' | 'paused';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: BadgeSize;
  showDot?: boolean;
}

const statusConfig: Record<string, { label: string; labelKo: string; variant: BadgeVariant }> = {
  idle: { label: 'Idle', labelKo: '대기 중', variant: 'default' },
  running: { label: 'Running', labelKo: '실행 중', variant: 'info' },
  pending_approval: { label: 'Pending', labelKo: '승인 대기', variant: 'warning' },
  pending: { label: 'Pending', labelKo: '대기 중', variant: 'warning' },
  completed: { label: 'Completed', labelKo: '완료', variant: 'success' },
  error: { label: 'Error', labelKo: '오류', variant: 'danger' },
  paused: { label: 'Paused', labelKo: '일시정지', variant: 'warning' },
};

const defaultConfig = { label: 'Unknown', labelKo: '알 수 없음', variant: 'default' as BadgeVariant };

export function StatusBadge({ status, size = 'sm', showDot = true }: StatusBadgeProps) {
  const config = statusConfig[status] || defaultConfig;
  return (
    <Badge variant={config.variant} size={size} dot={showDot}>
      {config.labelKo}
    </Badge>
  );
}
