"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ApiClient } from "@/lib/api-client"
import Link from "next/link"
import styles from "./ai-generator.module.css"

export default function AIGeneratorPage() {
  const { user } = useAuth()
  const router = useRouter()
  const api = ApiClient.getInstance()

  const [jobTitle, setJobTitle] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDescription, setGeneratedDescription] = useState("")
  const [error, setError] = useState("")

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const handleGenerate = async () => {
    if (!jobTitle.trim()) {
      setError("Please enter a job title")
      return
    }

    if (skills.length === 0) {
      setError("Please add at least one skill")
      return
    }

    setError("")
    setIsGenerating(true)

    try {
      const params = new URLSearchParams()
      params.append("jobTitle", jobTitle)
      skills.forEach(skill => params.append("skills", skill))

      const result = await api.post<{ description: string }>(`/ai/generate-job-description?${params.toString()}`)
      setGeneratedDescription(result.jobDescription)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate job description")
      console.error("Generation error:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUseDescription = () => {
    // Redirect to create vacancy page with pre-filled description
    localStorage.setItem("generatedJobDescription", generatedDescription)
    router.push("/company/vacancies/new")
  }

  const handleRegenerate = () => {
    setGeneratedDescription("")
    handleGenerate()
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/company/dashboard" className={styles.backLink}>← Back to Dashboard</Link>
          <h1 className={styles.title}>🤖 AI Job Description Generator</h1>
          <p className={styles.subtitle}>
            Let AI create professional job descriptions in seconds
          </p>
        </div>
      </header>

      <div className={styles.mainContent}>
        {!generatedDescription ? (
          /* Input Section */
          <section className={styles.inputSection}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Generate Job Description</h2>

              {error && <div className={styles.error}>{error}</div>}

              {/* Job Title */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Job Title *
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Senior Java Developer"
                  className={styles.input}
                  disabled={isGenerating}
                />
                <p className={styles.hint}>Enter the position title you're hiring for</p>
              </div>

              {/* Skills */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Required Skills *
                </label>
                <div className={styles.skillInputContainer}>
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddSkill()
                      }
                    }}
                    placeholder="Add a skill and press Enter"
                    className={styles.input}
                    disabled={isGenerating}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className={styles.addBtn}
                    disabled={isGenerating}
                  >
                    + Add
                  </button>
                </div>
                <p className={styles.hint}>Add 3-5 key skills required for this position</p>

                {/* Skills Tags */}
                {skills.length > 0 && (
                  <div className={styles.skillsContainer}>
                    {skills.map((skill, idx) => (
                      <div key={idx} className={styles.skillTag}>
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className={styles.removeBtn}
                          disabled={isGenerating}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className={styles.infoBox}>
                <p className={styles.infoIcon}>ℹ️</p>
                <div>
                  <p className={styles.infoTitle}>What will be generated?</p>
                  <ul className={styles.infoList}>
                    <li>Professional job overview</li>
                    <li>Key responsibilities</li>
                    <li>Required qualifications</li>
                    <li>Nice-to-have skills</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !jobTitle.trim() || skills.length === 0}
                className={styles.generateBtn}
              >
                {isGenerating ? (
                  <>
                    <span className={styles.spinner}></span>
                    Generating...
                  </>
                ) : (
                  "🤖 Generate Job Description"
                )}
              </button>
            </div>
          </section>
        ) : (
          /* Results Section */
          <section className={styles.resultsSection}>
            <div className={styles.resultsHeader}>
              <h2 className={styles.resultsTitle}>Generated Job Description</h2>
              <div className={styles.resultActions}>
                <button onClick={handleRegenerate} className={styles.regenerateBtn}>
                  🔄 Regenerate
                </button>
                <button onClick={() => setGeneratedDescription("")} className={styles.newBtn}>
                  + New Description
                </button>
              </div>
            </div>

            <div className={styles.descriptionCard}>
              <div className={styles.descriptionHeader}>
                <h3>{jobTitle}</h3>
                <div className={styles.skillsTags}>
                  {skills.map((skill, idx) => (
                    <span key={idx} className={styles.skillBadge}>{skill}</span>
                  ))}
                </div>
              </div>

              <div className={styles.descriptionContent}>
                <pre className={styles.descriptionText}>{generatedDescription}</pre>
              </div>

              <div className={styles.descriptionActions}>
                <button onClick={handleUseDescription} className={styles.useBtn}>
                  ✓ Use This Description
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedDescription)
                    alert("Copied to clipboard!")
                  }}
                  className={styles.copyBtn}
                >
                  📋 Copy to Clipboard
                </button>
              </div>
            </div>

            <div className={styles.nextSteps}>
              <h3 className={styles.nextStepsTitle}>Next Steps</h3>
              <div className={styles.stepsList}>
                <div className={styles.step}>
                  <span className={styles.stepNumber}>1</span>
                  <div>
                    <h4>Review & Edit</h4>
                    <p>Review the generated description and make any necessary adjustments</p>
                  </div>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepNumber}>2</span>
                  <div>
                    <h4>Create Vacancy</h4>
                    <p>Use this description to create a new job posting</p>
                  </div>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepNumber}>3</span>
                  <div>
                    <h4>Publish</h4>
                    <p>Submit for approval and start receiving applications</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
