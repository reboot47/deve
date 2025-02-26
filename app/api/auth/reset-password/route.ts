import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, code, password } = body;

    console.log('パスワードリセット要求:', { 
      phoneNumber, 
      codeProvided: !!code,
      passwordProvided: !!password
    });

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

    console.log('認証コード検証結果:', { 
      found: !!verificationRecord,
      expires: verificationRecord?.expires 
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

    console.log('ユーザー検索結果:', { 
      phoneNumber, 
      userFound: !!user 
    });

    // パスワードリセットモードでの処理
    if (!user) {
      // ユーザーが存在しない場合は新規作成（新規登録として処理）
      console.log('ユーザーが存在しないため新規作成します');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await prisma.user.create({
        data: {
          phoneNumber,
          password: hashedPassword,
        },
      });
      
      // 使用済みの認証コードを削除
      await prisma.verificationToken.delete({
        where: { id: verificationRecord.id },
      });
      
      return NextResponse.json({ 
        success: true, 
        message: '新規ユーザーとして登録しました'
      });
    }

    // 既存ユーザーのパスワード更新
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { phoneNumber },
      data: { password: hashedPassword },
    });

    // 使用済みの認証コードを削除
    try {
      await prisma.verificationToken.delete({
        where: { id: verificationRecord.id },
      });
    } catch (deleteError) {
      console.error('認証コード削除エラー:', deleteError);
      // 削除エラーがあっても処理を続行
    }

    return NextResponse.json({ 
      success: true, 
      message: 'パスワードがリセットされました'
    });
  } catch (error) {
    console.error('パスワードリセットエラー:', error);
    return NextResponse.json(
      { error: 'パスワードのリセット中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
