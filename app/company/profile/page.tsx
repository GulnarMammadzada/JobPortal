"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { ApiClient } from "@/lib/api-client"
import type { CompanyDto } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"

const INDUSTRIES = ["IT", "Finance", "Healthcare", "Education", "Manufacturing", "Retail", "Real Estate", "Other"]
const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"]
const CITIES = ["Baku", "Ganja", "Sumqayit", "Mingachevir", "Lankaran", "Shaki"]

export default function CompanyProfilePage() {
  const { user } = useAuth()
  const api = ApiClient.getInstance()

  const [activeTab, setActiveTab] = useState("info")
  const [company, setCompany] = useState<CompanyDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")

  const [formData, setFormData] = useState({
    companyName: "",
    description: "",
    industry: "",
    companySize: "",
    website: "",
    address: "",
    city: "",
  })

  useEffect(() => {
    fetchCompanyProfile()
  }, [])

  const fetchCompanyProfile = async () => {
    try {
      setIsLoading(true)
      const userData = await api.get<any>("/users/me")
      if (userData.company) {
        setCompany(userData.company)
        setFormData({
          companyName: userData.company.companyName || "",
          description: userData.company.description || "",
          industry: userData.company.industry || "",
          companySize: userData.company.companySize || "",
          website: userData.company.website || "",
          address: userData.company.address || "",
          city: userData.company.city || "",
        })
        if (userData.company.logoUrl) {
          setLogoPreview(`http://localhost:8080${userData.company.logoUrl}`)
        }
      }
    } catch (err) {
      setError("Failed to load company profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Logo file size must be less than 2MB")
        return
      }
      if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
        setError("Only PNG and JPG images are allowed")
        return
      }
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
      setError("")
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSaving(true)

    try {
      await api.put("/companies/my", formData)
      setSuccess("Company profile updated successfully!")
      fetchCompanyProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUploadLogo = async () => {
    if (!logoFile) return

    setError("")
    setSuccess("")
    setIsSaving(true)

    try {
      const formData = new FormData()
      formData.append("file", logoFile)

      const logoUrl = await api.postFormData<string>("/companies/logo", formData)
      setSuccess("Logo uploaded successfully!")
      setLogoFile(null)
      fetchCompanyProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload logo")
    } finally {
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

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Company Profile</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Verification Status */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Verification Status</h3>
            <p className="text-sm text-gray-600">
              {company?.isVerified ? "✅ Your company is verified" : "⏳ Verification pending"}
            </p>
          </div>
          {company?.verificationStatus && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              company.verificationStatus === "APPROVED" ? "bg-green-100 text-green-800" :
              company.verificationStatus === "PENDING" ? "bg-yellow-100 text-yellow-800" :
              "bg-red-100 text-red-800"
            }`}>
              {company.verificationStatus}
            </span>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === "info"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Company Information
          </button>
          <button
            onClick={() => setActiveTab("logo")}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === "logo"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Logo & Branding
          </button>
        </div>
      </div>

      {/* Company Information Tab */}
      {activeTab === "info" && (
        <Card className="p-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Industry <span className="text-red-500">*</span>
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select Industry</option>
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Company Size <span className="text-red-500">*</span>
                </label>
                <select
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select Size</option>
                  {COMPANY_SIZES.map(size => (
                    <option key={size} value={size}>{size} employees</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select City</option>
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Website
                </label>
                <Input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Address
              </label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Office address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Company Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                placeholder="Tell us about your company, culture, values, and what makes you unique..."
                required
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Logo & Branding Tab */}
      {activeTab === "logo" && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Company Logo</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload your company logo. Recommended size: 200x200px. Max file size: 2MB.
              </p>

              <div className="flex items-start gap-6">
                {/* Current Logo */}
                <div>
                  <p className="text-sm font-medium mb-2">Current Logo</p>
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Company Logo"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <div className="text-3xl mb-1">🏢</div>
                        <div className="text-xs">No logo</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Form */}
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">Upload New Logo</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleLogoChange}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer block text-center"
                    >
                      <div className="text-4xl mb-2">📁</div>
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG or JPG (max 2MB)
                      </p>
                    </label>
                  </div>

                  {logoFile && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Selected: {logoFile.name}
                      </p>
                      <Button
                        onClick={handleUploadLogo}
                        disabled={isSaving}
                      >
                        {isSaving ? "Uploading..." : "Upload Logo"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Statistics */}
            {company && (
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Company Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Average Rating</div>
                    <div className="text-2xl font-bold mt-1">
                      {company.averageRating ? `⭐ ${company.averageRating.toFixed(1)}` : "No ratings yet"}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Total Reviews</div>
                    <div className="text-2xl font-bold mt-1">
                      {company.totalReviews || 0}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
