'use client';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { useCallback, useEffect } from 'react';
import styles from './TiptapEditor.module.css';

type Props = {
  content: string;
  onChange: (html: string) => void;
};

export default function TiptapEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Link.configure({ openOnClick: false }),
      Image,
      CharacterCount,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Escreva sua crônica aqui...' }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: styles.prose },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content]);

  if (!editor) return null;

  return (
    <div className={styles.wrap}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className={styles.editorContent} />
      <div className={styles.footer}>
        <span>{editor.storage.characterCount?.words() ?? 0} palavras</span>
        <span>{editor.storage.characterCount?.characters() ?? 0} caracteres</span>
      </div>
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = useCallback(() => {
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('URL do link', prev ?? 'https://');
    if (url === null) return;
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('URL da imagem');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  return (
    <div className={styles.toolbar}>
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? styles.on : ''} title="Negrito">B</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? styles.on : ''} title="Itálico" style={{ fontStyle: 'italic' }}>I</button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? styles.on : ''} title="Sublinhado" style={{ textDecoration: 'underline' }}>U</button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? styles.on : ''} title="Tachado" style={{ textDecoration: 'line-through' }}>S</button>
      <span className={styles.sep} />
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? styles.on : ''} title="Título H2">H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? styles.on : ''} title="Título H3">H3</button>
      <span className={styles.sep} />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? styles.on : ''} title="Lista">≡</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? styles.on : ''} title="Lista numerada">1.</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? styles.on : ''} title="Citação">"</button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? styles.on : ''} title="Código">&lt;/&gt;</button>
      <span className={styles.sep} />
      <button type="button" onClick={setLink} className={editor.isActive('link') ? styles.on : ''} title="Link">🔗</button>
      <button type="button" onClick={addImage} title="Imagem">🖼</button>
      <span className={styles.sep} />
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? styles.on : ''} title="Alinhar esquerda">⬅</button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? styles.on : ''} title="Centralizar">↔</button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? styles.on : ''} title="Alinhar direita">➡</button>
      <span className={styles.sep} />
      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Desfazer">↩</button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Refazer">↪</button>
      <span className={styles.sep} />
      <button
        type="button"
        onClick={() => editor.chain().focus().setColor('#c8102e').run()}
        className={editor.isActive('textStyle', { color: '#c8102e' }) ? styles.on : ''}
        title="Texto vermelho"
        style={{ color: '#c8102e', fontWeight: 700 }}
      >A</button>
    </div>
  );
}
