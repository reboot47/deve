import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.phoneNumber) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック（5MB）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ファイルサイズは5MB以下にしてください' },
        { status: 400 }
      );
    }

    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '画像ファイルのみアップロード可能です' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 保存するファイル名を生成（ユニークな名前にする）
    const fileName = `${session.user.phoneNumber}-${Date.now()}-${file.name}`;
    const path = join(process.cwd(), 'public/uploads', fileName);

    // ファイルを保存
    await writeFile(path, buffer);

    // 画像のURLを返す
    const imageUrl = `/uploads/${fileName}`;

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    return NextResponse.json(
      { error: '画像のアップロードに失敗しました' },
      { status: 500 }
    );
  }
}
