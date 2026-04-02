import { Col, Row } from "antd";
import CountUp from "react-countup";
import "./CounterFacts.scss";

interface CountItem {
  name: string;
  value: number;
  additionalText?: string;
}

interface CounterFactsProps {
  className?: string;
  MainTitle?: string;
  desc?: string;
}

const countSet: CountItem[] = [
  {
    name: "Increase in Lead Response Rate",
    value: 300,
    additionalText: "%",
  },
  {
    name: "Time Saved on Outreach",
    value: 85,
    additionalText: "%",
  },
  {
    name: "Calls Made Daily",
    value: 50,
    additionalText: "K",
  },
  {
    name: "Uptime Guarantee",
    value: 99.9,
    additionalText: "%",
  },
];

const CounterFacts: React.FC<CounterFactsProps> = ({
  className = "",
  MainTitle,
  desc,
}) => {
  return (
    <section className={`counter-facts ${className}`}>
      <div className="container">
        {MainTitle && (
          <div className="text-center mb-4">
            <h3 className="h2 mb-2 fw-bold">{`${MainTitle}`}</h3>
            <p className="text-gray">{desc ? desc : ""}</p>
          </div>
        )}

        <Row
          justify="center"
          align="middle"
          gutter={[
            { xs: 0, sm: 15, md: 15, lg: 20 },
            { xs: 0, sm: 0, md: 0, lg: 0 },
          ]}
        >
          {countSet.map((item, i) => (
            <Col key={i} xs={12} sm={12} md={6} lg={6}>
              <div className="text-center">
                <div className="count fw-bold text-primary">
                  <CountUp start={0} end={item.value} duration={6} />
                  {item.additionalText ? item.additionalText : ""}
                </div>
                <div className="name text-gray">{item.name}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default CounterFacts;
