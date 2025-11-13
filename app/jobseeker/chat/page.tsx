"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { ApiClient } from "@/lib/api-client"
import type { ChatResponse } from "@/lib/types"
import Link from "next/link"
import styles from "./chat.module.css"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
  relatedVacancyIds?: number[]
}

export default function ChatbotPage() {
  const { user } = useAuth()
  const api = ApiClient.getInstance()

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `👋 Hi ${user?.fullName || "there"}! I'm your AI job search assistant. How can I help you today?`,
      timestamp: new Date(),
      suggestions: [
        "Find remote Java jobs",
        "Show my application status",
        "Jobs in Baku",
        "How to improve my CV?"
      ]
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim()
    if (!messageToSend) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    try {
      const response = await api.post<ChatResponse>("/ai/chat", {
        message: messageToSend,
        conversationId: conversationId || undefined
      })

      // Update conversation ID
      if (response.conversationId) {
        setConversationId(response.conversationId)
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        timestamp: new Date(response.timestamp),
        suggestions: response.suggestions,
        relatedVacancyIds: response.relatedVacancyIds
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/jobseeker/dashboard" className={styles.backLink}>← Back</Link>
          <div>
            <h1 className={styles.title}>💬 AI Job Assistant</h1>
            <p className={styles.subtitle}>24/7 help with your job search</p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className={styles.chatArea}>
        <div className={styles.messagesContainer}>
          {messages.map((message) => (
            <div key={message.id} className={styles.messageWrapper}>
              {message.role === "assistant" ? (
                <div className={styles.assistantMessage}>
                  <div className={styles.messageAvatar}>🤖</div>
                  <div className={styles.messageContent}>
                    <div className={styles.messageBubble}>
                      {message.content}
                    </div>
                    <div className={styles.messageTime}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Related Vacancies */}
                    {message.relatedVacancyIds && message.relatedVacancyIds.length > 0 && (
                      <div className={styles.relatedJobs}>
                        <p className={styles.relatedJobsTitle}>Related Jobs:</p>
                        {message.relatedVacancyIds.slice(0, 3).map((id) => (
                          <Link key={id} href={`/jobs/${id}`} className={styles.jobLink}>
                            View Job #{id}
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className={styles.suggestions}>
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={styles.suggestionChip}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.userMessage}>
                  <div className={styles.messageContent}>
                    <div className={styles.messageBubble}>
                      {message.content}
                    </div>
                    <div className={styles.messageTime}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className={styles.messageAvatar}>
                    {user?.fullName?.charAt(0) || "U"}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className={styles.messageWrapper}>
              <div className={styles.assistantMessage}>
                <div className={styles.messageAvatar}>🤖</div>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={styles.inputArea}>
          <div className={styles.inputContainer}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className={styles.input}
              disabled={isTyping}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              className={styles.sendBtn}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
