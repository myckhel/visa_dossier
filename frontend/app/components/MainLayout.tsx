import { useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Dropdown,
  Avatar,
  Typography,
  Space,
  message,
} from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  UploadOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useAuthStore, useUser } from "../stores/auth";
import ProtectedRoute from "./ProtectedRoute";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useUser();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      message.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      message.error("Failed to logout");
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  const sidebarMenuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: "/dossiers",
      icon: <FileTextOutlined />,
      label: <Link to="/dossiers">My Dossiers</Link>,
    },
    {
      key: "/upload",
      icon: <UploadOutlined />,
      label: <Link to="/upload">Upload Documents</Link>,
    },
  ];

  const selectedKeys = [location.pathname];

  return (
    <ProtectedRoute>
      <Layout className="min-h-screen">
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className="shadow-lg"
          theme="light"
        >
          <div className="p-4">
            <Typography.Title
              level={4}
              className={`text-center text-blue-600 mb-0 ${
                collapsed ? "hidden" : ""
              }`}
            >
              Visa Dossier
            </Typography.Title>
            {collapsed && (
              <div className="text-center text-blue-600 font-bold text-xl">
                VD
              </div>
            )}
          </div>

          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            items={sidebarMenuItems}
            className="border-none"
          />
        </Sider>

        <Layout>
          <Header className="bg-white px-4 flex justify-between items-center shadow-sm">
            <Space>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="text-lg"
              />
            </Space>

            <Space>
              <Text className="text-gray-600">Welcome back, {user?.name}</Text>
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
              >
                <Button type="text" className="flex items-center">
                  <Avatar
                    size="small"
                    icon={<UserOutlined />}
                    className="bg-blue-500"
                  />
                  <span className="ml-2">{user?.name}</span>
                </Button>
              </Dropdown>
            </Space>
          </Header>

          <Content className="bg-gray-50">
            <div className="p-6">
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </ProtectedRoute>
  );
}
