import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authOptions } from '../[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // デバッグログ
    console.log('パスワード変更リクエスト開始');

    const session = await getServerSession(authOptions);
    
    // デバッグログ
    console.log('セッション状態:', {
      hasSession: !!session,
      user: session?.user,
    });

    if (!session?.user?.phoneNumber) {
      console.log('認証エラー: セッションまたはユーザー情報がありません');
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    // デバッグログ
    console.log('パスワード変更パラメータ:', {
      hasCurrentPassword: !!currentPassword,
      hasNewPassword: !!newPassword,
      phoneNumber: session.user.phoneNumber,
    });

    // バリデーション
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '現在のパスワードと新しいパスワードを入力してください' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: '新しいパスワードは8文字以上である必要があります' },
        { status: 400 }
      );
    }

    // ユーザーを取得
    const user = await prisma.user.findUnique({
      where: { phoneNumber: session.user.phoneNumber },
    });

    // デバッグログ
    console.log('ユーザー検索結果:', {
      found: !!user,
      hasPassword: !!user?.password,
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // 現在のパスワードを確認
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );

    // デバッグログ
    console.log('パスワード検証:', {
      isValid: isValidPassword,
    });

    if (!isValidPassword) {
      return NextResponse.json(
        { error: '現在のパスワードが正しくありません' },
        { status: 400 }
      );
    }

    // 新しいパスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // パスワードを更新
    await prisma.user.update({
      where: { phoneNumber: session.user.phoneNumber },
      data: { password: hashedPassword },
    });

    console.log('パスワード更新成功');

    return NextResponse.json(
      { message: 'パスワードが正常に更新されました' },
      { status: 200 }
    );
  } catch (error) {
    console.error('パスワード変更エラー:', error);
    return NextResponse.json(
      { error: 'パスワードの更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
