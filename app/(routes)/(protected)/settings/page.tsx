'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserIcon, PhoneIcon, CogIcon, BellIcon, ShieldCheckIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import React from 'react';

export default function SettingsPage() {
  const router = useRouter();

  const settingsItems = [
    {
      title: 'プロフィール設定',
      description: 'プロフィール情報の編集',
      href: '/settings/profile',
      icon: UserIcon,
    },
    {
      title: '電話番号変更',
      description: 'アカウントに関連付けられた電話番号を変更',
      href: '/settings/phone',
      icon: PhoneIcon,
    },
    {
      title: 'パスワード変更',
      description: 'パスワードの変更',
      href: '/settings/password',
      icon: CogIcon,
    },
    {
      title: '通知設定',
      description: '通知の設定',
      href: '/settings/notifications',
      icon: BellIcon,
      disabled: true,
    },
    {
      title: 'プライバシー設定',
      description: 'プライバシーの設定',
      href: '/settings/privacy',
      icon: ShieldCheckIcon,
      disabled: true,
    },
    {
      title: 'ログアウト',
      description: 'アカウントからログアウト',
      href: '/logout',
      icon: ArrowLeftOnRectangleIcon,
      className: 'text-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="mr-4 text-gray-600 hover:text-gray-800"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold text-gray-800">設定</h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {settingsItems.map((item) => (
              <motion.div
                key={item.title}
                whileHover={{ scale: item.disabled ? 1 : 1.02 }}
                whileTap={{ scale: item.disabled ? 1 : 0.98 }}
                className={`bg-white shadow rounded-lg overflow-hidden cursor-pointer ${
                  item.disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ${item.className || ''}`}
                onClick={() => !item.disabled && router.push(item.href)}
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="mr-4 text-gray-600">
                      {React.createElement(item.icon, { className: 'h-6 w-6' })}
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {item.title}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.description}
                      </p>
                    </div>
                    {!item.disabled && (
                      <span className="ml-auto text-gray-400">→</span>
                    )}
                    {item.disabled && (
                      <span className="ml-auto text-sm text-gray-400">
                        準備中
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
