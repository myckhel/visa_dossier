import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  Token,
  TokenResponse,
  Dossier,
  CreateDossierData,
  UpdateDossierData,
  Document,
  UploadDocumentData,
  DocumentTypeOption,
  ApiResponse,
  ApiListResponse,
} from "../types/api";
import { logoutUser } from "../stores/auth";

// Environment configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 10000,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 401 unauthorized - clear auth state and redirect to login
        if (error.response?.status === 401) {
          // Clear Zustand auth store
          logoutUser();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.client.post(
      "/auth/login",
      credentials
    );
    return response.data;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.client.post(
      "/auth/register",
      userData
    );
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post("/auth/logout");
  }

  async getUserProfile(): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.client.get(
      "/auth/user"
    );
    return response.data;
  }

  // Token management
  async getTokens(): Promise<ApiListResponse<Token>> {
    const response: AxiosResponse<ApiListResponse<Token>> =
      await this.client.get("/tokens");
    return response.data;
  }

  async createToken(
    name: string,
    abilities: string[] = ["*"]
  ): Promise<TokenResponse> {
    const response: AxiosResponse<TokenResponse> = await this.client.post(
      "/tokens",
      {
        name,
        abilities,
      }
    );
    return response.data;
  }

  async revokeToken(tokenId: number): Promise<void> {
    await this.client.delete(`/tokens/${tokenId}`);
  }

  // Dossier endpoints
  async getDossiers(): Promise<ApiListResponse<Dossier>> {
    const response: AxiosResponse<ApiListResponse<Dossier>> =
      await this.client.get("/dossiers");
    return response.data;
  }

  async createDossier(
    dossierData: CreateDossierData
  ): Promise<ApiResponse<Dossier>> {
    const response: AxiosResponse<ApiResponse<Dossier>> =
      await this.client.post("/dossiers", dossierData);
    return response.data;
  }

  async getDossier(id: number): Promise<ApiResponse<Dossier>> {
    const response: AxiosResponse<ApiResponse<Dossier>> = await this.client.get(
      `/dossiers/${id}`
    );
    return response.data;
  }

  async updateDossier(
    id: number,
    dossierData: UpdateDossierData
  ): Promise<ApiResponse<Dossier>> {
    const response: AxiosResponse<ApiResponse<Dossier>> = await this.client.put(
      `/dossiers/${id}`,
      dossierData
    );
    return response.data;
  }

  async deleteDossier(id: number): Promise<void> {
    await this.client.delete(`/dossiers/${id}`);
  }

  // Document endpoints
  async getDocumentTypes(
    dossierId: number
  ): Promise<ApiListResponse<DocumentTypeOption>> {
    const response: AxiosResponse<ApiListResponse<DocumentTypeOption>> =
      await this.client.get(`/dossiers/${dossierId}/documents/types`);
    return response.data;
  }

  async getDossierDocuments(
    dossierId: number,
    documentType?: string
  ): Promise<ApiListResponse<Document>> {
    const params = documentType ? { document_type: documentType } : {};
    const response: AxiosResponse<ApiListResponse<Document>> =
      await this.client.get(`/dossiers/${dossierId}/documents`, { params });
    return response.data;
  }

  async uploadDocument(
    dossierId: number,
    uploadData: UploadDocumentData
  ): Promise<ApiResponse<Document>> {
    const formData = new FormData();

    // Append multiple files
    uploadData.files.forEach((file) => {
      formData.append("files[]", file);
    });

    formData.append("document_type", uploadData.document_type);
    formData.append("name", uploadData.name);
    if (uploadData.description) {
      formData.append("description", uploadData.description);
    }

    const response: AxiosResponse<ApiResponse<Document>> =
      await this.client.post(`/dossiers/${dossierId}/documents`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    return response.data;
  }

  async getDocument(
    dossierId: number,
    documentId: number
  ): Promise<ApiResponse<Document>> {
    const response: AxiosResponse<ApiResponse<Document>> =
      await this.client.get(`/dossiers/${dossierId}/documents/${documentId}`);
    return response.data;
  }

  async downloadDocument(dossierId: number, documentId: number): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.client.get(
      `/dossiers/${dossierId}/documents/${documentId}/download`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  }

  async deleteDocument(dossierId: number, documentId: number): Promise<void> {
    await this.client.delete(`/dossiers/${dossierId}/documents/${documentId}`);
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.client.get("/");
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export convenience methods
export const authApi = {
  login: (credentials: LoginCredentials) => apiClient.login(credentials),
  register: (userData: RegisterData) => apiClient.register(userData),
  logout: () => apiClient.logout(),
  getUserProfile: () => apiClient.getUserProfile(),
};

export const dossierApi = {
  getList: () => apiClient.getDossiers(),
  create: (data: CreateDossierData) => apiClient.createDossier(data),
  get: (id: number) => apiClient.getDossier(id),
  update: (id: number, data: UpdateDossierData) =>
    apiClient.updateDossier(id, data),
  delete: (id: number) => apiClient.deleteDossier(id),
};

export const documentApi = {
  getTypes: (dossierId: number) => apiClient.getDocumentTypes(dossierId),
  getList: (dossierId: number, type?: string) =>
    apiClient.getDossierDocuments(dossierId, type),
  upload: (dossierId: number, data: UploadDocumentData) =>
    apiClient.uploadDocument(dossierId, data),
  get: (dossierId: number, documentId: number) =>
    apiClient.getDocument(dossierId, documentId),
  download: (dossierId: number, documentId: number) =>
    apiClient.downloadDocument(dossierId, documentId),
  delete: (dossierId: number, documentId: number) =>
    apiClient.deleteDocument(dossierId, documentId),
};

export const tokenApi = {
  getList: () => apiClient.getTokens(),
  create: (name: string, abilities?: string[]) =>
    apiClient.createToken(name, abilities),
  revoke: (id: number) => apiClient.revokeToken(id),
};

export default apiClient;
