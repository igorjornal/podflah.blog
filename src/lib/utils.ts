import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function calcReadTime(content: string): string {
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} MIN`;
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatDateShort(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, "d MMM yyyy", { locale: ptBR }).toUpperCase();
}

export function formatDateMonthYear(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, "MMM yyyy", { locale: ptBR }).toUpperCase();
}
