import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Usuário', type: 'text' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const username = credentials?.username as string;
        const password = credentials?.password as string;

        if (!username || !password) return null;

        const adminUser = process.env.ADMIN_USERNAME;
        const adminHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminUser || !adminHash) return null;
        if (username !== adminUser) return null;

        const valid = await bcrypt.compare(password, adminHash);
        if (!valid) return null;

        return { id: '1', name: adminUser, email: `${adminUser}@podflah.blog` };
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
});
