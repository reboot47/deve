'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        phone,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('電話番号またはパスワードが正しくありません');
      } else {
        router.push(callbackUrl);
      }
    } catch (error) {
      setError('ログイン中にエラーが発生しました');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            LINEBUZZ
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            アカウントをお持ちでない場合は{' '}
            <Link
              href="/register"
              className="font-medium text-navy-700 hover:text-navy-600"
            >
              新規登録
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="phone" className="sr-only">
                電話番号
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-navy-600 focus:border-navy-600 focus:z-10 sm:text-sm"
                placeholder="電話番号（090xxxxxxxx）"
                pattern="0[0-9]{9,10}"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-navy-600 focus:border-navy-600 focus:z-10 sm:text-sm"
                placeholder="パスワード"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading
                  ? 'bg-navy-600'
                  : 'bg-navy-700 hover:bg-navy-800'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'ログイン'
              )}
            </motion.button>
          </div>

          <div className="text-sm text-center">
            <Link
              href="/forgot-password"
              className="font-medium text-navy-700 hover:text-navy-600"
            >
              パスワードをお忘れの方
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
