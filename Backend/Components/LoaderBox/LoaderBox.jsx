import PropTypes from "prop-types";
import React from "react";
import invoice from "../../assets/images/logo.png";
import AssetPath from "@/AssetPath/AssetPath";

const LoaderBox = ({ loader, noData, style }) => (
  <>
    {loader && (
      <div
        className="loading-content d-flex align-items-center justify-content-center"
        style={style}
      >
        <img
          src={AssetPath.brand.aceSalesLogo}
          alt="Loading"
          className="mb-2"
        />
        <h1 className="fw-bold">{loader === true ? "Loading.." : loader}</h1>
      </div>
    )}
    {!loader && noData && (
      <div
        className="loading-content d-flex align-items-center justify-content-center"
        style={style}
      >
        <img
          src={AssetPath.brand.aceSalesLogo}
          alt="No Data found"
          className="mb-2"
        />
        <h1 className="fw-bold">
          {noData === true ? "No Data found.." : noData}
        </h1>
      </div>
    )}
  </>
);

LoaderBox.propTypes = {
  loader: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  noData: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  style: PropTypes.object,
};

export default LoaderBox;
