"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "./admin-sidebar.module.css"

const menuItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/vacancies", label: "Vacancies" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/settings", label: "Settings" },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${pathname.startsWith(item.href) ? styles.active : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}