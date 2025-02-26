import twilio from 'twilio';

// Twilioクライアントを初期化
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendVerificationCode = async (phoneNumber: string, code: string) => {
  try {
    console.log('SMS送信開始:', { phoneNumber, smsCode: code });
    console.log('Twilio設定:', { 
      accountSid: process.env.TWILIO_ACCOUNT_SID?.substring(0, 5) + '...',
      authTokenSet: !!process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_PHONE_NUMBER,
      nodeEnv: process.env.NODE_ENV || '未設定'
    });

    // コンソールに常に表示（コード確認用）
    console.log('\n==================================');
    console.log(`【電話番号】: ${phoneNumber}`);
    console.log(`【認証コード】: ${code}`);
    console.log('==================================\n');

    // 開発環境またはTwilioの設定がない場合はSMS送信しない
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log('Twilio認証情報が設定されていないため、SMS送信をスキップします');
      return true;
    }
    
    // NODE_ENVがdevelopmentの場合もSMS送信をスキップ
    if (process.env.NODE_ENV === 'development') {
      console.log('開発環境のため、SMS送信をスキップします');
      return true;
    }
    
    // SMS送信
    console.log('Twilioを使用してSMSを送信します...');
    const message = await client.messages.create({
      body: `【LINEBUZZ】認証コード: ${code}\n※このコードは10分間有効です。`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    
    console.log('Twilio送信成功:', message.sid);
    return true;
  } catch (error) {
    console.error('SMS送信エラー:', error);
    if (error instanceof Error) {
      console.error('エラー詳細:', { 
        name: error.name, 
        message: error.message,
        stack: error.stack 
      });
    }
    return false;
  }
};

export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
