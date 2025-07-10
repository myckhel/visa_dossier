import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Input,
  Select,
  Card,
  Popconfirm,
  message,
  Tooltip,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router";
import { dossierApi } from "../utils/api";
import type { Dossier, VisaType, ApplicationStatus } from "../types/api";

const { Title } = Typography;
const { Search } = Input;

// Constants for filtering
const VISA_TYPE_OPTIONS = [
  { label: "All Types", value: "" },
  { label: "Tourist", value: "tourist" },
  { label: "Student", value: "student" },
  { label: "Work", value: "work" },
  { label: "Business", value: "business" },
  { label: "Transit", value: "transit" },
];

const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Processing", value: "processing" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

interface FilterState {
  search: string;
  visaType: string;
  status: string;
}

export default function DossierList() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    visaType: "",
    status: "",
  });
  const navigate = useNavigate();

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
      message.error("Failed to load dossiers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dossierId: number) => {
    try {
      setDeleteLoading(dossierId);
      await dossierApi.delete(dossierId);
      message.success("Dossier deleted successfully");
      await loadDossiers(); // Reload the list
    } catch (error) {
      console.error("Failed to delete dossier:", error);
      message.error("Failed to delete dossier");
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
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

  // Filter dossiers based on current filters
  const filteredDossiers = dossiers.filter((dossier) => {
    const matchesSearch =
      !filters.search ||
      dossier.passport_number
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      dossier.nationality.toLowerCase().includes(filters.search.toLowerCase());

    const matchesVisaType =
      !filters.visaType || dossier.visa_type === filters.visaType;

    const matchesStatus =
      !filters.status || dossier.application_status === filters.status;

    return matchesSearch && matchesVisaType && matchesStatus;
  });

  const columns: ColumnsType<Dossier> = [
    {
      title: "Passport Number",
      dataIndex: "passport_number",
      key: "passport_number",
      sorter: (a, b) => a.passport_number.localeCompare(b.passport_number),
      render: (text: string, record: Dossier) => (
        <Link
          to={`/dossiers/${record.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {text}
        </Link>
      ),
    },
    {
      title: "Nationality",
      dataIndex: "nationality",
      key: "nationality",
      sorter: (a, b) => a.nationality.localeCompare(b.nationality),
    },
    {
      title: "Visa Type",
      dataIndex: "visa_type_label",
      key: "visa_type",
      filters: VISA_TYPE_OPTIONS.slice(1).map((option) => ({
        text: option.label,
        value: option.value,
      })),
      onFilter: (value, record) => record.visa_type === value,
      render: (text: string, record: Dossier) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "application_status_label",
      key: "application_status",
      filters: STATUS_OPTIONS.slice(1).map((option) => ({
        text: option.label,
        value: option.value,
      })),
      onFilter: (value, record) => record.application_status === value,
      render: (text: string, record: Dossier) => (
        <Tag color={getStatusColor(record.application_status)}>{text}</Tag>
      ),
    },
    {
      title: "Documents",
      key: "documents_count",
      render: (_, record: Dossier) => (
        <span>{record.documents?.length || 0}</span>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "created_at",
      key: "created_at",
      sorter: (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, record: Dossier) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/dossiers/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/dossiers/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Dossier"
              description="Are you sure you want to delete this dossier? This action cannot be undone."
              onConfirm={() => handleDelete(record.id)}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={deleteLoading === record.id}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const pagination: TablePaginationConfig = {
    current: 1,
    pageSize: 10,
    total: filteredDossiers.length,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} dossiers`,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Title level={2} className="mb-0">
          Dossiers
        </Title>
        <Button type="primary" icon={<PlusOutlined />}>
          <Link to="/dossiers/new">Create New Dossier</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Search
            placeholder="Search by passport number or nationality"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />
          <Select
            placeholder="Filter by visa type"
            allowClear
            size="large"
            value={filters.visaType || undefined}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, visaType: value || "" }))
            }
            options={VISA_TYPE_OPTIONS}
          />
          <Select
            placeholder="Filter by status"
            allowClear
            size="large"
            value={filters.status || undefined}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value || "" }))
            }
            options={STATUS_OPTIONS}
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredDossiers}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          scroll={{ x: 800 }}
          size="middle"
        />
      </Card>
    </div>
  );
}
