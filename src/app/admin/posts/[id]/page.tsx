import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db, posts, categories, authors, postRevisions } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import PostEditor from './PostEditor';

type Props = { params: { id: string } };

export default async function EditPostPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const id = parseInt(params.id);
  const [post] = await db.select().from(posts).where(eq(posts.id, id));
  if (!post) notFound();

  const [cats, auths, revisions] = await Promise.all([
    db.select().from(categories),
    db.select().from(authors),
    db.select().from(postRevisions).where(eq(postRevisions.postId, id)).orderBy(desc(postRevisions.createdAt)).limit(10),
  ]);

  return <PostEditor post={post} categories={cats} authors={auths} revisions={revisions} />;
}
