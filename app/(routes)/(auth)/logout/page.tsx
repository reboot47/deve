'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      await signOut({ redirect: false });
      router.push('/login');
    };
    
    logout();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ログアウト中...
          </h1>
          <p className="text-gray-600">
            ログイン画面にリダイレクトします
          </p>
        </div>
      </div>
    </div>
  );
}
