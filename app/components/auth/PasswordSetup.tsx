'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [passwordStrength, setPasswordStrength] = useState(0);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // マウント時に自動フォーカス
  useEffect(() => {
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, []);

  // パスワード強度の評価
  const evaluatePasswordStrength = (pass: string) => {
    let score = 0;
    
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    setPasswordStrength(Math.min(score, 5));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    evaluatePasswordStrength(newPassword);
  };

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

      // BASE_URLを取得（開発環境とプロダクション環境で異なる場合がある）
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      console.log('API URL設定:', { baseUrl, fullUrl: `${baseUrl}/api/auth/reset-password` });
      
      const response = await fetch(`/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          code: verificationCode,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('パスワードリセットエラー:', { status: response.status, data });
        throw new Error(data.error || 'パスワードの設定に失敗しました');
      }

      const data = await response.json();
      console.log('パスワードリセット成功:', data);
      
      router.push('/login?registered=true');
    } catch (error) {
      console.error('例外発生:', error);
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordStrengthIndicator = () => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    const descriptions = ['非常に弱い', '弱い', '普通', '強い', '非常に強い'];
    
    return (
      <div className="mt-2">
        <div className="flex space-x-1 h-1 mb-1">
          {[0, 1, 2, 3, 4].map((index) => (
            <div 
              key={index}
              className={`flex-1 rounded-full ${passwordStrength > index ? colors[Math.min(passwordStrength-1, 4)] : 'bg-gray-200'}`}
            />
          ))}
        </div>
        {password && (
          <p className={`text-xs ${passwordStrength <= 1 ? 'text-red-500' : passwordStrength <= 2 ? 'text-orange-500' : passwordStrength <= 3 ? 'text-blue-500' : 'text-green-500'}`}>
            パスワード強度: {descriptions[Math.min(passwordStrength-1, 4)]}
          </p>
        )}
      </div>
    );
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
          <div className="relative">
            <input
              ref={passwordInputRef}
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            8文字以上で入力してください
          </p>
          {renderPasswordStrengthIndicator()}
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
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent ${
              confirmPassword && password !== confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            required
            minLength={8}
            autoComplete="new-password"
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-500 mt-1">パスワードが一致しません</p>
          )}
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
            disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
            className={`flex-1 py-2 px-4 bg-navy-700 text-white rounded-lg font-medium
              ${isLoading || !password || !confirmPassword || password !== confirmPassword ? 'opacity-50 cursor-not-allowed' : 'hover:bg-navy-800'}`}
          >
            {isLoading ? '設定中...' : '設定'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
