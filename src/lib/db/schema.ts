import {
  pgTable, serial, varchar, text, integer, boolean, timestamp
} from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  description: text('description'),
  color: varchar('color', { length: 20 }).default('yellow'),
  postCount: integer('post_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const authors = pgTable('authors', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 220 }).notNull().unique(),
  role: varchar('role', { length: 100 }),
  bio: text('bio'),
  extendedBio: text('extended_bio'),
  initials: varchar('initials', { length: 4 }),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  email: varchar('email', { length: 200 }),
  instagram: varchar('instagram', { length: 200 }),
  youtube: varchar('youtube', { length: 200 }),
  twitter: varchar('twitter', { length: 200 }),
  topics: text('topics'),
  postCount: integer('post_count').default(0),
  podcastEpisodes: integer('podcast_episodes').default(0),
  followers: integer('followers').default(0),
  yearStarted: integer('year_started'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 300 }).notNull(),
  slug: varchar('slug', { length: 320 }).notNull().unique(),
  kicker: varchar('kicker', { length: 200 }),
  dek: text('dek'),
  content: text('content').notNull().default(''),
  coverUrl: varchar('cover_url', { length: 500 }),
  imgLabel: varchar('img_label', { length: 60 }),
  imgColor: varchar('img_color', { length: 10 }).default('red'),
  categoryId: integer('category_id').references(() => categories.id),
  authorId: integer('author_id').references(() => authors.id),
  status: varchar('status', { length: 20 }).default('draft'),
  visibility: varchar('visibility', { length: 20 }).default('public'),
  pinned: boolean('pinned').default(false),
  featured: boolean('featured').default(false),
  allowComments: boolean('allow_comments').default(true),
  sendNewsletter: boolean('send_newsletter').default(false),
  readTime: varchar('read_time', { length: 20 }),
  wordCount: integer('word_count').default(0),
  tags: text('tags'),
  metaTitle: varchar('meta_title', { length: 200 }),
  metaDescription: text('meta_description'),
  scheduledAt: timestamp('scheduled_at'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  viewCount: integer('view_count').default(0),
});

export const postRevisions = pgTable('post_revisions', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  title: varchar('title', { length: 300 }),
  version: integer('version').notNull(),
  label: varchar('label', { length: 50 }).default('auto'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const subscribers = pgTable('subscribers', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 300 }).notNull().unique(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Author = typeof authors.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
