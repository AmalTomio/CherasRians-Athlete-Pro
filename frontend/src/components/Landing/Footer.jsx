import { Container, Row, Col } from "react-bootstrap";

export default function Footer() {
  return (
    <footer className="footer-section py-5 border-top border-secondary-subtle">
      <Container>
        <Row className="g-4">
          <Col lg={6}>
            <h4 className="fw-bold text-white mb-3">
              CherasRians Athletes Pro
            </h4>

            <p className="text-secondary">
              Advanced sports management ecosystem for modern athlete development.
            </p>
          </Col>

          <Col lg={6} className="text-lg-end">
            <p className="text-secondary mb-0">
              © 2026 CherasRians. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}