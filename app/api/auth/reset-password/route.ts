import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, code, password } = body;

    // パラメータのバリデーション
    if (!phoneNumber || !code || !password) {
      return NextResponse.json(
        { error: '電話番号、認証コード、パスワードは必須です' },
        { status: 400 }
      );
    }

    // 認証コードの検証
    const verificationRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: phoneNumber,
        token: code,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!verificationRecord) {
      return NextResponse.json(
        { error: '無効な認証コードまたは期限切れです' },
        { status: 400 }
      );
    }

    // ユーザーの存在確認
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // パスワードの更新
    await prisma.user.update({
      where: { phoneNumber },
      data: { password: hashedPassword },
    });

    // 使用済みの認証コードを削除
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: phoneNumber,
          token: code,
        },
      },
    });

    return NextResponse.json({ success: true, message: 'パスワードがリセットされました' });
  } catch (error) {
    console.error('パスワードリセットエラー:', error);
    return NextResponse.json(
      { error: 'パスワードのリセット中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
