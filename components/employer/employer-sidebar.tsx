"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "./employer-sidebar.module.css"

const menuItems = [
  { href: "/employer/dashboard", label: "Dashboard" },
  { href: "/employer/vacancies", label: "Vacancies" },
  { href: "/employer/applications", label: "Applications" },
  { href: "/employer/analytics", label: "Analytics" },
  { href: "/employer/settings", label: "Settings" },
]

export function EmployerSidebar() {
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