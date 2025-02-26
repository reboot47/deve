import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { phoneNumber, code, password } = await request.json();

    // デバッグログ
    console.log('登録リクエスト:', {
      phoneNumber,
      code,
      passwordLength: password?.length,
    });

    // 認証コードの検証
    const verificationCode = await prisma.verificationCode.findUnique({
      where: { phoneNumber },
    });

    // デバッグログ
    console.log('検証コード情報:', {
      stored: verificationCode?.code,
      received: code,
      expiresAt: verificationCode?.expiresAt,
    });

    if (!verificationCode) {
      return NextResponse.json(
        { error: '認証コードが見つかりません' },
        { status: 400 }
      );
    }

    if (verificationCode.code !== code) {
      return NextResponse.json(
        { error: '認証コードが一致しません' },
        { status: 400 }
      );
    }

    if (new Date() > verificationCode.expiresAt) {
      return NextResponse.json(
        { error: '認証コードの有効期限が切れています' },
        { status: 400 }
      );
    }

    // パスワードのバリデーション
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'パスワードは8文字以上で入力してください' },
        { status: 400 }
      );
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);

    // ユーザーの作成
    const user = await prisma.user.create({
      data: {
        phoneNumber,
        password: hashedPassword,
      },
    });

    // 認証コードの削除
    await prisma.verificationCode.delete({
      where: { phoneNumber },
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
    });
  } catch (error) {
    console.error('登録エラー:', error);
    return NextResponse.json(
      { error: 'ユーザー登録中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
