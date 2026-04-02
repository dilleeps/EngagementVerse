import AfterLoginLayout from "@/Layout/AfterLoginLayout";
import BeforeLoginLayout from "@/Layout/BeforeLoginLayout";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  Routes as DOMRouter,
  Route,
  BrowserRouter as Router,
} from "react-router-dom";
import AfterLoginRoutes from "./AfterLoginRoutes";
import BeforeLoginRoutes from "./BeforeLoginRoutes";
import NotFound from "./NotFound";

function CustomRoutes({ userInfo }) {
  const [init, setInit] = useState(false);

  useEffect(() => {
    setInit(true);
  }, []);

  const currentUser = localStorage.getItem("ACCOUNTING_USER");

  return (
    <Router>
      <DOMRouter>
        {init && (
          <>
            <Route path="/" element={<BeforeLoginLayout />}>
              {BeforeLoginRoutes.map((v) => {
                return <Route path={v.path} Component={v.screen} />;
              })}
            </Route>

            <Route path="/app" element={<AfterLoginLayout />}>
              {AfterLoginRoutes.map((v) => {
                return <Route path={v.path} Component={v.screen} />;
              })}
            </Route>
          </>
        )}

        <Route path="*" Component={NotFound} />
      </DOMRouter>
    </Router>
  );
}

function mapStateToProps(state) {
  return {
    userInfo: state.users.userInfo,
  };
}

export default connect(mapStateToProps)(CustomRoutes);
