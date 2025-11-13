"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ApiClient } from "@/lib/api-client"
import type { CompanyReviewDto, PageResponse, CreateCompanyReviewRequest } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { DeleteDialog } from "@/components/ui/delete-dialog"
import { Header } from "@/components/jobs/header"
import styles from "./my-reviews.module.css"

export default function MyReviewsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const api = ApiClient.getInstance()

  const [reviews, setReviews] = useState<CompanyReviewDto[]>([])
  const [companies, setCompanies] = useState<Array<{ id: number; companyName: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingReview, setEditingReview] = useState<CompanyReviewDto | null>(null)
  const [showNewReviewForm, setShowNewReviewForm] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; review: CompanyReviewDto | null }>({
    isOpen: false,
    review: null,
  })

  useEffect(() => {
    if (user?.role !== "JOB_SEEKER") {
      router.push("/")
      return
    }
    fetchReviews()
    fetchCompanies()
  }, [user])

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<PageResponse<CompanyReviewDto>>("/company-reviews/my?page=0&size=50")
      setReviews(response.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reviews")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await api.get<any>("/companies?page=0&size=100")
      setCompanies(response.content || [])
    } catch (err) {
      console.error("Failed to fetch companies:", err)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.review) return
    await api.delete(`/company-reviews/${deleteDialog.review.id}`)
    await fetchReviews()
  }

  const handleEdit = (review: CompanyReviewDto) => {
    setEditingReview(review)
  }

  const handleCancelEdit = () => {
    setEditingReview(null)
  }

  const handleSaveEdit = async (reviewId: number, data: CreateCompanyReviewRequest) => {
    try {
      await api.put(`/company-reviews/${reviewId}`, data)
      setEditingReview(null)
      await fetchReviews()
    } catch (err) {
      alert("Failed to update review: " + (err instanceof Error ? err.message : "Unknown error"))
    }
  }

  const handleSaveNewReview = async (data: CreateCompanyReviewRequest) => {
    try {
      await api.post("/company-reviews", data)
      setShowNewReviewForm(false)
      await fetchReviews()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"

      // Check if it's the "already reviewed" error
      if (errorMessage.includes("already reviewed")) {
        alert("You have already reviewed this company. You can edit your existing review instead of creating a new one.")
      } else {
        alert("Failed to create review: " + errorMessage)
      }
    }
  }

  const renderStars = (rating: number, interactive: boolean = false, onRate?: (rating: number) => void) => {
    return (
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.star} ${star <= rating ? styles.starFilled : ""} ${interactive ? styles.starInteractive : ""}`}
            onClick={() => interactive && onRate && onRate(star)}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.loading}>
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Company Reviews</h1>
            <p className={styles.subtitle}>Manage your company reviews</p>
          </div>
          {!showNewReviewForm && (
            <Button onClick={() => setShowNewReviewForm(true)} className={styles.writeReviewBtn}>
              Write a Review
            </Button>
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {showNewReviewForm && (
          <NewReviewForm
            companies={companies}
            reviewedCompanyIds={reviews.map(review => review.companyId)}
            onSave={handleSaveNewReview}
            onCancel={() => setShowNewReviewForm(false)}
            renderStars={renderStars}
          />
        )}

        {reviews.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <p className={styles.emptyText}>No reviews yet</p>
            <p className={styles.emptySubtext}>Start reviewing companies you've worked with</p>
            <Button onClick={() => router.push("/companies")} className={styles.exploreButton}>
              Browse Companies
            </Button>
          </div>
        ) : (
          <div className={styles.reviewsList}>
            {reviews.map((review) => (
              <Card key={review.id} className={styles.reviewCard}>
                <CardHeader>
                  <div className={styles.reviewHeader}>
                    <div>
                      <CardTitle className={styles.companyName}>{review.companyName}</CardTitle>
                      <div className={styles.reviewMeta}>
                        {renderStars(review.rating)}
                        <span className={styles.date}>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {!editingReview || editingReview.id !== review.id ? (
                      <div className={styles.actions}>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(review)}>
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteDialog({ isOpen: true, review })}
                        >
                          Delete
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent>
                  {editingReview && editingReview.id === review.id ? (
                    <EditReviewForm
                      review={review}
                      onSave={handleSaveEdit}
                      onCancel={handleCancelEdit}
                      renderStars={renderStars}
                    />
                  ) : (
                    <>
                      {review.title && <h3 className={styles.reviewTitle}>{review.title}</h3>}
                      <p className={styles.reviewComment}>{review.comment}</p>
                      {review.isCurrentEmployee !== undefined && (
                        <div className={styles.employmentBadge}>
                          {review.isCurrentEmployee ? "Current Employee" : "Former Employee"}
                        </div>
                      )}
                      {review.updatedAt && review.updatedAt !== review.createdAt && (
                        <div className={styles.updatedNote}>
                          Updated {new Date(review.updatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <DeleteDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, review: null })}
          onConfirm={handleDelete}
          title="Delete Review"
          message="Are you sure you want to delete this review? This action cannot be undone."
          itemName={deleteDialog.review?.companyName}
        />
      </div>
    </div>
  )
}

function NewReviewForm({
  companies,
  onSave,
  onCancel,
  renderStars,
  reviewedCompanyIds,
}: {
  companies: Array<{ id: number; companyName: string }>
  onSave: (data: CreateCompanyReviewRequest) => Promise<void>
  onCancel: () => void
  renderStars: (rating: number, interactive: boolean, onRate?: (rating: number) => void) => JSX.Element
  reviewedCompanyIds: number[]
}) {
  const [formData, setFormData] = useState<CreateCompanyReviewRequest>({
    companyId: 0,
    rating: 5,
    title: "",
    comment: "",
    isCurrentEmployee: false,
  })
  const [isSaving, setIsSaving] = useState(false)

  const availableCompanies = companies.filter(company => !reviewedCompanyIds.includes(company.id))

  const handleSubmit = async () => {
    if (formData.companyId === 0) {
      alert("Please select a company")
      return
    }
    if (formData.comment.length < 10) {
      alert("Review must be at least 10 characters long")
      return
    }
    setIsSaving(true)
    try {
      await onSave(formData)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className={styles.newReviewCard}>
      <CardHeader>
        <CardTitle>Write a New Review</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={styles.editForm}>
          <div className={styles.formGroup}>
            <label>Select Company *</label>
            <select
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: parseInt(e.target.value) })}
              className={styles.select}
              required
            >
              <option value={0}>-- Choose a company --</option>
              {availableCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.companyName}
                </option>
              ))}
            </select>
            {availableCompanies.length === 0 && (
              <div className={styles.hint}>
                {companies.length === 0
                  ? "No companies available. Visit the Companies page to see companies."
                  : "You have already reviewed all available companies! 🎉"
                }
              </div>
            )}
            {reviewedCompanyIds.length > 0 && availableCompanies.length > 0 && (
              <div className={styles.hint}>
                ✓ Already reviewed {reviewedCompanyIds.length} {reviewedCompanyIds.length === 1 ? 'company' : 'companies'}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Rating</label>
            {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
          </div>

          <div className={styles.formGroup}>
            <label>Title (Optional)</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Summary of your review"
              className={styles.input}
              maxLength={100}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Review *</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Share your experience..."
              className={styles.textarea}
              rows={6}
              required
              minLength={10}
              maxLength={2000}
            />
            <div className={styles.charCount}>{formData.comment.length} / 2000</div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.isCurrentEmployee || false}
                onChange={(e) => setFormData({ ...formData, isCurrentEmployee: e.target.checked })}
              />
              I currently work here
            </label>
          </div>

          <div className={styles.formActions}>
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving || formData.comment.length < 10 || formData.companyId === 0 || availableCompanies.length === 0}
            >
              {isSaving ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EditReviewForm({
  review,
  onSave,
  onCancel,
  renderStars,
}: {
  review: CompanyReviewDto
  onSave: (reviewId: number, data: CreateCompanyReviewRequest) => Promise<void>
  onCancel: () => void
  renderStars: (rating: number, interactive: boolean, onRate?: (rating: number) => void) => JSX.Element
}) {
  const [formData, setFormData] = useState<CreateCompanyReviewRequest>({
    companyId: review.companyId,
    rating: review.rating,
    title: review.title || "",
    comment: review.comment,
    isCurrentEmployee: review.isCurrentEmployee,
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      await onSave(review.id, formData)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={styles.editForm}>
      <div className={styles.formGroup}>
        <label>Rating</label>
        {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
      </div>

      <div className={styles.formGroup}>
        <label>Title (Optional)</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Summary of your review"
          className={styles.input}
          maxLength={100}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Review</label>
        <textarea
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          placeholder="Share your experience..."
          className={styles.textarea}
          rows={6}
          required
          minLength={10}
          maxLength={2000}
        />
        <div className={styles.charCount}>{formData.comment.length} / 2000</div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.isCurrentEmployee || false}
            onChange={(e) => setFormData({ ...formData, isCurrentEmployee: e.target.checked })}
          />
          I currently work here
        </label>
      </div>

      <div className={styles.formActions}>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving || formData.comment.length < 10}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
