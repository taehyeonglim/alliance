import { useState, useEffect } from 'react';
import { Save, RefreshCw, Bell, Palette, Server, Database, Cloud, Check } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { getStats } from '../services/firestoreService';

export function Settings() {
  const [apiUrl, setApiUrl] = useState('http://localhost:3001/api');
  const [wsUrl, setWsUrl] = useState('ws://localhost:3001');
  const [llmModel, setLlmModel] = useState('gpt-4');
  const [temperature, setTemperature] = useState(0.7);
  const [language, setLanguage] = useState('ko');
  const [theme, setTheme] = useState('system');
  const [notifications, setNotifications] = useState({
    approvalRequired: true,
    workflowComplete: true,
    errors: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    pendingApprovals: 0,
    activeWorkflows: 0,
  });

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div>
      <Header title="설정" subtitle="시스템 및 환경 설정" />

      <div className="p-6 max-w-3xl">
        {/* API Settings */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server size={20} className="text-gray-500" />
              API 설정
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API 서버 URL
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                WebSocket URL
              </label>
              <input
                type="text"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* LLM Settings */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <RefreshCw size={20} className="text-gray-500" />
              LLM 설정
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                모델
              </label>
              <select
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Temperature: {temperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>정확함 (0)</span>
                <span>창의적 (1)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette size={20} className="text-gray-500" />
              외관
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                테마
              </label>
              <div className="flex gap-3">
                {[
                  { value: 'light', label: '라이트' },
                  { value: 'dark', label: '다크' },
                  { value: 'system', label: '시스템' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex-1 p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                      theme === option.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={option.value}
                      checked={theme === option.value}
                      onChange={(e) => setTheme(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                언어
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Data Management - Firebase */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database size={20} className="text-gray-500" />
              데이터 관리
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Cloud size={20} className="text-green-600" />
                <span className="font-medium text-green-700 dark:text-green-400">
                  Firebase 클라우드 연결됨
                </span>
                <Check size={16} className="text-green-600" />
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                데이터가 Firebase Firestore에 실시간으로 동기화됩니다.
                여러 기기에서 동일한 데이터에 접근할 수 있습니다.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                현재 저장된 데이터
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalWorkflows}</p>
                  <p className="text-xs text-gray-500">연구 프로젝트</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingApprovals}</p>
                  <p className="text-xs text-gray-500">승인 대기</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeWorkflows}</p>
                  <p className="text-xs text-gray-500">진행 중</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              * Firebase 무료 티어: Firestore 1GB 저장, 일 50K 읽기/20K 쓰기
            </p>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell size={20} className="text-gray-500" />
              알림
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                승인 필요 시 알림
              </span>
              <input
                type="checkbox"
                checked={notifications.approvalRequired}
                onChange={(e) =>
                  setNotifications({ ...notifications, approvalRequired: e.target.checked })
                }
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                워크플로우 완료 시 알림
              </span>
              <input
                type="checkbox"
                checked={notifications.workflowComplete}
                onChange={(e) =>
                  setNotifications({ ...notifications, workflowComplete: e.target.checked })
                }
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                오류 발생 시 알림
              </span>
              <input
                type="checkbox"
                checked={notifications.errors}
                onChange={(e) =>
                  setNotifications({ ...notifications, errors: e.target.checked })
                }
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Save size={20} />}
            onClick={handleSave}
            isLoading={isSaving}
          >
            설정 저장
          </Button>
        </div>
      </div>
    </div>
  );
}
