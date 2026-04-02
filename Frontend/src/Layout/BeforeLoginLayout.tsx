import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import "./Header.scss";
import Footer from "./BeforeLoginFooter";
import BeforeLoginHeader from "./BeforeLoginHeader";

const { Header, Content } = Layout;

export default function BeforeLoginLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <div id="app-view" />
      <Layout className="site-layout d-block">
        <BeforeLoginHeader />
        <Content className="bg-white default-spacing">
          <Outlet />
        </Content>
        <Footer />
      </Layout>
    </Layout>
  );
}
