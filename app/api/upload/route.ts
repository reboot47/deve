import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary設定
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    // Base64形式に変換
    const base64Data = buffer.toString('base64');
    const base64Prefix = `data:${file.type};base64,`;
    const fileBase64 = `${base64Prefix}${base64Data}`;

    try {
      // Cloudinaryにアップロード
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          fileBase64,
          {
            folder: 'linebuzz',
            public_id: `${session.user.phoneNumber}-${Date.now()}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });

      // 画像のURLを返す
      const imageUrl = (result as any).secure_url;
      console.log('Cloudinaryアップロード成功:', imageUrl);

      return NextResponse.json({ url: imageUrl });
    } catch (cloudinaryError) {
      console.error('Cloudinaryアップロードエラー:', cloudinaryError);
      return NextResponse.json(
        { error: '画像のアップロードに失敗しました (Cloudinary)' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    return NextResponse.json(
      { error: '画像のアップロードに失敗しました' },
      { status: 500 }
    );
  }
}
