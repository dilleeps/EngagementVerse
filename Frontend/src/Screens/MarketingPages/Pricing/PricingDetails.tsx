import Button from "../../../Components/Button";
import PricingContent from "./PricingContent";

interface PricingDetailsProps {}

const PricingDetails: React.FC<PricingDetailsProps> = () => {
  return (
    <>
      <section className="pricing-section spacing">
        <div className="container">
          <h3 className="text-center">Choose Your Plan</h3>
          <div className="pricing-grid">
            {PricingContent.map((data, i) => (
              <div
                className={`pricing-card ${
                  data.isFeatured == true ? `featured` : ""
                }`}
                key={i}
              >
                <h3>{data.title}</h3>
                <div className="price">
                  ${data.price}
                  <span className="font-4">{data.priceUnit}</span>
                </div>
                <ul className="list-unstyled module-features">
                  {data.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <Button
                  label={data.actionButtonText}
                  type="button"
                  variant="default"
                  className="me-2"
                  size="large"
                  shape="round"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default PricingDetails;
