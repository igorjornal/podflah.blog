'use client';

import { signOut } from 'next-auth/react';
import styles from './Admin.module.css';

export default function AdminLogoutButton() {
  return (
    <button
      className={styles.logoutBtn}
      onClick={() => signOut({ callbackUrl: '/admin/login' })}
      title="Sair"
    >
      Sair
    </button>
  );
}
