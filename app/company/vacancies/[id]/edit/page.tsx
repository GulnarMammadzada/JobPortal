"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ApiClient } from "@/lib/api-client"
import type { VacancyDto } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"

const CITIES = ["Baku", "Ganja", "Sumqayit", "Mingachevir", "Lankaran", "Shaki"]
const CATEGORIES = ["IT", "Finance", "Marketing", "Sales", "HR", "Engineering", "Design", "Healthcare", "Education", "Other"]
const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]
const EXPERIENCE_LEVELS = ["ENTRY", "JUNIOR", "MID", "SENIOR", "LEAD"]
const CURRENCIES = ["AZN", "USD", "EUR"]

export default function EditVacancyPage() {
  const router = useRouter()
  const params = useParams()
  const vacancyId = params.id as string
  const api = ApiClient.getInstance()

  const [vacancy, setVacancy] = useState<VacancyDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

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

  useEffect(() => {
    fetchVacancy()
  }, [vacancyId])

  const fetchVacancy = async () => {
    try {
      setIsLoading(true)
      const data = await api.get<VacancyDto>(`/vacancies/${vacancyId}`)
      setVacancy(data)

      setFormData({
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        responsibilities: data.responsibilities,
        category: data.category,
        city: data.city,
        isRemote: data.isRemote,
        employmentType: data.employmentType,
        experienceLevel: data.experienceLevel,
        salaryMin: data.salaryMin.toString(),
        salaryMax: data.salaryMax.toString(),
        salaryCurrency: data.salaryCurrency,
        skills: data.skills.join(", "),
        deadline: data.deadline.split('T')[0], // Format date for input
      })
    } catch (err) {
      setError("Failed to load vacancy")
    } finally {
      setIsLoading(false)
    }
  }

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
    setIsSaving(true)

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

      await api.put(`/vacancies/${vacancyId}`, payload)
      router.push("/company/vacancies")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update vacancy")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this vacancy? This action cannot be undone.")) {
      return
    }

    try {
      setIsSaving(true)
      await api.delete(`/vacancies/${vacancyId}`)
      router.push("/company/vacancies")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete vacancy")
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (!vacancy) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>Vacancy not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Edit Vacancy</h1>
            <p className="text-gray-600">Update job posting details</p>
          </div>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isSaving}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            🗑️ Delete Vacancy
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {vacancy.status === "ACTIVE" && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800">
              ℹ️ This vacancy is currently active. Changes will be visible immediately.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Same form fields as create vacancy */}
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
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
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
                  <label className="block text-sm font-medium mb-1">Employment Type *</label>
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
                  <label className="block text-sm font-medium mb-1">Experience Level *</label>
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
                  <label className="block text-sm font-medium mb-1">City *</label>
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

          <div>
            <h2 className="text-xl font-semibold mb-4">Salary Range</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Minimum *</label>
                <Input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Maximum *</label>
                <Input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Currency *</label>
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

          <div>
            <label className="block text-sm font-medium mb-1">Required Skills *</label>
            <Input
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              placeholder="Java, Spring Boot, PostgreSQL (comma-separated)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Job Description *</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Requirements *</label>
            <Textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              rows={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Responsibilities *</label>
            <Textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleInputChange}
              rows={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Application Deadline *</label>
            <Input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSaving} className="flex-1">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
