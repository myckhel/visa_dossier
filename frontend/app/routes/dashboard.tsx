import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Button,
  Typography,
  List,
  Tag,
  Space,
  Spin,
} from "antd";
import {
  FileTextOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Link } from "react-router";
import { dossierApi } from "../utils/api";
import type { Dossier } from "../types/api";

const { Title, Text } = Typography;

export default function Dashboard() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDossiers();
  }, []);

  const loadDossiers = async () => {
    try {
      setLoading(true);
      const response = await dossierApi.getList();
      setDossiers(response.data);
    } catch (error) {
      console.error("Failed to load dossiers:", error);
    } finally {
      setLoading(false);
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

  const stats = {
    total: dossiers.length,
    draft: dossiers.filter((d) => d.application_status === "draft").length,
    submitted: dossiers.filter((d) => d.application_status === "submitted")
      .length,
    approved: dossiers.filter((d) => d.application_status === "approved")
      .length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={2} className="mb-0">
          Dashboard
        </Title>
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>
            <Link to="/dossiers/new">New Dossier</Link>
          </Button>
          <Button icon={<UploadOutlined />}>
            <Link to="/upload">Upload Documents</Link>
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Dossiers"
              value={stats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Draft"
              value={stats.draft}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Submitted"
              value={stats.submitted}
              prefix={<UploadOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Approved"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Dossiers */}
      <Card
        title="Recent Dossiers"
        extra={<Link to="/dossiers">View All</Link>}
        loading={loading}
      >
        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" />
          </div>
        ) : dossiers.length === 0 ? (
          <div className="text-center py-8">
            <Text className="text-gray-500">
              No dossiers found. Create your first dossier to get started!
            </Text>
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={dossiers.slice(0, 5)}
            renderItem={(dossier) => (
              <List.Item
                actions={[
                  <Link key="view" to={`/dossiers/${dossier.id}`}>
                    View
                  </Link>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>Passport: {dossier.passport_number}</Text>
                      <Tag color={getStatusColor(dossier.application_status)}>
                        {dossier.application_status_label}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Text>Visa Type: {dossier.visa_type_label}</Text>
                      <Text>Nationality: {dossier.nationality}</Text>
                      <Text className="text-gray-500">
                        Created:{" "}
                        {new Date(dossier.created_at).toLocaleDateString()}
                      </Text>
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
