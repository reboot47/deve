'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CodeVerificationProps {
  phoneNumber: string;
  onVerificationComplete: (code: string) => void;
  onBack: () => void;
}

export default function CodeVerification({
  phoneNumber,
  onVerificationComplete,
  onBack,
}: CodeVerificationProps) {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10分 = 600秒
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // マウント時に自動フォーカス
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/[-\s]/g, '');
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  };

  // デバッグ用：コンソールの認証コードを表示
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('認証コードを確認してください。サーバーコンソールに表示されています。');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timeLeft === 0) {
      setError('認証コードの有効期限が切れています');
      return;
    }
    
    if (code.length !== 6) {
      setError('認証コードは6桁の数字を入力してください');
      return;
    }
    
    onVerificationComplete(code);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 6) {
      setCode(value);
      setError('');
      
      // 6桁入力されたら自動的に送信
      if (value.length === 6) {
        setTimeout(() => {
          onVerificationComplete(value);
        }, 300);
      }
    }
  };

  // 認証コードを再送信する
  const handleResendCode = async () => {
    try {
      setIsResending(true);
      setError('');
      
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '認証コードの再送信に失敗しました');
      }
      
      // タイマーをリセット
      setTimeLeft(600);
      
      // 成功メッセージを表示（エラーステートを一時的に使用）
      setError('認証コードを再送信しました');
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    } finally {
      setIsResending(false);
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
        認証コードを入力
      </h2>
      <p className="text-center text-gray-600 mb-6">
        {formatPhoneNumber(phoneNumber)}に送信された6桁のコードを入力してください
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={handleCodeChange}
            placeholder="000000"
            maxLength={6}
            className="w-full px-4 py-2 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
            required
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>

        <div className="text-center text-sm text-gray-600 flex justify-between items-center">
          <span>残り時間: {formatTime(timeLeft)}</span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleResendCode}
            disabled={isResending || timeLeft > 540} // 9分以上残っている場合は無効化
            className={`text-navy-600 hover:text-navy-800 text-sm ${
              isResending || timeLeft > 540 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isResending ? '送信中...' : 'コードを再送信'}
          </motion.button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-sm text-center p-2 rounded ${
                error.includes('再送信しました') 
                  ? 'bg-green-50 text-green-600' 
                  : 'bg-red-50 text-red-500'
              }`}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

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
            disabled={code.length !== 6 || timeLeft === 0}
            className={`flex-1 py-2 px-4 bg-navy-700 text-white rounded-lg font-medium
              ${code.length !== 6 || timeLeft === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-navy-800'}`}
          >
            確認
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
