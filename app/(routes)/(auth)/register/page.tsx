'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import PhoneVerification from '@/app/components/auth/PhoneVerification';
import CodeVerification from '@/app/components/auth/CodeVerification';
import PasswordSetup from '@/app/components/auth/PasswordSetup';

export default function RegisterPage() {
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

  const handleRegistrationComplete = () => {
    router.push('/profile');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <PhoneVerification
            key="phone"
            onVerificationComplete={handlePhoneVerification}
          />
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
            onComplete={handleRegistrationComplete}
            onBack={() => setStep(2)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
