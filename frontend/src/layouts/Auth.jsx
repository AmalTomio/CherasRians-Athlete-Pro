import slide1 from "../assets/slide1.jpg";


export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="d-flex vh-100">
      <div className="col-12 col-md-6 d-flex flex-column justify-content-center px-5">
        <div style={{  width: "100%", maxWidth: "600px", margin: "0 auto" }}>
          <h2 className="fw-bold text-center">{title}</h2>
          <p className="text-muted mb-4 text-center">{subtitle}</p>

          {children}
        </div>
      </div>

     {/* RIGHT: IMAGE SECTION */}
{/* RIGHT: IMAGE SECTION */}
<div
  className="d-none d-md-flex col-md-6 text-white align-items-center justify-content-center flex-column p-0"
  style={{
    background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
  }}
>
  <div
    id="authCarousel"
    className="carousel slide carousel-fade w-100"
    data-bs-ride="carousel"
    data-bs-interval="3000"
  >
    <div className="carousel-inner">

      {/* Slide 1 */}
      <div className="carousel-item active text-center p-5">
        <img
          src={slide1}
          className="img-fluid rounded shadow"
          alt="Sport CMS Preview"
          style={{ width: "50%" }}
        />
        <h4 className="fw-bold mt-4">Welcome to Sport CMS</h4>
        <p className="opacity-75">Manage sports activities seamlessly.</p>
      </div>

      {/* Slide 2 (same image, different text) */}
      <div className="carousel-item text-center p-5">
        <img
          src="https://www.freepik.com/free-photo/runway-stadium_1278493.htm#fromView=search&page=1&position=3&uuid=b175b484-cac4-4c68-8208-ab8c160a9203&query=field+sport"
          className="img-fluid rounded shadow"
          alt="Sport CMS Preview"
          style={{ width: "70%" }}
        />
        <h4 className="fw-bold mt-4">Football & Futsal</h4>
        <p className="opacity-75">Training, matches, attendance & lineup.</p>
      </div>

      {/* Slide 3 (same image) */}
      <div className="carousel-item text-center p-5">
        <img
          src="https://www.freepik.com/free-vector/futsal-field-with-players_10289157.htm#fromView=search&page=1&position=4&uuid=a176343c-3468-4eec-aae9-cfee60cfc287&query=futsal"
          className="img-fluid rounded shadow"
          alt="Sport CMS Preview"
          style={{ width: "70%" }}
        />
        <h4 className="fw-bold mt-4">Built for Coaches</h4>
        <p className="opacity-75">Schedule training & manage your team easily.</p>
      </div>

    </div>
  </div>
</div>


      
    </div>
  );
}
