'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function HamburgerMenu() {
  const { user, logout } = useAuth();
  const defaultProfileImage = '/default-profile.png';

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex rounded-full focus:outline-none focus:ring-2 focus:ring-navy-600">
        <Image
          src={user?.image || defaultProfileImage}
          alt="プロフィール画像"
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/profile"
                className={`${
                  active ? 'bg-gray-100' : ''
                } block px-4 py-2 text-sm text-gray-700`}
              >
                プロフィール編集
              </Link>
            )}
          </Menu.Item>
          
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/settings"
                className={`${
                  active ? 'bg-gray-100' : ''
                } block px-4 py-2 text-sm text-gray-700`}
              >
                アカウント設定
              </Link>
            )}
          </Menu.Item>

          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => logout()}
                className={`${
                  active ? 'bg-gray-100' : ''
                } block w-full text-left px-4 py-2 text-sm text-gray-700`}
              >
                ログアウト
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
