import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { generateVerificationCode, sendVerificationCode } from '@/app/lib/twilio';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    // 電話番号の形式チェック（日本の携帯電話番号）
    if (!phoneNumber.match(/^0[789]0\d{8}$/)) {
      return NextResponse.json(
        { error: '無効な電話番号形式です' },
        { status: 400 }
      );
    }

    // 既存のユーザーチェック
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    // パスワードリセットの場合は既存ユーザーが必要、新規登録の場合は既存ユーザーがいてはいけない
    const isPasswordReset = request.headers.get('x-request-type') === 'password-reset';
    
    if (existingUser && !isPasswordReset) {
      return NextResponse.json(
        { error: 'この電話番号は既に登録されています' },
        { status: 400 }
      );
    }
    
    if (!existingUser && isPasswordReset) {
      return NextResponse.json(
        { error: 'この電話番号は登録されていません' },
        { status: 400 }
      );
    }

    // 認証コードの生成と保存
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分後

    try {
      console.log('認証コード生成: ', { phoneNumber, codeLength: code?.length });
      
      try {
        // VerificationTokenの完全な削除
        await prisma.$executeRaw`TRUNCATE TABLE "VerificationToken"`;
        
        console.log('テーブルクリア完了');
        
        // 新しいコードを追加
        const newToken = await prisma.$executeRaw`
          INSERT INTO "VerificationToken" (id, identifier, token, expires)
          VALUES (${crypto.randomUUID()}, ${phoneNumber}, ${code}, ${expiresAt})
        `;
        
        console.log('SQL挿入完了:', newToken);
      } catch (sqlError) {
        console.error('SQLエラー:', sqlError);
        return NextResponse.json(
          { error: 'データベース操作に失敗しました' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('認証コード保存エラーの詳細:', error);
      
      if (error instanceof Error) {
        console.error('エラー種類:', error.name);
        console.error('エラーメッセージ:', error.message);
        console.error('エラースタック:', error.stack);
      }
      
      return NextResponse.json(
        { error: '認証コードの保存に失敗しました' },
        { status: 500 }
      );
    }

    // SMSで認証コードを送信（Twilioの場合は国際形式に変換）
    const twilioPhoneNumber = `+81${phoneNumber.slice(1)}`;
    console.log('SMS送信前の電話番号変換:', { 
      original: phoneNumber, 
      formatted: twilioPhoneNumber 
    });
    
    try {
      const sent = await sendVerificationCode(twilioPhoneNumber, code);
      console.log('SMS送信結果:', { sent });
      
      if (!sent) {
        return NextResponse.json(
          { error: '認証コードの送信に失敗しました' },
          { status: 500 }
        );
      }
    } catch (smsError) {
      console.error('SMS送信中の例外:', smsError);
      return NextResponse.json(
        { error: 'SMS送信処理中にエラーが発生しました' },
        { status: 500 }
      );
    }

    // 開発環境ではデバッグ情報を返す
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ 
        success: true,
        debugCode: code
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('認証エラー:', error);
    return NextResponse.json(
      { error: '認証処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
