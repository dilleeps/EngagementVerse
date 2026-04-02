import setAuthorizationToken from "@/Actions/setAuthorizationToken";
import Button from "@/Components/Button";
import Field from "@/Components/Formik/Field";
import Form from "@/Components/Formik/Form";
import apiClient from "@/Util/apiClient";
import { Col, Row } from "antd";
import { withFormik } from "formik";
import _ from "lodash";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import "./Login.scss";

const Schema = Yup.object().shape({
  email: Yup.string().required(),
  password: Yup.string().required(),
});

function Login({ validateForm, submitForm, values, ...props }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const currentUser = localStorage.getItem("ACE_SALES");

    if (currentUser) {
      navigate("/app/dashboard");
    }
  }, []);

  const onLogin = async () => {
    await submitForm();
    validateForm().then((err) => {
      if (_.isEmpty(err)) {
        const { email, password } = values;
        apiClient.post("auth", { email, password }).then(({ data }) => {
          if (data?.result) {
            setAuthorizationToken(data.token);
            dispatch({ type: "GET_USER", payload: data.result });
            localStorage.setItem("ACE_SALES", data.token);
            navigate("/app/dashboard");
          }
        });
      }
    });
  };
  return (
    <section className="acesales-login-section">
      <Row gutter={(24, 24)} align="center" justify="middle">
        <Col
          xs={{ span: 24, order: 1 }}
          sm={{ span: 24, order: 1 }}
          md={{ span: 10, order: 1 }}
          lg={{ span: 10, order: 1 }}
        >
          <div className="bg-primary p-5 left-content">
            <h3 className="text-white fw-bold">
              Supercharge Your Sales with AI Automation
            </h3>
            <p className="text-white font-16">
              AI-powered voice and email campaigns, real-time dashboards, and
              secure CRM integrations — all designed to close deals faster than
              ever.
            </p>
            <ul className="list-unstyled font-16 gap-3 text-white">
              <li>🤖 AI Voice & Email Campaigns</li>
              <li>📈 Real-time Sales Dashboard</li>
              <li>🔐 Secure CRM Integrations</li>
              <li>⚡ Lightning-fast Lead Management</li>
            </ul>
          </div>
        </Col>
        <Col
          xs={{ span: 24, order: 1 }}
          sm={{ span: 24, order: 1 }}
          md={{ span: 14, order: 1 }}
          lg={{ span: 14, order: 1 }}
        >
          <div className="login-register-fields d-flex align-items-center justify-content-center">
            <div className="fields-holder">
              <h3 className="mt-0 mb-1 fw-bold">Welcome Back!</h3>
              <p className="mt-0 mb-3">Sign in to Acesales.ai</p>
              <Form>
                <div className="form-fields">
                  <Field name="email" label="Email" />
                </div>
                <div className="form-fields">
                  <Field name="password" label="Password" />
                </div>
                <div className="form-fields mt-2">
                  <Button onClick={onLogin} type="primary" className="w-100">
                    SIGN IN
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
    </section>
  );
}

export default withFormik({
  mapPropsToValues: () => ({
    email: "",
    password: "",
  }),
  validationSchema: Schema,
  handleSubmit: () => null,
})(Login);
