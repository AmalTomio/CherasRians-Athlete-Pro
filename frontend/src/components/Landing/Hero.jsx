import { Container, Row, Col, Button } from "react-bootstrap";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="hero-section d-flex align-items-center">
      <Container>
        <Row className="align-items-center g-5">
          <Col lg={6}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="hero-badge mb-4 d-inline-block">
                Sports Management Platform
              </span>

              <h1 className="display-2 fw-bold mb-4 text-white">
                Elevate Athlete Performance With Smart Analytics
              </h1>

              <p className="lead text-secondary mb-4">
                Modern athlete management system with attendance,
                booking, performance tracking and real-time analytics.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <Button className="btn-volt px-4 py-3 rounded-pill">
                  Explore Platform
                </Button>

                <Button
                  variant="outline-light"
                  className="px-4 py-3 rounded-pill"
                >
                  Watch Demo
                </Button>
              </div>
            </motion.div>
          </Col>

          <Col lg={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="glass-card hero-card p-4"
            >
              <img
                src="/images/dashboard-preview.png"
                alt="Dashboard"
                className="img-fluid rounded-4"
              />
            </motion.div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}