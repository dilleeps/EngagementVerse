import Button from "@/Components/Button";
import Field from "@/Components/Formik/Field";
import Form from "@/Components/Formik/Form";
import apiClient from "@/Util/apiClient";
import { Col, Row } from "antd";
import { withFormik } from "formik";
import _ from "lodash";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

const Schema = Yup.object().shape({
  name: Yup.string().required(),
  email: Yup.string().required(),
  companyName: Yup.string().required(),
  password: Yup.string().required(),
});

function CompanyOboarding({ validateForm, submitForm, values, ...props }) {
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem("ACE_SALES");

    if (currentUser) {
      navigate("/app/dashboard");
    }
  }, []);

  const onRegister = async () => {
    await submitForm();
    validateForm().then((err) => {
      if (_.isEmpty(err)) {
        console.log("antony", values);
        apiClient.post("companies/onboarding", values).then(({ data }) => {
          if (data?.result) {
            navigate("/Login");
          }
        });
      }
    });
  };

  return (
    <section className="spacing">
      <Row justify="center">
        <Col lg={{ span: 20 }}>
          <Row gutter={(24, 24)} align="center" justify="middle">
            <Col lg={{ span: 10 }}>
              <div className="login-register-fields">
                <div className="fields-holder">
                  <h1 className="mt-0 mb-1">Welcome </h1>
                  <h2 className="mt-0 mb-3">Sign in to AceSales</h2>
                  <p>Ace Sales Automate your sales with Ace Sales AI</p>
                  <Form>
                    <Field
                      name="name"
                      label="Your full name"
                      className="mb-2"
                    />

                    <Field name="email" label="Email" className="mb-2" />

                    <Field name="phone" label="Phone no." className="mb-2" />

                    <Field
                      name="companyName"
                      label="Company Name"
                      className="mb-2"
                    />

                    <Field name="password" label="Password" className="mb-2" />

                    <Button
                      onClick={onRegister}
                      type="primary"
                      className="mt-2 w-100"
                    >
                      Register
                    </Button>
                  </Form>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </section>
  );
}

export default withFormik({
  mapPropsToValues: () => ({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    password: "",
  }),
  validationSchema: Schema,
  handleSubmit: () => null,
})(CompanyOboarding);
