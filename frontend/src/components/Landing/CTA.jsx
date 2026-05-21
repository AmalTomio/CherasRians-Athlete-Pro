import { Container, Button } from "react-bootstrap";

export default function CTA() {
  return (
    <section className="py-5">
      <Container>
        <div className="glass-card rounded-5 p-5 text-center cta-section">
          <h2 className="display-5 fw-bold text-white mb-4">
            Ready To Transform Your Sports Organization?
          </h2>

          <p className="lead text-secondary mb-4">
            Start managing athletes smarter with CherasRians Athletes Pro.
          </p>

          <Button className="btn-volt px-5 py-3 rounded-pill">
            Launch Platform
          </Button>
        </div>
      </Container>
    </section>
  );
}