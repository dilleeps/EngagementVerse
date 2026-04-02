import { BackTop, Col, Row } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import "./BeforeLoginFooter.scss";
import { ArrowUp, ArrowUp2 } from "iconsax-react";
import FooterLinks from "./BeforeLoginFooterLinks";
import AssetPath from "@/AssetPath/AssetPath";

interface FooterProps {}

const BeforeLoginFooter: React.FC<FooterProps> = () => {
  return (
    <>
      <footer>
        <div className="container-fluid">
          <Row justify="center">
            <Col span={18}>
              <Row justify="center" align="middle">
                <Col
                  xs={{ span: 24, order: 1 }}
                  sm={{ span: 24, order: 1 }}
                  md={{ span: 12, order: 1 }}
                  lg={{ span: 12, order: 1 }}
                >
                  <div className="basic-info text-center mb-5">
                    <img
                      src={AssetPath.brand.aceSalesWhiteLogo}
                      alt="AceSales.ai"
                      className="mb-3"
                    />
                    <p className="text-white mb-0">
                      The future of sales automation is here. Transform your
                      sales process with AI-powered conversations and
                      intelligent lead nurturing.
                    </p>
                  </div>
                </Col>
              </Row>
              <Row>
                {FooterLinks.map((section, index) => (
                  <Col xs={24} sm={12} md={12} lg={6}>
                    <div className="links padding-left" key={index}>
                      <h4>{section.title}</h4>
                      <ul className="list-unstyled">
                        {section.links.map((item, index) => (
                          <li>
                            <Link to={item.link}>{item.title}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Col>
                ))}
              </Row>

              <div className="bottom-footer spacing-top">
                <p className="text-center text-white">
                  © Copyright 2025{" "}
                  <Link to="" className="text-primary text-center">
                    AceSales.ai
                  </Link>
                  , All Rights Reserved.
                </p>
              </div>
            </Col>
          </Row>
        </div>
      </footer>

      <BackTop>
        <ArrowUp2 size={14} color="#fff" />
      </BackTop>
    </>
  );
};

export default BeforeLoginFooter;
