"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation" // Import useParams
import { useAuth } from "@/lib/auth-context"
import { ApiClient } from "@/lib/api-client"
import type { ApplicationDto } from "@/lib/types"
import Link from "next/link"
import styles from "./application-detail.module.css" // Assuming a new CSS module

export default function ApplicationDetailPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams() // Use useParams hook
  const id = params.id as string // Get application ID from params

  const api = ApiClient.getInstance()

  const [application, setApplication] = useState<ApplicationDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]) // New state for available statuses

  // State for status change functionality
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [interviewDate, setInterviewDate] = useState<string>("")
  const [interviewTime, setInterviewTime] = useState<string>("")
  const [interviewLocation, setInterviewLocation] = useState<string>("") // Re-added
  const [meetingLink, setMeetingLink] = useState<string>("") // Re-added
  const [messageToCandidate, setMessageToCandidate] = useState<string>("")
  const [isUpdating, setIsUpdating] = useState(false) // New state for update loading

  // Map backend status names to display names and icons
  const statusMap: Record<string, { displayName: string; icon: string; colorClass: string }> = {
    PENDING: { displayName: "Pending", icon: "hourglass_empty", colorClass: styles.statusPending },
    REVIEWED: { displayName: "Reviewed", icon: "visibility", colorClass: styles.statusReviewed },
    SHORTLISTED: { displayName: "Shortlisted", icon: "star", colorClass: styles.statusShortlisted },
    INTERVIEW_SCHEDULED: { displayName: "Interview Scheduled", icon: "event", colorClass: styles.statusInterviewScheduled },
    INTERVIEWED: { displayName: "Interviewed", icon: "check_circle", colorClass: styles.statusInterviewed },
    OFFER_SENT: { displayName: "Offer Sent", icon: "send", colorClass: styles.statusOfferSent },
    ACCEPTED: { displayName: "Accepted", icon: "thumb_up", colorClass: styles.statusAccepted },
    REJECTED: { displayName: "Rejected", icon: "thumb_down", colorClass: styles.statusRejected },
  }

  // Define valid status transitions
  const validTransitions: Record<string, string[]> = {
    PENDING: ["REVIEWED", "REJECTED"],
    REVIEWED: ["SHORTLISTED", "INTERVIEW_SCHEDULED", "REJECTED"],
    SHORTLISTED: ["INTERVIEW_SCHEDULED", "OFFER_SENT", "REJECTED"],
    INTERVIEW_SCHEDULED: ["INTERVIEWED", "REJECTED"],
    INTERVIEWED: ["OFFER_SENT", "REJECTED"],
    OFFER_SENT: ["ACCEPTED", "REJECTED"],
    ACCEPTED: [], // Final status, no further transitions
    REJECTED: [], // Final status, no further transitions
  }

  useEffect(() => {
    if (!authLoading && id) {
      if (!user || user.role !== "COMPANY") {
        router.push("/")
      } else {
        fetchApplicationDetails(id)
        fetchAvailableStatuses() // Fetch available statuses
      }
    }
  }, [user, authLoading, id])

  const fetchApplicationDetails = async (applicationId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("Fetching application details for ID:", applicationId); // Added for debugging
      // Use the new /api/applications/{id}/history endpoint
      const response = await api.get<ApplicationDto>(`/applications/${applicationId}/history`)
      setApplication(response)
      setSelectedStatus(response.status) // Pre-select current status
      setMessageToCandidate(response.notes || "") // Pre-populate message if exists
      // Pre-populate interview details if available and status is INTERVIEW_SCHEDULED
      if (response.status === "INTERVIEW_SCHEDULED" && response.interviewDetails) {
        setInterviewDate(response.interviewDetails.date || "")
        setInterviewTime(response.interviewDetails.time || "")
        setInterviewLocation(response.interviewDetails.location || "") // Re-added
        setMeetingLink(response.interviewDetails.meetingLink || "") // Re-added
      }
    } catch (err) {
      console.error("Failed to fetch application details:", err)
      setError("Failed to load application details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailableStatuses = async () => {
    try {
      const response = await api.get<string[]>("/applications/statuses")
      setAvailableStatuses(response)
    } catch (err) {
      console.error("Failed to fetch available statuses:", err)
      // Handle error, maybe set a default list or show an error message
    }
  }

  const handleUpdateStatus = async () => {
    if (!application || !selectedStatus || isUpdating) return;

    setIsUpdating(true);
    setError(null);

    try {
      const requestBody: any = {
        status: selectedStatus,
        notes: messageToCandidate,
      };

      if (selectedStatus === "INTERVIEW_SCHEDULED") {
        requestBody.interviewDetails = {
          date: interviewDate,
          time: interviewTime,
          location: interviewLocation, // Re-added
          meetingLink: meetingLink, // Re-added
        };
      }

      await api.put(`/applications/${application.id}/status`, requestBody);
      alert("Application status updated successfully!");
      router.push("/company/applications"); // Redirect back to applications list
    } catch (err) {
      console.error("Failed to update application status:", err);
      setError("Failed to update application status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || isLoading) {
    return <div className={styles.loading}>Loading application details...</div>
  }

  if (error) {
    return <div className={styles.error}>{error}</div>
  }

  if (!application) {
    return <div className={styles.emptyState}>Application not found.</div>
  }

  const isFinalStatus = application.status === "REJECTED" || application.status === "ACCEPTED";

  return (
    <div className={styles.container}>
      <Link href="/company/applications" className={styles.backLink}>&larr; Back to Applications</Link>
      <h1 className={styles.title}>Application Details for {application.fullName}</h1>

      <div className={styles.detailCard}>
        <div className={styles.detailItem}>
          <strong>Applicant Name:</strong> {application.fullName}
        </div>
        <div className={styles.detailItem}>
          <strong>Email:</strong> {application.email}
        </div>
        {application.phone && (
          <div className={styles.detailItem}>
            <strong>Phone:</strong> {application.phone}
          </div>
        )}
        <div className={styles.detailItem}>
          <strong>Applied for:</strong> {application.vacancyTitle}
        </div>
        <div className={styles.detailItem}>
          <strong>Applied on:</strong> {new Date(application.createdAt).toLocaleDateString()}
        </div>
        <div className={styles.detailItem}>
          <strong>Match Score:</strong> <span className={styles.matchScore} style={{ backgroundColor: getMatchColor(application.matchScore) }}>{application.matchScore}%</span>
        </div>
        <div className={styles.detailItem}>
          <strong>Status:</strong> <span className={styles.statusBadge} style={{ backgroundColor: getAppStatusColor(application.status) }}>{application.status.replace(/_/g, " ")}</span>
        </div>
        {application.cvFileUrl && (
          <div className={styles.detailItem}>
            <strong>CV:</strong> <a href={(() => {
              const parts = application.cvFileUrl.split('/');
              const filename = parts[parts.length - 1];
              return `${api.baseUrl}/api/files/cv/${filename}`;
            })()} target="_blank" rel="noopener noreferrer" className={styles.cvLink}>View CV</a>
          </div>
        )}
        {application.coverLetter && (
          <div className={styles.detailItem}>
            <strong>Cover Letter:</strong> <p className={styles.coverLetter}>{application.coverLetter}</p>
          </div>
        )}
        {application.parsedSkills && (
          <div className={styles.detailItem}>
            <strong>Parsed Skills:</strong> {application.parsedSkills}
          </div>
        )}
        {application.experienceYears && (
          <div className={styles.detailItem}>
            <strong>Experience (Years):</strong> {application.experienceYears}
          </div>
        )}
        {application.notes && (
          <div className={styles.detailItem}>
            <strong>Notes:</strong> <p className={styles.notes}>{application.notes}</p>
          </div>
        )}
      </div>

      {/* Status Change Section */}
      <div className={styles.statusChangeSection}>
        <div className={styles.currentStatusDisplay}>
          Current Status: <span className={styles.statusBadge} style={{ backgroundColor: getAppStatusColor(application.status) }}>{application.status.replace(/_/g, " ")}</span>
        </div>
        <h2 className={styles.statusChangeTitle}>Select next status</h2>
        {isFinalStatus && (
          <div className={styles.disabledMessage}>
            <span className="material-symbols-outlined">info</span>
            <p>This application has a final status ({application.status.replace(/_/g, " ")}). Status changes are disabled.</p>
          </div>
        )}
        <div className={`${styles.statusGrid} ${isFinalStatus ? styles.disabledGrid : ''}`}>
          {Object.keys(statusMap).map((status) => { // Iterate over hardcoded keys for now
            const statusInfo = statusMap[status] || { displayName: status, icon: "help", colorClass: "" };
            const isValidTransition = validTransitions[application.status]?.includes(status);
            const isDisabled = isFinalStatus || !isValidTransition;

            return (
              <div
                key={status}
                className={`${styles.statusCard} ${selectedStatus === status ? styles.selectedCard : ""} ${statusInfo.colorClass} ${isDisabled ? styles.disabledCard : ''}`}
                onClick={() => !isDisabled && setSelectedStatus(status)}
              >
                <span className="material-symbols-outlined">{statusInfo.icon}</span>
                <div>
                  <p className={styles.statusCardTitle}>{statusInfo.displayName}</p>
                  <p className={styles.statusCardDescription}>
                    {status === "PENDING" && "Application submitted, waiting for review."}
                    {status === "REVIEWED" && "Application has been reviewed by the company."}
                    {status === "SHORTLISTED" && "Candidate shortlisted for the next round."}
                    {status === "INTERVIEW_SCHEDULED" && "Interview date/time scheduled."}
                    {status === "INTERVIEWED" && "Interview completed, waiting for a decision."}
                    {status === "OFFER_SENT" && "Job offer sent to the candidate."}
                    {status === "ACCEPTED" && "Candidate accepted the offer."}
                    {status === "REJECTED" && "Decline the application."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conditional Fields: Interview Scheduled */}
        {selectedStatus === "INTERVIEW_SCHEDULED" && (
          <div className={styles.conditionalFields}>
            <h3 className={styles.conditionalFieldsTitle}>Interview Details</h3>
            <div className={styles.interviewDetailsGrid}>
              <label className={styles.formLabel}>
                <p className={styles.formLabelText}>Date</p>
                <input
                  className={styles.formInput}
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  disabled={isFinalStatus}
                />
              </label>
              <label className={styles.formLabel}>
                <p className={styles.formLabelText}>Time</p>
                <input
                  className={styles.formInput}
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  disabled={isFinalStatus}
                />
              </label>
            </div>
            <label className={styles.formLabel}>
              <p className={styles.formLabelText}>Location / Platform</p>
              <input
                className={styles.formInput}
                placeholder="e.g., Google Meet, Office"
                type="text"
                value={interviewLocation}
                onChange={(e) => setInterviewLocation(e.target.value)}
                disabled={isFinalStatus}
              />
            </label>
            <label className={styles.formLabel}>
              <p className={styles.formLabelText}>Meeting Link</p>
              <input
                className={styles.formInput}
                placeholder="https://meet.google.com/..."
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                disabled={isFinalStatus}
              />
            </label>
          </div>
        )}

        {/* Message Text Field */}
        <div className={styles.messageField}>
          <label className={styles.formLabel}>
            <p className={styles.formLabelText}>Message to Candidate</p>
            <textarea
              className={styles.formTextarea}
              placeholder="Write a personalized message..."
              value={messageToCandidate}
              onChange={(e) => setMessageToCandidate(e.target.value)}
              disabled={isFinalStatus}
            ></textarea>
          </label>
          <p className={styles.messageHint}>This message will be sent to the candidate via email. (0/1000)</p>
        </div>

        {/* Email Preview Accordion */}
        <div className={styles.emailPreview}>
          <details>
            <summary className={styles.emailPreviewSummary}>
              <span className={styles.emailPreviewTitle}>Email Preview</span>
              <span className="material-symbols-outlined">expand_more</span>
            </summary>
            <div className={styles.emailPreviewContent}>
              <p><span className={styles.emailPreviewSubject}>Subject:</span> Invitation to Interview for [Job Title]</p>
              <div className={styles.emailPreviewBody}>
                <p>Hi {application.fullName},</p>
                <p>Thank you for your interest in the {application.vacancyTitle} position. We were impressed with your background and would like to invite you for an interview.</p>
                <p>{messageToCandidate || "[Your personalized message will appear here]"}</p>
                <p>Best regards,</p>
                <p>The Hiring Team</p>
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* Footer with Buttons */}
      <div className={styles.footerButtons}>
        {selectedStatus === "REJECTED" && (
          <div className={styles.warningMessage}>
            <span className="material-symbols-outlined">warning</span>
            <p className={styles.warningText}>Warning: Rejecting a candidate is a final action and cannot be undone.</p>
          </div>
        )}
        <div className={styles.actionButtons}>
          <button className={styles.cancelButton} onClick={() => router.back()} disabled={isUpdating || isFinalStatus}>Cancel</button>
          <button className={styles.updateButton} onClick={handleUpdateStatus} disabled={isUpdating || isFinalStatus}>
            {isUpdating ? "Updating..." : "Update & Send Email"}
          </button>
        </div>
      </div>
    </div>
  )
}

// Reusing color functions from dashboard for consistency
const getAppStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: "#ff9800",
    REVIEWED: "#2196f3",
    SHORTLISTED: "#9c27b0",
    INTERVIEW_SCHEDULED: "#ff5722",
    INTERVIEWED: "#00bcd4",
    OFFER_SENT: "#ffeb3b",
    ACCEPTED: "#4caf50",
    REJECTED: "#f44336",
  }
  return colors[status] || "#757575"
}

const getMatchColor = (score: number) => {
  if (score >= 80) return "#4caf50"
  if (score >= 60) return "#ff9800"
  return "#f44336"
}