"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "./employer-sidebar.module.css"

const menuItems = [
  { href: "/company/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/company/vacancies", label: "My Vacancies", icon: "work" },
  { href: "/company/applications", label: "Applications", icon: "mail" },
  { href: "/company/ai-generator", label: "AI Generator", icon: "auto_awesome" },
  { href: "/company/profile", label: "Profile", icon: "business" },
  { href: "/company/settings", label: "Settings", icon: "settings" },
]

export function EmployerSidebar() {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logoPlaceholder}></div>
        <h2 className={styles.companyName}>UJobPortal</h2>
      </div>
      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${pathname.startsWith(item.href) ? styles.active : ""}`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}