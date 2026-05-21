import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function LandingNavbar() {
  return (
    <Navbar expand="lg" fixed="top" className="glass-nav py-3" variant="dark">
      <Container>
        <Navbar.Brand className="fw-bold text-uppercase text-volt">
          CherasRians
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-lg-center gap-lg-4">
            <Nav.Link href="#features">Features</Nav.Link>
            <Nav.Link href="#stats">Analytics</Nav.Link>
            <Nav.Link href="#system">System</Nav.Link>

            <Button
              as={Link}
              to="/login"
              className="btn-volt rounded-pill px-4"
            >
              Login
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
