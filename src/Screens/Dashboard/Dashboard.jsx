import { Col, Row } from "antd";
import "./Dashboard.scss";

export default function NewDashboard() {
  return (
    <Row
      gutter={[20]}
      justify="center"
      className="inner-contents zatca-dashboard"
    >
      <Col xs={22} sm={22} md={20} xl={22} className="card-widget">
        Dashboard coming soon..
      </Col>
    </Row>
  );
}
