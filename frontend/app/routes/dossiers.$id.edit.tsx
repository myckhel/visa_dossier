import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  Typography,
  message,
  Space,
  Row,
  Col,
  Spin,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router";
import { dossierApi } from "../utils/api";
import type {
  Dossier,
  UpdateDossierData,
  VisaType,
  ApplicationStatus,
} from "../types/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Visa type options
const VISA_TYPE_OPTIONS = [
  { label: "Tourist Visa", value: "tourist" },
  { label: "Student Visa", value: "student" },
  { label: "Work Visa", value: "work" },
  { label: "Business Visa", value: "business" },
  { label: "Transit Visa", value: "transit" },
];

// Application status options (for admin/officer updates)
const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Processing", value: "processing" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

// Common nationalities for easier selection
const COMMON_NATIONALITIES = [
  { label: "United States", value: "US" },
  { label: "Canada", value: "CA" },
  { label: "United Kingdom", value: "GB" },
  { label: "France", value: "FR" },
  { label: "Germany", value: "DE" },
  { label: "Spain", value: "ES" },
  { label: "Italy", value: "IT" },
  { label: "Australia", value: "AU" },
  { label: "Japan", value: "JP" },
  { label: "China", value: "CN" },
  { label: "India", value: "IN" },
  { label: "Brazil", value: "BR" },
  { label: "Mexico", value: "MX" },
  { label: "South Africa", value: "ZA" },
  { label: "Nigeria", value: "NG" },
  { label: "Other", value: "OTHER" },
];

interface FormData {
  passport_number: string;
  nationality: string;
  date_of_birth: dayjs.Dayjs;
  visa_type: VisaType;
  application_status: ApplicationStatus;
  notes: string;
  purpose_of_visit?: string;
  intended_duration?: string;
  contact_phone?: string;
  emergency_contact?: string;
}

export default function EditDossier() {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm<FormData>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const navigate = useNavigate();

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
      const dossierData = response.data;
      setDossier(dossierData);

      // Populate form with existing data
      const additionalData = dossierData.additional_data || {};
      form.setFieldsValue({
        passport_number: dossierData.passport_number,
        nationality: dossierData.nationality,
        date_of_birth: dayjs(dossierData.date_of_birth),
        visa_type: dossierData.visa_type,
        application_status: dossierData.application_status,
        notes: dossierData.notes || "",
        purpose_of_visit: additionalData.purpose_of_visit || "",
        intended_duration: additionalData.intended_duration || "",
        contact_phone: additionalData.contact_phone || "",
        emergency_contact: additionalData.emergency_contact || "",
      });
    } catch (error) {
      console.error("Failed to load dossier:", error);
      message.error("Failed to load dossier");
      navigate("/dossiers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: FormData) => {
    if (!dossier) return;

    try {
      setSaving(true);

      // Prepare additional data
      const additionalData: Record<string, any> = {};
      if (values.purpose_of_visit) {
        additionalData.purpose_of_visit = values.purpose_of_visit;
      }
      if (values.intended_duration) {
        additionalData.intended_duration = values.intended_duration;
      }
      if (values.contact_phone) {
        additionalData.contact_phone = values.contact_phone;
      }
      if (values.emergency_contact) {
        additionalData.emergency_contact = values.emergency_contact;
      }

      const updateData: UpdateDossierData = {
        passport_number: values.passport_number,
        nationality: values.nationality,
        date_of_birth: values.date_of_birth.format("YYYY-MM-DD"),
        visa_type: values.visa_type,
        application_status: values.application_status,
        notes: values.notes || undefined,
        ...(Object.keys(additionalData).length > 0 && {
          additional_data: additionalData,
        }),
      };

      await dossierApi.update(dossier.id, updateData);
      message.success("Dossier updated successfully!");
      navigate(`/dossiers/${dossier.id}`);
    } catch (error: any) {
      console.error("Failed to update dossier:", error);
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        Object.entries(errors).forEach(([field, fieldErrors]) => {
          form.setFields([
            {
              name: field as keyof FormData,
              errors: Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors],
            },
          ]);
        });
      } else {
        message.error("Failed to update dossier. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const validatePassportNumber = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error("Passport number is required"));
    }
    if (value.length < 6 || value.length > 15) {
      return Promise.reject(
        new Error("Passport number must be 6-15 characters")
      );
    }
    if (!/^[A-Z0-9]+$/i.test(value)) {
      return Promise.reject(
        new Error("Passport number can only contain letters and numbers")
      );
    }
    return Promise.resolve();
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/dossiers/${dossier.id}`)}
          size="large"
        >
          Back to Dossier
        </Button>
        <Title level={2} className="mb-0">
          Edit Dossier: {dossier.passport_number}
        </Title>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit} size="large">
        <Row gutter={24}>
          <Col span={24}>
            {/* Basic Information */}
            <Card title="Basic Information" className="mb-6">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="passport_number"
                    label="Passport Number"
                    rules={[{ validator: validatePassportNumber }]}
                    extra="Note: Changing passport number may affect document associations"
                  >
                    <Input
                      placeholder="e.g., AB123456"
                      style={{ textTransform: "uppercase" }}
                      onChange={(e) => {
                        e.target.value = e.target.value.toUpperCase();
                        form.setFieldValue("passport_number", e.target.value);
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="nationality"
                    label="Nationality"
                    rules={[
                      { required: true, message: "Please select nationality" },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Select nationality"
                      options={COMMON_NATIONALITIES}
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="date_of_birth"
                    label="Date of Birth"
                    rules={[
                      {
                        required: true,
                        message: "Please select date of birth",
                      },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Select date of birth"
                      disabledDate={(current) => {
                        return (
                          current &&
                          (current > dayjs() ||
                            current < dayjs().subtract(100, "year"))
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="visa_type"
                    label="Visa Type"
                    rules={[
                      { required: true, message: "Please select visa type" },
                    ]}
                  >
                    <Select
                      placeholder="Select visa type"
                      options={VISA_TYPE_OPTIONS}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Status and Notes */}
            <Card title="Status & Notes" className="mb-6">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="application_status"
                    label="Application Status"
                    rules={[
                      {
                        required: true,
                        message: "Please select application status",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select application status"
                      options={STATUS_OPTIONS}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="notes" label="Notes">
                    <TextArea
                      rows={4}
                      placeholder="Add any notes about this dossier"
                      showCount
                      maxLength={1000}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Additional Information */}
            <Card title="Additional Information" className="mb-6">
              <Text className="text-gray-600 block mb-4">
                This information is optional but may help with the visa
                application.
              </Text>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="purpose_of_visit" label="Purpose of Visit">
                    <TextArea
                      rows={3}
                      placeholder="Describe the purpose of visit"
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="intended_duration" label="Intended Duration">
                    <Input
                      placeholder="e.g., 2 weeks, 3 months"
                      maxLength={100}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="contact_phone" label="Contact Phone">
                    <Input placeholder="Contact phone number" maxLength={20} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="emergency_contact" label="Emergency Contact">
                    <Input
                      placeholder="Emergency contact information"
                      maxLength={200}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Actions */}
            <Card>
              <div className="flex justify-end space-x-4">
                <Button
                  size="large"
                  onClick={() => navigate(`/dossiers/${dossier.id}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  icon={<SaveOutlined />}
                  size="large"
                >
                  Save Changes
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
