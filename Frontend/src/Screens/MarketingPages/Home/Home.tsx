import { Card, Col, Row } from "antd";
import { useNavigate } from "react-router-dom";
import Button from "../../../Components/Button";
import CounterFacts from "./CounterFacts";
import "./Home.scss";
import ModuleGrid from "../Modules/ModulesGrid";
import PricingDetails from "../Pricing/PricingDetails";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const navigate = useNavigate();

  return (
    <>
      <section className="home-banner py-5">
        <div className="container text-center">
          <Row align="middle" justify="center">
            <Col xs={24} sm={24} md={24} lg={16}>
              <h1 className="mb-3 font-70 fw-bold">
                AI-Powered Sales Automation
              </h1>
              <p className="mb-4 font-18">
                Transform your sales process with intelligent AI voice calls,
                personalized email campaigns, and automated lead nurturing that
                converts prospects into customers.
              </p>
              <div className="action-buttons d-flex justify-content-center flex-wrap gap-2">
                <Button
                  label="Watch Demo"
                  type="button"
                  variant="primary"
                  className="me-2"
                  size="large"
                  shape="round"
                />
                <Button
                  label="Start Free Trial"
                  type="button"
                  shape="round"
                  size="large"
                />
              </div>
            </Col>
          </Row>
        </div>
      </section>

      <CounterFacts className="spacing-bottom bg9" />

      <ModuleGrid />
      <PricingDetails />

      <section className="acesales-actions  spacing">
        <div className="container d-flex align-items-center justify-content-center">
          <div className="w-50 text-center text-center">
            <h3 className="mb-3">See AceSales.ai in Action</h3>
            <Card>
              <h5 className="text-primary">Interactive Platform Demo</h5>
              <p>
                Watch how AceSales.ai transforms your sales process with
                AI-powered automation, intelligent lead scoring, and seamless
                CRM integration.
              </p>
              <Button
                label="Watch Full Demo"
                type="button"
                variant="primary"
                size="large"
                shape="round"
                onClick={() => navigate("/")}
              />
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
