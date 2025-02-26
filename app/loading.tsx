'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 border-4 border-navy-700 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">読み込み中...</p>
      </motion.div>
    </div>
  );
}
