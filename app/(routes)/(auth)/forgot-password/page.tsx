'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PhoneVerification from '@/app/components/auth/PhoneVerification';
import CodeVerification from '@/app/components/auth/CodeVerification';
import PasswordSetup from '@/app/components/auth/PasswordSetup';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const router = useRouter();

  const handlePhoneVerification = (phone: string) => {
    setPhoneNumber(phone);
    setStep(2);
  };

  const handleCodeVerification = (code: string) => {
    setVerificationCode(code);
    setStep(3);
  };

  const handlePasswordReset = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/login')}
              className="mr-4 text-gray-600 hover:text-gray-800"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              パスワードリセット
            </h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="flex-grow flex items-center justify-center">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <div key="phone" className="w-full max-w-md">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center mb-8"
              >
                <p className="text-gray-600">
                  登録時の電話番号を入力してください
                </p>
              </motion.div>
              <PhoneVerification onVerificationComplete={handlePhoneVerification} />
            </div>
          )}

          {step === 2 && (
            <CodeVerification
              key="code"
              phoneNumber={phoneNumber}
              onVerificationComplete={handleCodeVerification}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <PasswordSetup
              key="password"
              phoneNumber={phoneNumber}
              verificationCode={verificationCode}
              onComplete={handlePasswordReset}
              onBack={() => setStep(2)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
