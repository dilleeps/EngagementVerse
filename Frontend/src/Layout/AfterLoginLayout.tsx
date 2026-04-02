import Button from "@/Components/Button";
import { Layout } from "antd";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "./Header.scss";

const { Header, Content } = Layout;

export default function AfterLoginLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("ACE_SALES")) {
      navigate("/");
    }
  }, []);

  const onLogout = () => {
    localStorage.removeItem("ACE_SALES");
    navigate("/");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <div id="app-view" />

      <Layout className="site-layout">
        <Header
          className="site-layout-background fixed-header"
          id="fixed-header"
          style={{ padding: 0 }}
        >
          <Button onClick={onLogout}>Logout</Button>
        </Header>
        <Content className="site-layout-background default-spacing">
          {localStorage.getItem("ACE_SALES") && <Outlet />}
        </Content>
      </Layout>
    </Layout>
  );
}
