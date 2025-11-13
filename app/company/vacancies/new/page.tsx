"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ApiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

const CITIES = ["Baku", "Ganja", "Sumqayit", "Mingachevir", "Lankaran", "Shaki"]
const CATEGORIES = ["IT", "Finance", "Marketing", "Sales", "HR", "Engineering", "Design", "Healthcare", "Education", "Other"]
const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]
const EXPERIENCE_LEVELS = ["ENTRY", "JUNIOR", "MID", "SENIOR", "LEAD"]
const CURRENCIES = ["AZN", "USD", "EUR"]

export default function CreateVacancyPage() {
  const router = useRouter()
  const api = ApiClient.getInstance()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    category: "IT",
    city: "Baku",
    isRemote: false,
    employmentType: "FULL_TIME",
    experienceLevel: "MID",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "AZN",
    skills: "",
    deadline: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showAIGenerator, setShowAIGenerator] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const skillsArray = formData.skills.split(",").map(s => s.trim()).filter(s => s.length > 0)

      const payload = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        category: formData.category,
        city: formData.city,
        isRemote: formData.isRemote,
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        salaryMin: Number.parseInt(formData.salaryMin),
        salaryMax: Number.parseInt(formData.salaryMax),
        salaryCurrency: formData.salaryCurrency,
        skills: skillsArray,
        deadline: formData.deadline,
      }

      await api.post("/vacancies", payload)
      router.push("/company/vacancies")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create vacancy")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>

      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-2">Create New Vacancy</h1>
        <p className="text-gray-600 mb-6">Fill in the details to post a new job opening</p>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* AI Generator Suggestion */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-semibold">Need help writing a job description?</h3>
                <p className="text-sm text-gray-600">Let AI generate a professional description for you!</p>
              </div>
            </div>
            <Button onClick={() => router.push("/company/ai-generator")}>
              Generate with AI
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Senior Java Developer"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Employment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    {EMPLOYMENT_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Experience Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    {EXPERIENCE_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    {CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isRemote"
                  id="isRemote"
                  checked={formData.isRemote}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <label htmlFor="isRemote" className="text-sm font-medium">
                  Remote work available
                </label>
              </div>
            </div>
          </div>

          {/* Salary */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Salary Range</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Minimum <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleInputChange}
                  placeholder="1000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Maximum <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleInputChange}
                  placeholder="2000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  name="salaryCurrency"
                  value={formData.salaryCurrency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  {CURRENCIES.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Required Skills <span className="text-red-500">*</span>
            </label>
            <Input
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              placeholder="Java, Spring Boot, PostgreSQL, Docker (comma-separated)"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate skills with commas
            </p>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Job Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the role, company culture, what makes this opportunity unique..."
              rows={6}
              required
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Requirements <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              placeholder="• 5+ years of Java experience&#10;• Spring Boot expertise&#10;• Strong communication skills"
              rows={6}
              required
            />
          </div>

          {/* Responsibilities */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Responsibilities <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleInputChange}
              placeholder="• Design and develop microservices&#10;• Code review and mentoring&#10;• Collaborate with product team"
              rows={6}
              required
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Application Deadline <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Creating..." : "Create Vacancy"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>

          <p className="text-sm text-gray-600 text-center">
            ℹ️ Your vacancy will be reviewed by our admin team before being published.
            You'll receive an email notification once it's approved.
          </p>
        </form>
      </Card>
    </div>
  )
}
