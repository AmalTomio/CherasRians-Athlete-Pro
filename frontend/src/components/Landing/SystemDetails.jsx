import { Container, Row, Col } from "react-bootstrap";

export default function SystemDetails() {
  return (
    <section id="system" className="py-5">
      <Container>
        <Row className="align-items-center g-5">
          <Col lg={6}>
            <img
              src="/images/system-ui.png"
              alt="System"
              className="img-fluid rounded-4 shadow-lg"
            />
          </Col>

          <Col lg={6}>
            <h2 className="display-5 fw-bold text-white mb-4">
              Built For Modern Sports Management
            </h2>

            <p className="text-secondary mb-4">
              Centralized athlete ecosystem with integrated bookings,
              attendance, analytics and operational workflows.
            </p>

            <div className="glass-card p-4 rounded-4 mb-3">
              <h5 className="text-white">Real-Time Analytics</h5>
              <p className="text-secondary mb-0">
                Live attendance trends and coach dashboards.
              </p>
            </div>

            <div className="glass-card p-4 rounded-4">
              <h5 className="text-white">Automated Workflow</h5>
              <p className="text-secondary mb-0">
                Equipment approvals and schedule automation.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}