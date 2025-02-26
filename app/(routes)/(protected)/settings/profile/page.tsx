'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

interface Profile {
  name: string | null;
  email: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  image: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<Profile>({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    image: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedFile]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) {
        throw new Error('プロフィールの取得に失敗しました');
      }
      const data = await response.json();
      setProfile(data);
      if (data.image) {
        setPreviewUrl(data.image);
      }
    } catch (error) {
      setError('プロフィールの読み込み中にエラーが発生しました');
      console.error('Profile fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB制限
        setError('画像サイズは5MB以下にしてください');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      // 画像のアップロード処理
      let uploadedImageUrl = profile.image;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || '画像のアップロードに失敗しました');
        }
        
        const uploadData = await uploadResponse.json();
        uploadedImageUrl = uploadData.url;
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          image: uploadedImageUrl
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'プロフィールの更新に失敗しました');
      }

      setSuccess('プロフィールを更新しました');
      setTimeout(() => setSuccess(''), 3000);
      
      // セッションのユーザー情報を更新
      if (session?.user) {
        await update({
          ...session,
          user: {
            ...session.user,
            name: profile.name,
            image: uploadedImageUrl,
          },
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-navy-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 text-gray-600 hover:text-gray-800"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              プロフィール設定
            </h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* プロフィール画像セクション */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-6">
                <div className="relative w-24 h-24">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="プロフィール画像"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-3xl text-gray-400">👤</span>
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <motion.label
                    whileTap={{ scale: 0.95 }}
                    htmlFor="image"
                    className="inline-block px-4 py-2 border border-navy-700 rounded-md shadow-sm text-sm font-medium text-navy-700 bg-navy-100 hover:bg-navy-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-600 cursor-pointer"
                  >
                    画像を変更
                  </motion.label>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* 電話番号（読み取り専用） */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  電話番号
                </label>
                <input
                  type="text"
                  value={session?.user?.phoneNumber || ''}
                  className="mt-1 block w-full px-3 py-2 border border-navy-700 rounded-md shadow-sm text-navy-700"
                  disabled
                />
              </div>

              {/* 名前 */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  名前
                </label>
                <input
                  type="text"
                  id="name"
                  value={profile.name || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-navy-700 rounded-md shadow-sm focus:outline-none focus:ring-navy-600 focus:border-navy-600 sm:text-sm"
                />
              </div>

              {/* メールアドレス */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  メールアドレス
                </label>
                <input
                  type="email"
                  id="email"
                  value={profile.email || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-navy-700 rounded-md shadow-sm focus:outline-none focus:ring-navy-600 focus:border-navy-600 sm:text-sm"
                />
              </div>

              {/* 自己紹介 */}
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700"
                >
                  自己紹介
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={profile.bio || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-navy-700 rounded-md shadow-sm focus:outline-none focus:ring-navy-600 focus:border-navy-600 sm:text-sm"
                />
              </div>

              {/* 場所 */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700"
                >
                  場所
                </label>
                <input
                  type="text"
                  id="location"
                  value={profile.location || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-navy-700 rounded-md shadow-sm focus:outline-none focus:ring-navy-600 focus:border-navy-600 sm:text-sm"
                />
              </div>

              {/* ウェブサイト */}
              <div>
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-gray-700"
                >
                  ウェブサイト
                </label>
                <input
                  type="url"
                  id="website"
                  value={profile.website || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, website: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-navy-700 rounded-md shadow-sm focus:outline-none focus:ring-navy-600 focus:border-navy-600 sm:text-sm"
                  placeholder="https://"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              {success && (
                <div className="text-green-600 text-sm text-center">
                  {success}
                </div>
              )}

              <div className="flex justify-end">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSaving}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    isSaving
                      ? 'bg-navy-600 cursor-not-allowed'
                      : 'bg-navy-700 hover:bg-navy-800'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-600`}
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    '保存'
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
