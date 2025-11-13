"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ApiClient } from "@/lib/api-client"
import type { CVAnalysisResponse } from "@/lib/types"
import Link from "next/link"
import styles from "./cv-analysis.module.css"

export default function CVAnalysisPage() {
  const { user } = useAuth()
  const router = useRouter()
  const api = ApiClient.getInstance()

  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvText, setCvText] = useState("")
  const [targetJobTitle, setTargetJobTitle] = useState("")
  const [targetJobDescription, setTargetJobDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<CVAnalysisResponse | null>(null)
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0])
      // Optionally read file content
      const reader = new FileReader()
      reader.onload = (event) => {
        setCvText(event.target?.result as string || "")
      }
      reader.readAsText(e.target.files[0])
    }
  }

  const handleAnalyze = async () => {
    if (!cvText.trim()) {
      setError("Please upload a CV or paste your CV text")
      return
    }

    setError("")
    setIsAnalyzing(true)

    try {
      const requestData = {
        cvText: cvText.trim(),
        targetJobTitle: targetJobTitle || undefined,
        targetJobDescription: targetJobDescription || undefined,
      }

      const result = await api.post<CVAnalysisResponse>("/ai/analyze-cv", requestData)
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze CV")
      console.error("CV analysis error:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#4caf50"
    if (score >= 60) return "#ff9800"
    return "#f44336"
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/jobseeker/dashboard" className={styles.backLink}>← Back to Dashboard</Link>
          <h1 className={styles.title}>🤖 AI CV Analysis</h1>
          <p className={styles.subtitle}>
            Get professional feedback on your resume and improve your chances of getting hired
          </p>
        </div>
      </header>

      <div className={styles.mainContent}>
        {!analysis ? (
          /* Upload Section */
          <section className={styles.uploadSection}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Upload Your CV</h2>

              {error && <div className={styles.error}>{error}</div>}

              {/* File Upload */}
              <div className={styles.uploadArea}>
                <input
                  type="file"
                  id="cvFile"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
                <label htmlFor="cvFile" className={styles.uploadLabel}>
                  <div className={styles.uploadIcon}>📄</div>
                  <div className={styles.uploadText}>
                    {cvFile ? (
                      <>
                        <span className={styles.fileName}>{cvFile.name}</span>
                        <span className={styles.fileSize}>
                          ({(cvFile.size / 1024).toFixed(2)} KB)
                        </span>
                      </>
                    ) : (
                      <>
                        <span>Click to upload or drag & drop</span>
                        <span className={styles.uploadHint}>PDF, DOC, DOCX, TXT (max 5MB)</span>
                      </>
                    )}
                  </div>
                </label>
              </div>

              <div className={styles.divider}>OR</div>

              {/* Text Input */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Paste Your CV Text</label>
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Paste your CV content here..."
                  rows={10}
                  className={styles.textarea}
                />
              </div>

              {/* Optional Fields */}
              <div className={styles.optionalSection}>
                <h3 className={styles.optionalTitle}>Optional: Target Job (for better analysis)</h3>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Target Job Title</label>
                  <input
                    type="text"
                    value={targetJobTitle}
                    onChange={(e) => setTargetJobTitle(e.target.value)}
                    placeholder="e.g., Senior Java Developer"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Target Job Description</label>
                  <textarea
                    value={targetJobDescription}
                    onChange={(e) => setTargetJobDescription(e.target.value)}
                    placeholder="Paste the job description you're targeting..."
                    rows={5}
                    className={styles.textarea}
                  />
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !cvText.trim()}
                className={styles.analyzeBtn}
              >
                {isAnalyzing ? "Analyzing..." : "🤖 Analyze My CV"}
              </button>
            </div>
          </section>
        ) : (
          /* Analysis Results */
          <section className={styles.resultsSection}>
            <div className={styles.resultsHeader}>
              <h2 className={styles.resultsTitle}>Your CV Analysis Results</h2>
              <button onClick={() => setAnalysis(null)} className={styles.newAnalysisBtn}>
                Analyze Another CV
              </button>
            </div>

            {/* Overall Score */}
            <div className={styles.scoreCard}>
              <div className={styles.scoreCircle} style={{ borderColor: getScoreColor(analysis.overallScore) }}>
                <div className={styles.scoreValue} style={{ color: getScoreColor(analysis.overallScore) }}>
                  {analysis.overallScore}
                </div>
                <div className={styles.scoreLabel}>Overall Score</div>
              </div>
              <div className={styles.scoreInfo}>
                <h3>CV Quality Assessment</h3>
                <p>
                  {analysis.overallScore >= 80
                    ? "Excellent! Your CV is well-optimized."
                    : analysis.overallScore >= 60
                    ? "Good start! Some improvements needed."
                    : "Needs improvement. Follow the suggestions below."}
                </p>
              </div>
            </div>

            <div className={styles.resultsGrid}>
              {/* ATS Score */}
              <div className={styles.resultCard}>
                <h3 className={styles.resultCardTitle}>📊 ATS Score</h3>
                <div className={styles.atsScore} style={{ color: getScoreColor(analysis.atsScore) }}>
                  {analysis.atsScore}/100
                </div>
                <p className={styles.resultCardDesc}>
                  Applicant Tracking System compatibility score
                </p>
              </div>

              {/* Strengths */}
              <div className={styles.resultCard}>
                <h3 className={styles.resultCardTitle}>✅ Strengths</h3>
                <ul className={styles.list}>
                  {analysis.strengths.map((item, idx) => (
                    <li key={idx} className={styles.listItemGood}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className={styles.resultCard}>
                <h3 className={styles.resultCardTitle}>⚠️ Areas for Improvement</h3>
                <ul className={styles.list}>
                  {analysis.improvements.map((item, idx) => (
                    <li key={idx} className={styles.listItemWarning}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Missing Keywords */}
              <div className={styles.resultCard}>
                <h3 className={styles.resultCardTitle}>❌ Missing Keywords</h3>
                {analysis.missingKeywords.length > 0 ? (
                  <div className={styles.keywords}>
                    {analysis.missingKeywords.map((keyword, idx) => (
                      <span key={idx} className={styles.keywordTag}>{keyword}</span>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noKeywords}>No critical keywords missing!</p>
                )}
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className={styles.feedbackCard}>
              <h3 className={styles.feedbackTitle}>📝 Detailed Feedback</h3>
              <p className={styles.feedbackText}>{analysis.detailedFeedback}</p>
            </div>

            {/* Action Items */}
            <div className={styles.actionCard}>
              <h3 className={styles.actionTitle}>✓ Action Items</h3>
              <ul className={styles.actionList}>
                {analysis.actionItems.map((item, idx) => (
                  <li key={idx} className={styles.actionItem}>
                    <input type="checkbox" className={styles.checkbox} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Download Button */}
            <div className={styles.downloadSection}>
              <button className={styles.downloadBtn}>
                ⬇️ Download Full Report (PDF)
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
