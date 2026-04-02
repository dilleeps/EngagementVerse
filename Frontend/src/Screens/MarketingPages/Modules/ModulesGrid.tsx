import ModulesContent from "./ModulesContent";

interface ModuleGridProps {}

const ModuleGrid: React.FC<ModuleGridProps> = () => {
  return (
    <section className="modules-section site-layout-background spacing">
      <div className="container">
        <h3 className="fw-bold text-center mb-3">
          Comprehensive Sales Automation Platform
        </h3>
        <div className="modules-grid">
          {ModulesContent.map((data, i) => (
            <div className="module-card" key={i}>
              <div className="module-icon">{data.icon}</div>
              <h5 className="module-title fw-bold">{data.title}</h5>
              <p>{data.description}</p>
              <ul className="module-features list-unstyled p-0">
                {data.features.map((items, i) => (
                  <li>{items}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModuleGrid;
