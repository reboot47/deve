'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
            type="text"
            value={code}
            onChange={handleCodeChange}
            placeholder="000000"
            maxLength={6}
            className="w-full px-4 py-2 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
            required
          />
        </div>

        <div className="text-center text-sm text-gray-600">
          残り時間: {formatTime(timeLeft)}
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
