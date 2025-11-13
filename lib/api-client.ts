const API_BASE_URL = "http://localhost:8080/api"

export class ApiClient {
    private static instance: ApiClient
    private accessToken: string | null = null
    private refreshToken: string | null = null

    private constructor() {
        this.loadTokens()
    }

    static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient()
        }
        return ApiClient.instance
    }

    private loadTokens(): void {
        if (typeof window !== "undefined") {
            this.accessToken = localStorage.getItem("accessToken")
            this.refreshToken = localStorage.getItem("refreshToken")
        }
    }

    setTokens(accessToken: string, refreshToken: string): void {
        this.accessToken = accessToken
        this.refreshToken = refreshToken
        if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", accessToken)
            localStorage.setItem("refreshToken", refreshToken)
        }
    }

    clearTokens(): void {
        this.accessToken = null
        this.refreshToken = null
        if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
        }
    }

    getAccessToken(): string | null {
        return this.accessToken
    }

    private getHeaders(contentType?: string): HeadersInit {
        const headers: HeadersInit = {
            "Content-Type": contentType || "application/json",
        }

        if (this.accessToken) {
            headers["Authorization"] = `Bearer ${this.accessToken}`
        }

        return headers
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (response.status === 401) {
            this.clearTokens()
            // Redirect to login page
            if (typeof window !== "undefined") {
                window.location.href = "/auth/login"
            }
            throw new Error("Unauthorized: Session expired or invalid token.")
        }

        if (!response.ok) {
            let errorMessage = `API Error: ${response.status}`

            // Add more specific error messages based on status code
            if (response.status === 403) {
                errorMessage = "Forbidden: You don't have permission to access this resource."
            } else if (response.status === 404) {
                errorMessage = "Not Found: The requested resource was not found."
            } else if (response.status === 500) {
                errorMessage = "Internal Server Error: Something went wrong on the server."
            }

            const responseText = await response.text(); // Read body once

            // Only try to parse if we have actual content
            if (responseText && responseText.trim().length > 0) {
            try {
                const errorData = JSON.parse(responseText);
                if (errorData && (errorData.message || errorData.error)) {
                    errorMessage = errorData.message || errorData.error;
                    console.error("API Error Response:", errorData);
                } else if (errorData && Object.keys(errorData).length > 0) {
                    console.error("API Error Response (no message/error property):", errorData);
                }
            } catch (parseError) {
                // If not JSON, use the raw text as error message
                console.error("Failed to parse error response as JSON. Raw response:", responseText);
            }
            if (responseText) { // Always use responseText if available
                errorMessage = responseText;
            }
            } else {
                // Empty response body - log with status code for debugging
                console.error(`API Error ${response.status}: Empty response body from ${response.url}`);
            }

            throw new Error(errorMessage)
        }

        if (response.status === 204) {
            return {} as T // No content to parse for 204
        }

        // Check if response has content before trying to parse as JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return response.json() as Promise<T>
        } else if (contentType && contentType.includes("text/plain")) {
            return response.text() as Promise<T> // Assuming T can be string for plain text
        } else {
            // Fallback to text if not JSON, or empty content type
            return response.text().then(text => text as T)
        }
    }

    async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "GET",
            headers: this.getHeaders(),
        })
        return this.handleResponse<T>(response)
    }

    async post<T>(endpoint: string, data?: Record<string, unknown>, contentType?: string): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            headers: this.getHeaders(contentType),
            body: data ? JSON.stringify(data) : undefined,
        })
        return this.handleResponse<T>(response)
    }

    async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
        const headers: HeadersInit = {}
        if (this.accessToken) {
            headers["Authorization"] = `Bearer ${this.accessToken}`
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            headers,
            body: formData,
        })
        return this.handleResponse<T>(response)
    }

    async put<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "PUT",
            headers: this.getHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        })
        return this.handleResponse<T>(response)
    }

    async delete<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "DELETE",
            headers: this.getHeaders(),
        })
        return this.handleResponse<T>(response)
    }

}
