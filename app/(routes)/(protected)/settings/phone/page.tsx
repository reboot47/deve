'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PhoneSettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!phoneNumber || !phoneNumber.match(/^\d{10,11}$/)) {
      setError('有効な電話番号を入力してください');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/profile/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '認証コードの送信に失敗しました');
      }

      setMessage(data.message);
      // 開発環境の場合、認証コードを自動入力
      if (data.verificationCode) {
        setVerificationCode(data.verificationCode);
      }
      setStep(2);
    } catch (error) {
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!verificationCode) {
      setError('認証コードを入力してください');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/profile/phone', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '電話番号の更新に失敗しました');
      }

      // セッションを更新
      await update();
      
      setMessage('電話番号を更新しました');
      setTimeout(() => {
        router.push('/settings');
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
            <h1 className="text-2xl font-bold text-gray-800">電話番号変更</h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600">
              {error}
            </div>
          )}
          
          {message && (
            <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded text-green-600">
              {message}
            </div>
          )}

          {step === 1 ? (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleRequestCode}
            >
              <div className="mb-6">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  新しい電話番号
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-navy-600 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-600"
                  placeholder="例: 08012345678"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  現在の電話番号: {session?.user?.phoneNumber}
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-navy-700 text-white py-2 px-4 rounded-md hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? '送信中...' : '認証コードを送信'}
              </button>
            </motion.form>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleVerifyCode}
            >
              <div className="mb-6">
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                  認証コード
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-2 border border-navy-600 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-600"
                  placeholder="4桁の認証コード"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  SMSで送信された4桁のコードを入力してください
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  戻る
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-navy-700 text-white py-2 px-4 rounded-md hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isLoading ? '確認中...' : '電話番号を変更'}
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
}
