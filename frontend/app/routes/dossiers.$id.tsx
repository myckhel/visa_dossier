import { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Row,
  Col,
  Descriptions,
  List,
  Spin,
  message,
  Popconfirm,
  Image,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate, Link } from "react-router";
import { dossierApi, documentApi } from "../utils/api";
import type { Dossier, Document } from "../types/api";

const { Title, Text } = Typography;

export default function DossierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [documentDeleteLoading, setDocumentDeleteLoading] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (id) {
      loadDossier();
    }
  }, [id]);

  const loadDossier = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await dossierApi.get(parseInt(id));
      setDossier(response.data);
    } catch (error) {
      console.error("Failed to load dossier:", error);
      message.error("Failed to load dossier");
      navigate("/dossiers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!dossier) return;

    try {
      setDeleteLoading(true);
      await dossierApi.delete(dossier.id);
      message.success("Dossier deleted successfully");
      navigate("/dossiers");
    } catch (error) {
      console.error("Failed to delete dossier:", error);
      message.error("Failed to delete dossier");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownloadDocument = async (documentData: Document) => {
    try {
      const blob = await documentApi.download(dossier!.id, documentData.id);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = documentData.original_filename;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
      message.success("Document downloaded successfully");
    } catch (error) {
      console.error("Failed to download document:", error);
      message.error("Failed to download document");
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    if (!dossier) return;

    try {
      setDocumentDeleteLoading(documentId);
      await documentApi.delete(dossier.id, documentId);
      message.success("Document deleted successfully");
      await loadDossier(); // Reload to update document list
    } catch (error) {
      console.error("Failed to delete document:", error);
      message.error("Failed to delete document");
    } finally {
      setDocumentDeleteLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "default";
      case "submitted":
        return "processing";
      case "processing":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getDocumentIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <FileImageOutlined className="text-green-500" />;
    }
    if (mimeType === "application/pdf") {
      return <FilePdfOutlined className="text-red-500" />;
    }
    return <FileTextOutlined className="text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="text-center py-8">
        <Text>Dossier not found</Text>
        <br />
        <Button type="primary" onClick={() => navigate("/dossiers")}>
          Back to Dossiers
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dossiers")}
            size="large"
          >
            Back to Dossiers
          </Button>
          <div>
            <Title level={2} className="mb-0">
              Dossier: {dossier.passport_number}
            </Title>
            <Tag
              color={getStatusColor(dossier.application_status)}
              className="mt-2"
            >
              {dossier.application_status_label}
            </Tag>
          </div>
        </div>
        <Space>
          <Button
            icon={<UploadOutlined />}
            onClick={() => navigate(`/upload?dossier=${dossier.id}`)}
          >
            Upload Documents
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/dossiers/${dossier.id}/edit`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Dossier"
            description="Are you sure you want to delete this dossier? This action cannot be undone."
            onConfirm={handleDelete}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} loading={deleteLoading}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Row gutter={24}>
        {/* Dossier Information */}
        <Col xs={24} lg={14}>
          <Card title="Dossier Information" className="mb-6">
            <Descriptions
              bordered
              column={{ xs: 1, sm: 1, md: 2 }}
              size="middle"
            >
              <Descriptions.Item label="Passport Number">
                {dossier.passport_number}
              </Descriptions.Item>
              <Descriptions.Item label="Nationality">
                {dossier.nationality}
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                {new Date(dossier.date_of_birth).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Visa Type">
                <Tag color="blue">{dossier.visa_type_label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Application Status">
                <Tag color={getStatusColor(dossier.application_status)}>
                  {dossier.application_status_label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created Date">
                {new Date(dossier.created_at).toLocaleDateString()}
              </Descriptions.Item>
              {dossier.assigned_officer && (
                <Descriptions.Item label="Assigned Officer">
                  {dossier.assigned_officer}
                </Descriptions.Item>
              )}
              {dossier.notes && (
                <Descriptions.Item label="Notes" span={2}>
                  {dossier.notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Additional Data */}
            {dossier.additional_data &&
              Object.keys(dossier.additional_data).length > 0 && (
                <div className="mt-6">
                  <Title level={4}>Additional Information</Title>
                  <Descriptions bordered column={1} size="small">
                    {Object.entries(dossier.additional_data).map(
                      ([key, value]) => (
                        <Descriptions.Item
                          key={key}
                          label={key
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        >
                          {String(value)}
                        </Descriptions.Item>
                      )
                    )}
                  </Descriptions>
                </div>
              )}
          </Card>
        </Col>

        {/* Quick Stats */}
        <Col xs={24} lg={10}>
          <Card title="Quick Stats" className="mb-6">
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {dossier.documents?.length || 0}
                  </div>
                  <div className="text-gray-600">Documents</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {dossier.has_required_documents ? "Yes" : "No"}
                  </div>
                  <div className="text-gray-600">Required Docs</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Documents */}
      <Card
        title={`Documents (${dossier.documents?.length || 0})`}
        extra={
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => navigate(`/upload?dossier=${dossier.id}`)}
          >
            Upload Document
          </Button>
        }
      >
        {!dossier.documents || dossier.documents.length === 0 ? (
          <div className="text-center py-8">
            <Text className="text-gray-500">
              No documents uploaded yet. Upload your first document to get
              started!
            </Text>
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={dossier.documents}
            renderItem={(document) => (
              <List.Item
                actions={[
                  <Button
                    key="download"
                    type="text"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownloadDocument(document)}
                  >
                    Download
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="Delete Document"
                    description="Are you sure you want to delete this document?"
                    onConfirm={() => handleDeleteDocument(document.id)}
                    okText="Yes, Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      loading={documentDeleteLoading === document.id}
                    >
                      Delete
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={getDocumentIcon(document.mime_type)}
                  title={
                    <Space>
                      <span>{document.name}</span>
                      <Tag color="blue">{document.document_type_label}</Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Text>Size: {formatFileSize(document.file_size)}</Text>
                      <Text className="text-gray-500">
                        Uploaded:{" "}
                        {new Date(document.uploaded_at).toLocaleDateString()}
                      </Text>
                      {document.description && (
                        <Text>{document.description}</Text>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
