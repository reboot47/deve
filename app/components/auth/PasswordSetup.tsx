'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface PasswordSetupProps {
  phoneNumber: string;
  verificationCode: string;
  onBack: () => void;
}

export default function PasswordSetup({
  phoneNumber,
  verificationCode,
  onBack,
}: PasswordSetupProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // パスワードのバリデーション
    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      setIsLoading(false);
      return;
    }

    try {
      // デバッグログ
      console.log('送信データ:', {
        phoneNumber,
        code: verificationCode,
        passwordLength: password.length,
      });

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          code: verificationCode,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'パスワードの設定に失敗しました');
      }

      router.push('/login?registered=true');
    } catch (error) {
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="w-full max-w-md mx-auto p-6"
    >
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        パスワードを設定
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
            required
            minLength={8}
          />
          <p className="text-sm text-gray-500 mt-1">
            8文字以上で入力してください
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード（確認）
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
            required
            minLength={8}
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm text-center"
          >
            {error}
          </motion.p>
        )}

        <div className="flex space-x-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onBack}
            className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
          >
            戻る
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className={`flex-1 py-2 px-4 bg-navy-700 text-white rounded-lg font-medium
              ${isLoading || !password || !confirmPassword ? 'opacity-50 cursor-not-allowed' : 'hover:bg-navy-800'}`}
          >
            {isLoading ? '設定中...' : '設定'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
