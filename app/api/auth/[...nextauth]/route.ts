import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        phone: { label: "電話番号", type: "text" },
        password: { label: "パスワード", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          console.log('認証エラー: 認証情報が不足しています');
          return null;
        }

        // デバッグログ
        console.log('認証試行:', {
          phone: credentials.phone,
        });

        const user = await prisma.user.findUnique({
          where: {
            phoneNumber: credentials.phone,
          },
        });

        // デバッグログ
        console.log('ユーザー検索結果:', {
          found: !!user,
          hasPassword: !!user?.password,
        });

        if (!user || !user.password) {
          console.log('認証エラー: ユーザーが見つからないか、パスワードが設定されていません');
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        // デバッグログ
        console.log('パスワード検証:', {
          isValid: isPasswordValid,
        });

        if (!isPasswordValid) {
          console.log('認証エラー: パスワードが一致しません');
          return null;
        }

        return {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.phoneNumber = user.phoneNumber;
        token.image = user.image;
      }

      // セッション更新ハンドリング
      if (trigger === "update" && session) {
        // user情報を取得
        if (token.id) {
          const updatedUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              phoneNumber: true,
              name: true,
              image: true,
            },
          });

          if (updatedUser) {
            token.phoneNumber = updatedUser.phoneNumber;
            token.name = updatedUser.name;
            token.image = updatedUser.image;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.phoneNumber = token.phoneNumber as string;
        session.user.image = token.image as string || null;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
