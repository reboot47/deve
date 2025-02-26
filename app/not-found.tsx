'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          ページが見つかりません
        </h2>
        <p className="text-gray-600 mb-6">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block bg-navy-700 text-white px-6 py-2 rounded-md hover:bg-navy-800 transition-colors"
        >
          トップページに戻る
        </Link>
      </motion.div>
    </div>
  );
}
