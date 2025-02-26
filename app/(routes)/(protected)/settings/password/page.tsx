'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // バリデーション
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('すべての項目を入力してください');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('新しいパスワードは8文字以上である必要があります');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('新しいパスワードと確認用パスワードが一致しません');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'パスワードの更新に失敗しました');
      }

      setSuccess('パスワードが正常に更新されました');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // 3秒後に設定ページに戻る
      setTimeout(() => {
        router.push('/settings');
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/settings')}
              className="mr-4 text-gray-600 hover:text-gray-800"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              パスワード変更
            </h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700"
              >
                現在のパスワード
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-navy-600 rounded-md shadow-sm focus:outline-none focus:ring-navy-600 focus:border-navy-600 sm:text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                新しいパスワード
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-navy-600 rounded-md shadow-sm focus:outline-none focus:ring-navy-600 focus:border-navy-600 sm:text-sm"
                required
                minLength={8}
              />
              <p className="mt-1 text-sm text-gray-500">
                8文字以上で入力してください
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                新しいパスワード（確認）
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-navy-600 rounded-md shadow-sm focus:outline-none focus:ring-navy-600 focus:border-navy-600 sm:text-sm"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            {success && (
              <div className="text-green-600 text-sm text-center">{success}</div>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isLoading
                  ? 'bg-navy-600 cursor-not-allowed'
                  : 'bg-navy-700 hover:bg-navy-800'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-600`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'パスワードを変更'
              )}
            </motion.button>
          </form>
        </div>
      </main>
    </div>
  );
}
