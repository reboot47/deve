import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/app/lib/prisma';

// 電話番号確認用コード送信API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new Response(JSON.stringify({ error: '認証が必要です' }), {
        status: 401,
      });
    }
    
    const body = await request.json();
    const { phoneNumber } = body;
    
    // 電話番号の形式バリデーション
    if (!phoneNumber || !phoneNumber.match(/^\d{10,11}$/)) {
      return new Response(JSON.stringify({ error: '有効な電話番号を入力してください' }), {
        status: 400,
      });
    }
    
    // 既に使用されている電話番号かチェック
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });
    
    if (existingUser && existingUser.id !== session.user.id) {
      return new Response(JSON.stringify({ error: 'この電話番号は既に使用されています' }), {
        status: 400,
      });
    }
    
    // 認証コード生成（4桁のランダムな数字）
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    // 認証コードをデータベースに保存
    await prisma.verificationToken.create({
      data: {
        identifier: phoneNumber,
        token: verificationCode,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10分後に期限切れ
      },
    });
    
    // 実際のSMS送信は外部サービスとの連携が必要
    // ここではSMS送信をシミュレート
    console.log(`SMS送信: 電話番号 ${phoneNumber} に認証コード ${verificationCode} を送信しました`);
    
    return new Response(
      JSON.stringify({ 
        message: '認証コードを送信しました。SMSをご確認ください。',
        // 開発中は認証コードを返す（本番環境では削除）
        verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('電話番号認証エラー:', error);
    return new Response(
      JSON.stringify({ error: '認証コードの送信に失敗しました' }),
      { status: 500 }
    );
  }
}

// 電話番号変更API
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new Response(JSON.stringify({ error: '認証が必要です' }), {
        status: 401,
      });
    }
    
    const body = await request.json();
    const { phoneNumber, verificationCode } = body;
    
    if (!phoneNumber || !verificationCode) {
      return new Response(JSON.stringify({ error: '電話番号と認証コードが必要です' }), {
        status: 400,
      });
    }
    
    // 認証コードの検証
    const token = await prisma.verificationToken.findFirst({
      where: {
        identifier: phoneNumber,
        token: verificationCode,
        expires: {
          gt: new Date(),
        },
      },
    });
    
    if (!token) {
      return new Response(JSON.stringify({ error: '無効な認証コードまたは期限切れです' }), {
        status: 400,
      });
    }
    
    // 電話番号を更新
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { phoneNumber },
    });
    
    // 使用済みトークンを削除
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: phoneNumber,
          token: verificationCode,
        },
      },
    });
    
    return new Response(
      JSON.stringify({ 
        message: '電話番号を更新しました', 
        phoneNumber: updatedUser.phoneNumber 
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('電話番号更新エラー:', error);
    return new Response(
      JSON.stringify({ error: '電話番号の更新に失敗しました' }),
      { status: 500 }
    );
  }
}
