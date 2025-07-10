import { useState, useEffect, useRef } from "react";
import {
  Typography,
  Card,
  Upload,
  Button,
  message,
  Row,
  Col,
  Tag,
  Image,
  Modal,
  Select,
} from "antd";
import {
  UploadOutlined,
  FileOutlined,
  FilePdfOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import type { RcFile } from "antd/lib/upload/interface";
import { useSearchParams } from "react-router";
import { documentApi, dossierApi } from "../utils/api";
import type {
  Document,
  DocumentType,
  DocumentTypeOption,
  Dossier,
} from "../types/api";

const { Title, Text } = Typography;

// Document categories following the UI pattern from the image
const DOCUMENT_CATEGORIES = [
  {
    key: "identity",
    title: "Identity Documents",
    description: "Essential documents to verify your identity",
    types: [
      "passport",
      "birth_certificate",
      "marriage_certificate",
    ] as DocumentType[],
    required: true,
  },
  {
    key: "financial",
    title: "Financial Documents",
    description: "Documents proving your financial status and capability",
    types: [
      "proof_of_income",
      "bank_statement",
      "employment_contract",
    ] as DocumentType[],
    required: true,
  },
  {
    key: "supporting",
    title: "Supporting Documents",
    description: "Additional documents to support your visa application",
    types: [
      "accommodation_proof",
      "health_insurance",
      "criminal_record",
      "educational_certificate",
      "visa_application_form",
      "passport_photo",
      "other",
    ] as DocumentType[],
    required: false,
  },
];

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  passport: "Passport",
  birth_certificate: "Birth Certificate",
  marriage_certificate: "Marriage Certificate",
  proof_of_income: "Proof of Income",
  bank_statement: "Bank Statement",
  accommodation_proof: "Accommodation Proof",
  health_insurance: "Health Insurance",
  criminal_record: "Criminal Record",
  educational_certificate: "Educational Certificate",
  employment_contract: "Employment Contract",
  visa_application_form: "Visa Application Form",
  passport_photo: "Passport Photo",
  other: "Other",
};

