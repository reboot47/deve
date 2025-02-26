'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          エラーが発生しました
        </h2>
        <p className="text-gray-600 mb-6">
          申し訳ありませんが、予期せぬエラーが発生しました。
        </p>
        <button
          onClick={() => reset()}
          className="bg-navy-700 text-white px-6 py-2 rounded-md hover:bg-navy-800 transition-colors"
        >
          再試行
        </button>
      </motion.div>
    </div>
  );
}
