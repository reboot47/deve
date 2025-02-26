'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface PhoneVerificationProps {
  onVerificationComplete: (phoneNumber: string) => void;
}

export default function PhoneVerification({ onVerificationComplete }: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [devMessage, setDevMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 電話番号から余分な文字を削除
      const cleanPhoneNumber = phoneNumber.replace(/[-\s]/g, '');
      
      // パスワードリセットページからの呼び出しかどうかを判断
      const isPasswordReset = window.location.pathname.includes('forgot-password');
      
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-request-type': isPasswordReset ? 'password-reset' : 'registration'
        },
        body: JSON.stringify({ phoneNumber: cleanPhoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '認証コードの送信に失敗しました');
      }

      // 開発環境ではユーザーにメッセージを表示
      if (process.env.NODE_ENV !== 'production') {
        // サーバーからのレスポンスからコードを取得（あれば）
        const responseCode = data.debugCode || '';
        setDevMessage(`認証コードはサーバーコンソールに表示されています。\n開発環境ではSMSは送信されません。${responseCode ? `\n認証コード: ${responseCode}` : ''}`);
      }
      
      setVerificationCodeSent(true);
      onVerificationComplete(cleanPhoneNumber);
    } catch (error) {
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-6"
    >
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        電話番号認証
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            電話番号
          </label>
          <input
            type="tel"
            id="phone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="090xxxxxxxx"
            pattern="[0-9]{11}"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            ハイフンなしで11桁の番号を入力してください
          </p>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm mt-2"
          >
            {error}
          </motion.p>
        )}

        {devMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md"
          >
            <p className="text-yellow-800 text-sm font-medium">開発モード通知</p>
            <p className="text-yellow-700 text-sm whitespace-pre-line">{devMessage}</p>
          </motion.div>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isLoading || phoneNumber.replace(/[-\s]/g, '').length !== 11}
          className={`w-full py-2 px-4 bg-navy-700 text-white rounded-lg font-medium
            ${isLoading || phoneNumber.replace(/[-\s]/g, '').length !== 11 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-navy-800'}`}
        >
          {isLoading ? '送信中...' : '認証コードを送信'}
        </motion.button>
      </form>
    </motion.div>
  );
}
