"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import styles from "./search-bar.module.css"

interface SearchBarProps {
    onSearch: (query: string) => void
    defaultValue?: string
}

export function SearchBar({ onSearch, defaultValue = "" }: SearchBarProps) {
    const [query, setQuery] = useState(defaultValue)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSearch(query)
    }

    return (
        <form onSubmit={handleSubmit} className={styles.searchBar}>
            <Input
                type="text"
                placeholder="Search by job title, skills, or company..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={styles.input}
            />
            <Button type="submit" className={styles.button}>
                Search
            </Button>
        </form>
    )
}
