import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.phoneNumber) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { phoneNumber: session.user.phoneNumber },
      select: {
        name: true,
        phoneNumber: true,
        email: true,
        image: true,
        bio: true,
        location: true,
        website: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    return NextResponse.json(
      { error: 'プロフィールの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.phoneNumber) {
      return new Response(JSON.stringify({ error: '認証が必要です' }), {
        status: 401,
      });
    }
    
    // リクエストボディを解析
    const body = await request.json();
    const { name, bio, location, website, image } = body;
    
    // ユーザー情報を更新
    const updatedUser = await prisma.user.update({
      where: { phoneNumber: session.user.phoneNumber },
      data: {
        name,
        bio,
        location,
        website,
        image,
      },
    });
    
    return new Response(
      JSON.stringify({
        message: 'プロフィールを更新しました',
        user: {
          name: updatedUser.name,
          bio: updatedUser.bio,
          location: updatedUser.location,
          website: updatedUser.website,
          image: updatedUser.image,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    return new Response(
      JSON.stringify({ error: 'プロフィールの更新に失敗しました' }),
      { status: 500 }
    );
  }
}
