"use client"

import styles from "./sidebar.module.css"

export function Sidebar() {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.filters}>{/* Filters will be rendered in the main page */}</div>
        </aside>
    )
}
