'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">LINEBUZZ</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {session?.user?.phoneNumber}
              </span>
              <div className="relative">
                <motion.img
                  src={`${session?.user?.image || '/images/default-avatar.png'}?t=${Date.now()}`}
                  alt="プロフィール"
                  className="h-10 w-10 rounded-full cursor-pointer border-2 border-transparent hover:border-navy-500 transition-all duration-200 object-cover"
                  onClick={() => router.push('/settings')}
                  onError={(e) => {
                    // 画像読み込みエラー時にデフォルト画像を表示
                    e.currentTarget.src = '/images/default-avatar.png';
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            ようこそ、LINEBUZZへ
          </h2>
          <p className="text-gray-600 mb-6">
            まもなく、新しいコミュニケーション体験が始まります。
          </p>

          {/* アクションカード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-navy-600 to-navy-700 rounded-lg p-6 text-white cursor-pointer"
            >
              <h3 className="text-lg font-semibold mb-2">プロフィール設定</h3>
              <p className="text-sm opacity-90">
                あなたのプロフィールを設定して、他のユーザーに自己紹介しましょう。
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-navy-600 to-navy-700 rounded-lg p-6 text-white cursor-pointer"
            >
              <h3 className="text-lg font-semibold mb-2">友達を探す</h3>
              <p className="text-sm opacity-90">
                興味のある話題や地域から新しい友達を見つけましょう。
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-navy-600 to-navy-700 rounded-lg p-6 text-white cursor-pointer"
            >
              <h3 className="text-lg font-semibold mb-2">グループに参加</h3>
              <p className="text-sm opacity-90">
                共通の興味を持つ人々とコミュニティを作りましょう。
              </p>
            </motion.div>
          </div>
        </div>

        {/* お知らせセクション */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">お知らせ</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-navy-600 pl-4">
              <p className="text-sm text-gray-600">2025年2月26日</p>
              <p className="text-gray-800">LINEBUZZへようこそ！</p>
            </div>
            <div className="border-l-4 border-navy-600 pl-4">
              <p className="text-sm text-gray-600">2025年2月26日</p>
              <p className="text-gray-800">新機能は順次公開予定です。</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
