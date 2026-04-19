import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db, posts, authors } from '@/lib/db';
import { desc } from 'drizzle-orm';

export default async function NovoPostPage() {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const mainAuthor = await db.select().from(authors).limit(1);
  const authorId = mainAuthor[0]?.id ?? null;

  const [newPost] = await db.insert(posts).values({
    title: 'Sem título',
    slug: `rascunho-${Date.now()}`,
    content: '',
    status: 'draft',
    authorId,
  }).returning();

  redirect(`/admin/posts/${newPost.id}`);
}