export default function UploadDocuments() {
  const [searchParams] = useSearchParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeOption[]>([]);
  const [selectedDossierId, setSelectedDossierId] = useState<number | null>(
    null
  );
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(
    null
  );
  const uploadTimers = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    loadDossiers();
  }, []);

  useEffect(() => {
    if (selectedDossierId) {
      loadDocuments();
      loadDocumentTypes();
    }
  }, [selectedDossierId]);

  const loadDossiers = async () => {
    try {
      const response = await dossierApi.getList();
      setDossiers(response.data);

      // Check if dossier ID is provided in URL query params
      const dossierIdParam = searchParams.get("dossier");
      if (dossierIdParam) {
        const dossierId = parseInt(dossierIdParam);
        if (response.data.some((d) => d.id === dossierId)) {
          setSelectedDossierId(dossierId);
        } else if (response.data.length > 0) {
          setSelectedDossierId(response.data[0].id);
        }
      } else if (response.data.length > 0) {
        setSelectedDossierId(response.data[0].id);
      }
    } catch (error) {
      message.error("Failed to load dossiers");
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    if (!selectedDossierId) return;

    try {
      const response = await documentApi.getList(selectedDossierId);
      setDocuments(response.data);
    } catch (error) {
      message.error("Failed to load documents");
    }
  };

  const loadDocumentTypes = async () => {
    if (!selectedDossierId) return;

    try {
      const response = await documentApi.getTypes(selectedDossierId);
      setDocumentTypes(response.data);
    } catch (error) {
      message.error("Failed to load document types");
    }
  };

  const getDocumentsByCategory = (types: DocumentType[]) => {
    return documents.filter((doc) => types.includes(doc.document_type));
  };

  const getDocumentTypeLabel = (documentType: DocumentType): string => {
    const apiType = documentTypes.find((type) => type.value === documentType);
    return apiType?.label || DOCUMENT_TYPE_LABELS[documentType] || documentType;
  };

  const handleUpload = async (files: File[], documentType: DocumentType) => {
    if (!selectedDossierId) {
      message.error("Please select a dossier first");
      return;
    }

    if (!files || files.length === 0) {
      message.error("Please select at least one file");
      return;
    }

    const uploadKey = `${documentType}-${Date.now()}`;
    setUploading((prev) => ({ ...prev, [uploadKey]: true }));

    try {
      const uploadData = {
        files, // Now sending array of files
        document_type: documentType,
        name: `${getDocumentTypeLabel(documentType)} - ${
          files.length === 1 ? files[0].name : `${files.length} files`
        }`,
        description: `${getDocumentTypeLabel(documentType)} document${
          files.length > 1 ? "s" : ""
        } uploaded via web interface`,
      };

      await documentApi.upload(selectedDossierId, uploadData);
      const successMessage =
        files.length === 1
          ? "Document uploaded successfully"
          : `${files.length} documents uploaded successfully`;
      message.success(successMessage);
      loadDocuments();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Upload failed";
      message.error(errorMessage);
    } finally {
      setUploading((prev) => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handlePreview = async (
    documentFile: Document["files"][0],
    document: Document
  ) => {
    if (documentFile.mime_type.startsWith("image/")) {
      setPreviewImage(documentFile.url);
      setPreviewTitle(`${document.name} - ${documentFile.name}`);
      setPreviewVisible(true);
    } else {
      // For PDFs and other files, trigger download
      handleDownload(documentFile, document);
    }
  };

  const handleDownload = async (
    documentFile: Document["files"][0],
    document: Document
  ) => {
    if (!selectedDossierId) return;

    try {
      window.open(documentFile.url, "_blank");
    } catch (error) {
      message.error("Failed to download document");
    }
  };

  const handleDelete = async (document: Document) => {
    setDocumentToDelete(document);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedDossierId || !documentToDelete) return;

    try {
      await documentApi.delete(selectedDossierId, documentToDelete.id);
      message.success("Document deleted successfully");
      loadDocuments();
    } catch (error) {
      message.error("Failed to delete document");
    } finally {
      setDeleteModalVisible(false);
      setDocumentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setDocumentToDelete(null);
  };

  const uploadProps: UploadProps = {
    beforeUpload: () => false, // Prevent auto upload
    multiple: true, // Enable multiple file selection
    maxCount: 10, // Maximum 10 files per upload (matches backend validation)
    accept: ".pdf,.jpg,.jpeg,.png",
    showUploadList: false,
  };

  const renderUploadArea = (category: (typeof DOCUMENT_CATEGORIES)[0]) => {
    const categoryDocuments = getDocumentsByCategory(category.types);

    return (
      <Card key={category.key} className="document-category">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Title level={4} className="document-category-title">
              {category.title}
              {category.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Title>
            <Text className="document-category-description">
              {category.description}
            </Text>
          </div>
          <Text className="text-blue-600 font-medium">
            {categoryDocuments.length}/{category.types.length} files uploaded
          </Text>
        </div>

        <Row gutter={[16, 16]}>
          {category.types.map((documentType) => {
            const existingDocs = categoryDocuments.filter(
              (doc) => doc.document_type === documentType
            );
            const hasDocument = existingDocs.length > 0;

            return (
              <Col xs={24} sm={12} md={8} key={documentType}>
                <div className="border border-gray-200 rounded-lg p-4 h-full">
                  <div className="text-center mb-3">
                    <Text strong className="block mb-1">
                      {getDocumentTypeLabel(documentType)}
                    </Text>
                    {hasDocument ? (
                      <Tag color="green">✓ Uploaded</Tag>
                    ) : (
                      <Tag color="orange">Pending</Tag>
                    )}
                  </div>

                  {hasDocument ? (
                    <div className="space-y-2">
                      {existingDocs.map((doc) => (
                        <div key={doc.id} className="document-item">
                          <div className="mb-2">
                            <Text className="block text-sm font-medium text-gray-700">
                              {doc.name}
                            </Text>
                            <Text className="text-xs text-gray-500">
                              {doc.files.length} file
                              {doc.files.length > 1 ? "s" : ""}
                            </Text>
                          </div>

                          {/* Render each file in the document */}
                          {doc.files.map((file, index) => (
                            <div
                              key={`${doc.id}-${index}`}
                              className="flex items-center space-x-2 mb-2 p-2 bg-gray-50 rounded"
                            >
                              {file.mime_type.startsWith("image/") ? (
                                <Image
                                  src={file.thumbnail_url || file.url}
                                  alt={file.name}
                                  className="document-thumbnail"
                                  preview={false}
                                  width={32}
                                  height={32}
                                />
                              ) : (
                                <FilePdfOutlined className="text-red-500 text-2xl" />
                              )}
                              <div className="flex-1 min-w-0">
                                <Text className="block truncate text-sm font-medium">
                                  {file.name}
                                </Text>
                                <Text className="text-xs text-gray-500">
                                  {file.size}
                                </Text>
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  size="small"
                                  icon={<EyeOutlined />}
                                  onClick={() => handlePreview(file, doc)}
                                />
                                <Button
                                  size="small"
                                  icon={<DownloadOutlined />}
                                  onClick={() => handleDownload(file, doc)}
                                />
                              </div>
                            </div>
                          ))}

                          <div className="flex justify-end">
                            <Button
                              size="small"
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDelete(doc)}
                            >
                              Delete Document
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Upload
                      {...uploadProps}
                      onChange={(info) => {
                        if (uploadTimers.current[documentType]) {
                          clearTimeout(uploadTimers.current[documentType]);
                        }

                        uploadTimers.current[documentType] = setTimeout(() => {
                          const files = info.fileList
                            .map((item) => item.originFileObj)
                            .filter(
                              (file): file is RcFile => file !== undefined
                            ) as File[];

                          if (files.length > 0) {
                            handleUpload(files, documentType);
                          }
                        }, 200);
                      }}
                    >
                      <div className="document-upload-area">
                        <PlusOutlined className="text-2xl mb-2 text-gray-400" />
                        <div className="text-sm">
                          <Text className="block">Click to upload</Text>
                          <Text className="text-gray-500">
                            PDF, JPG, PNG (max. 4MB each)
                          </Text>
                          <Text className="text-gray-500">
                            Multiple files supported
                          </Text>
                        </div>
                      </div>
                    </Upload>
                  )}
                </div>
              </Col>
            );
          })}
        </Row>
      </Card>
    );
  };

  if (loading || (selectedDossierId && documentTypes.length === 0)) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="mb-2">
            Essential documents to be reviewed
          </Title>
          <Text className="text-gray-600">
            Upload your visa application documents organized by category
          </Text>
        </div>
        <Text className="text-blue-600 font-medium">
          {documents.length}/12 files uploaded
        </Text>
      </div>

      {dossiers.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Text className="text-gray-500">
              No dossiers found. Please create a dossier first before uploading
              documents.
            </Text>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <div className="mb-4">
              <Text strong>Select Dossier: </Text>
              <Select
                value={selectedDossierId}
                onChange={setSelectedDossierId}
                className="w-64"
                placeholder="Select a dossier"
              >
                {dossiers.map((dossier) => (
                  <Select.Option key={dossier.id} value={dossier.id}>
                    {dossier.passport_number} - {dossier.visa_type_label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Card>

          <div className="space-y-6">
            {DOCUMENT_CATEGORIES.map(renderUploadArea)}
          </div>
        </>
      )}

      {/* Image Preview Modal */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalVisible}
        title="Delete Document"
        onOk={confirmDelete}
        onCancel={cancelDelete}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
      >
        <p>
          Are you sure you want to delete "{documentToDelete?.name}"? This
          action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
