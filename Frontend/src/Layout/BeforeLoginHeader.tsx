import { BackTop, Col, Row } from "antd";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./BeforeLoginHeader.scss";
import AssetPath from "@/AssetPath/AssetPath";
import Button from "@/Components/Button";

interface HeaderProps {}

const menuItems = [
  {
    title: "About",
    link: "",
  },
  {
    title: "Features",
    link: "",
  },
  {
    title: "Pricing",
    link: "",
  },
  {
    title: "Demo",
    link: "",
  },
  {
    title: "Contact Sales",
    link: "",
  },
];

const BeforeLoginHeader: React.FC<HeaderProps> = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50); // Set threshold here
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section
      className={`header d-flex align-items-center justify-content-between ${isScrolled ? "scrolled" : ""}`}
    >
      <div className="d-flex align-items-center justify-content-between">
        <div className="brand">
          <Link to="/">
            <img
              src={AssetPath.brand.aceSalesLogo}
              alt="AceSales.ai"
              className="cursor-pointer"
            />
          </Link>
        </div>
        <ul className="list-unstyled d-flex mb-0">
          {menuItems.map((data, index) => (
            <li key={index}>
              <Link to={data.link}>{data.title}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="contact d-flex align-items-center justify-content-center">
        <Link to="/login" className="me-2">
          Login
        </Link>
        <Button
          label="Start Free Trial"
          type="button"
          variant="primary"
          size="large"
          shape="round"
          onClick={() => navigate("/onboarding")}
          className="ms-2"
        />
      </div>
    </section>
  );
};

export default BeforeLoginHeader;
