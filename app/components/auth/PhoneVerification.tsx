'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhoneVerificationProps {
  onVerificationComplete: (phoneNumber: string) => void;
}

export default function PhoneVerification({ onVerificationComplete }: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [devMessage, setDevMessage] = useState('');
  const [formattedNumber, setFormattedNumber] = useState('');
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // マウント時に自動フォーカス
  useEffect(() => {
    if (phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
  }, []);

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

  // 電話番号のフォーマット処理
  const formatPhoneNumber = (input: string) => {
    // 数字以外を削除
    const cleaned = input.replace(/\D/g, '');
    
    // フォーマットを適用
    let formatted = cleaned;
    if (cleaned.length > 3) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }
    if (cleaned.length > 7) {
      formatted = `${formatted.slice(0, 8)}-${formatted.slice(8)}`;
    }
    
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // 入力値から余分な文字を削除して数字だけにする
    const numericInput = input.replace(/\D/g, '');
    
    // 11桁以内に制限
    if (numericInput.length <= 11) {
      // フォーマット済みの電話番号をステートに設定
      const formatted = formatPhoneNumber(numericInput);
      setFormattedNumber(formatted);
      setPhoneNumber(numericInput);
      setError('');
    }
  };

  // 電話番号の検証
  const isPhoneValid = phoneNumber.length === 11;

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
          <div className="relative">
            <input
              ref={phoneInputRef}
              type="tel"
              id="phone"
              value={formattedNumber}
              onChange={handlePhoneChange}
              placeholder="090-XXXX-XXXX"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent ${
                phoneNumber.length > 0 && !isPhoneValid ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              inputMode="numeric"
              required
            />
            {isPhoneValid && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                </svg>
              </motion.div>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            11桁の携帯電話番号を入力してください
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-500 text-sm bg-red-50 p-2 rounded text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {devMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md"
            >
              <p className="text-yellow-800 text-sm font-medium">開発モード通知</p>
              <p className="text-yellow-700 text-sm whitespace-pre-line">{devMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isLoading || !isPhoneValid}
          className={`w-full py-2 px-4 bg-navy-700 text-white rounded-lg font-medium transition-all duration-200
            ${isLoading || !isPhoneValid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-navy-800'}`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              送信中...
            </span>
          ) : '認証コードを送信'}
        </motion.button>
      </form>
    </motion.div>
  );
}
