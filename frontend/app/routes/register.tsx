import { useState } from "react";
import { Form, Input, Button, Card, Typography, message, Divider } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Link, Navigate } from "react-router";
import { useAuthStore, useIsAuthenticated } from "../stores/auth";
import type { RegisterData } from "../types/api";

const { Title, Text } = Typography;

export default function Register() {
  const [form] = Form.useForm<RegisterData>();
  const { register, isLoading, error, clearError } = useAuthStore();
  const isAuthenticated = useIsAuthenticated();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (values: RegisterData) => {
    try {
      setIsSubmitting(true);
      clearError();

      await register({
        ...values,
        device_name: "Visa Dossier Web App",
      });

      message.success("Registration successful! Welcome to Visa Dossier!");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Title level={2} className="text-gray-900">
            Create Account
          </Title>
          <Text className="text-gray-600">
            Join Visa Dossier to manage your visa applications
          </Text>
        </div>

        <Card className="shadow-lg">
          <Form
            form={form}
            name="register"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            autoComplete="off"
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[
                { required: true, message: "Please input your full name!" },
                { min: 2, message: "Name must be at least 2 characters!" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Enter your full name"
                disabled={isSubmitting || isLoading}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="Enter your email"
                disabled={isSubmitting || isLoading}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input your password!" },
                { min: 6, message: "Password must be at least 6 characters!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter your password"
                disabled={isSubmitting || isLoading}
              />
            </Form.Item>

            <Form.Item
              name="password_confirmation"
              label="Confirm Password"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two passwords do not match!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Confirm your password"
                disabled={isSubmitting || isLoading}
              />
            </Form.Item>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <Text className="text-red-600 text-sm">{error}</Text>
              </div>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                loading={isSubmitting || isLoading}
                icon={<UserAddOutlined />}
              >
                Create Account
              </Button>
            </Form.Item>

            <Divider />

            <div className="text-center">
              <Text className="text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:text-blue-500">
                  Sign in here
                </Link>
              </Text>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}
