import { Container, Row, Col } from "react-bootstrap";

const stats = [
  {
    value: "10K+",
    label: "Attendance Records",
  },
  {
    value: "98%",
    label: "Booking Accuracy",
  },
  {
    value: "24/7",
    label: "Analytics Access",
  },
  {
    value: "100+",
    label: "Athletes Managed",
  },
];

export default function Stats() {
  return (
    <section id="stats" className="py-5">
      <Container>
        <Row className="g-4 text-center">
          {stats.map((item, index) => (
            <Col lg={3} md={6} key={index}>
              <div className="glass-card rounded-4 p-5">
                <h2 className="display-4 fw-bold text-volt mb-2">
                  {item.value}
                </h2>

                <p className="text-secondary mb-0">
                  {item.label}
                </p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}