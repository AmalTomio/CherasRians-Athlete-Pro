import { Container, Row, Col } from "react-bootstrap";

const features = [
  {
    title: "Facility Booking",
    description: "Smart facility scheduling with approval workflow.",
  },
  {
    title: "Attendance Tracking",
    description: "Real-time athlete attendance monitoring.",
  },
  {
    title: "Performance Analytics",
    description: "Advanced KPI and training insights dashboard.",
  },
  {
    title: "Equipment Management",
    description: "Inventory tracking and automated equipment requests.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-5 position-relative">
      <Container>
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-white mb-3">
            Core Features
          </h2>

          <p className="text-secondary">
            Built for coaches, athletes and sports administrators.
          </p>
        </div>

        <Row className="g-4">
          {features.map((feature, index) => (
            <Col lg={3} md={6} key={index}>
              <div className="glass-card p-4 h-100 rounded-4">
                <h4 className="text-white mb-3">{feature.title}</h4>
                <p className="text-secondary mb-0">
                  {feature.description}
                </p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}