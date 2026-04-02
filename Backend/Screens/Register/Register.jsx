import { Col, Row } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import { register } from "../../Actions/UserAction";
import loginImage from "../../assets/images/registration-1.png";
import ButtonBox from "../../Components/ButtonBox/ButtonBox";
import InputBox from "../../Components/InputBox/InputBox";
import "../EmailVerification/EmailVerification.scss";
import "../Login/Login.scss";

export default class Register extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // currencyOptions: [],
      networkName: "",
      name: "",
      email: "",
      phone: "",
      // currency: '',
      password: "",
      confirmPassword: "",
    };
  }

  onChangeText = (value, type) => {
    this.setState({ [type]: value });
  };

  onRegister = () => {
    const { networkName, name, email, phone, password } = this.state;
    const validateFields = [
      "networkName",
      "name",
      "email",
      "phone",
      "password",
      "confirmPassword",
    ];
    let flag = true;
    validateFields.map((data) => {
      if (this[data] && this[data].error) {
        flag = false;
      }

      return true;
    });

    if (flag) {
      register({ networkName, name, email, phone, password }).then((comp) => {
        if (comp) {
          this.props.history.push("/login");
        }
      });
    } else {
      this.setState({ isSubmit: true });
    }
  };

  render() {
    return (
      <section className="login-register">
        <div className="container-fluid">
          <Row justify="center">
            <Col
              xs={{ span: 23 }}
              sm={{ span: 22 }}
              md={{ span: 20 }}
              lg={{ span: 20 }}
            >
              <Row justify="left" gutter={[16, 16]}>
                <Col
                  xs={{ span: 24 }}
                  sm={{ span: 24 }}
                  md={{ span: 12 }}
                  lg={{ span: 12 }}
                >
                  <div className="left-side-image">
                    <img src={loginImage} alt="Accounting Software Login" />
                    <h2>
                      <Link to="/login">
                        <span>Already have an account?</span> Login Now
                      </Link>
                    </h2>
                  </div>
                </Col>
                <Col
                  xs={{ span: 24 }}
                  sm={{ span: 24 }}
                  md={{ span: 12 }}
                  lg={{ span: 12 }}
                >
                  <div className="login-register-fields">
                    <h1>Customer Registration</h1>
                    <form>
                      <div className="form-field">
                        <InputBox
                          label="Customer Name"
                          refs={(ref) => (this.networkName = ref)}
                          id="networkName"
                          value={this.state.networkName}
                          onChangeText={this.onChangeText}
                          isSubmit={this.state.isSubmit}
                        />
                      </div>
                      <div className="form-field">
                        <InputBox
                          label="Name"
                          refs={(ref) => (this.name = ref)}
                          id="name"
                          value={this.state.name}
                          onChangeText={this.onChangeText}
                          isSubmit={this.state.isSubmit}
                        />
                      </div>

                      <div className="form-field">
                        <InputBox
                          label="Email"
                          refs={(ref) => (this.email = ref)}
                          id="email"
                          value={this.state.email}
                          onChangeText={this.onChangeText}
                          isSubmit={this.state.isSubmit}
                          inputType="email"
                        />
                      </div>
                      <div className="form-field">
                        <InputBox
                          label="Phone"
                          refs={(ref) => (this.phone = ref)}
                          id="phone"
                          value={this.state.phone}
                          onChangeText={this.onChangeText}
                          isSubmit={this.state.isSubmit}
                        />
                      </div>
                      <div className="form-field">
                        <InputBox
                          label="Password"
                          refs={(ref) => (this.password = ref)}
                          id="password"
                          value={this.state.password}
                          onChangeText={this.onChangeText}
                          isSubmit={this.state.isSubmit}
                          type="password"
                          inputType="password"
                        />
                      </div>
                      <div className="form-field">
                        <InputBox
                          label="Confirm Password"
                          refs={(ref) => (this.confirmPassword = ref)}
                          id="confirmPassword"
                          value={this.state.confirmPassword}
                          onChangeText={this.onChangeText}
                          isSubmit={this.state.isSubmit}
                          password={this.state.password}
                          type="password"
                          inputType="confirmPassword"
                        />
                      </div>
                      <div className="form-field">
                        <ButtonBox type="primary" onClick={this.onRegister}>
                          Register Now
                        </ButtonBox>
                      </div>
                    </form>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </section>
    );
  }
}
