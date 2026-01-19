import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Plus,
  GitBranch,
  Bot,
  CheckCircle,
  History,
  Settings,
  FlaskConical,
  LogOut,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToApprovals } from '../../services/firestoreService';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const bottomNavItems: NavItem[] = [
  { to: '/trash', icon: <Trash2 size={20} />, label: '휴지통' },
  { to: '/settings', icon: <Settings size={20} />, label: '설정' },
];

export function Sidebar() {
  const { user, signOut } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToApprovals((approvals) => {
      const pending = approvals.filter(a => a.status === 'pending').length;
      setPendingCount(pending);
    });
    return () => unsubscribe();
  }, []);

  const navItems: NavItem[] = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: '대시보드' },
    { to: '/new', icon: <Plus size={20} />, label: '새 연구' },
    { to: '/workflows', icon: <GitBranch size={20} />, label: '워크플로우' },
    { to: '/agents', icon: <Bot size={20} />, label: '에이전트' },
    { to: '/approvals', icon: <CheckCircle size={20} />, label: '승인 대기' },
    { to: '/history', icon: <History size={20} />, label: '실행 이력' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <FlaskConical size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Alliance</h1>
            <p className="text-xs text-gray-400">AI Co-Scientist</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.to === '/approvals' && pendingCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-500 rounded-full">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-gray-800 space-y-1">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* User Profile & Logout */}
      {user && (
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-2 mb-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || ''}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-medium">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.displayName || '사용자'}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span>로그아웃</span>
          </button>
        </div>
      )}
    </aside>
  );
}
