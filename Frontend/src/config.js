export default {
  API_URL:
    process.env.REACT_APP_DOCKER || process.env.NODE_ENV === "production"
      ? `${window.location.protocol}//${window.location.hostname}${
          window.location.port ? `:${window.location.port}` : ""
        }/api`
      : "http://localhost:4001/api",
};
