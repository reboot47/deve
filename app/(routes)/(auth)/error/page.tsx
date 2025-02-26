'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: { [key: string]: string } = {
    default: '認証エラーが発生しました',
    configuration: '認証の設定に問題があります',
    accessdenied: 'アクセスが拒否されました',
    verification: '認証コードの検証に失敗しました',
  };

  const message = errorMessages[error || 'default'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          認証エラー
        </h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="inline-block bg-navy-700 text-white px-6 py-2 rounded-md hover:bg-navy-800 transition-colors"
          >
            ログインに戻る
          </Link>
          <Link
            href="/register"
            className="inline-block bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            新規登録
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
