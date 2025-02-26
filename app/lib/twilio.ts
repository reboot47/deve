import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendVerificationCode = async (phoneNumber: string, code: string) => {
  try {
    // 開発環境またはTwilioの設定がない場合はコンソールに表示
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || process.env.NODE_ENV === 'development') {
      console.log('\n==================================');
      console.log(`【開発モード】電話番号: ${phoneNumber}`);
      console.log(`【認証コード】: ${code}`);
      console.log('==================================\n');
      return true;
    }
    
    // 本番環境ではTwilioでSMS送信
    await client.messages.create({
      body: `【LINEBUZZ】認証コード: ${code}\n※このコードは10分間有効です。`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    return true;
  } catch (error) {
    console.error('SMS送信エラー:', error);
    return false;
  }
};

export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
