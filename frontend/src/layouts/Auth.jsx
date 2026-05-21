import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import athlete from "../assets/athlete.png";
// import logo from "public/sys-logo.png";

export default function Auth({ title, subtitle, children }) {
  return (
    <>
      <style>{`
        .auth-wrapper {
  height: 100vh;
  background: #f4f7fc;
  overflow: hidden;
}

        .auth-grid {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 0.9fr 0.9fr 0.95fr;
        }

        /* LEFT */

        .auth-left {
          padding: 40px 24px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
        }

        .brand-wrapper {
          position: absolute;
          top: 30px;
          left: 24px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand-wrapper img {
          width: 58px;
          height: 58px;
          object-fit: contain;
        }

        .brand-text h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 1px;
          color: #0d2463;
        }

        .brand-text p {
          margin: 0;
          font-size: 11px;
          letter-spacing: 4px;
          color: #506080;
        }

        .hero-title {
          font-size: 78px;
          font-weight: 900;
          line-height: 0.9;
          color: #081f63;
          margin-bottom: 28px;
        }

        .hero-title span {
          color: #4d72ff;
        }

        .hero-subtitle {
  max-width: 400px;
  font-size: 18px;
  line-height: 1.5;
  margin-bottom: 28px;
}

        .feature-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 18px;
        }

        .feature-icon {
          width: 52px;
          height: 52px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: white;
          font-size: 20px;
          font-weight: 700;
        }

        .feature-item h5 {
          margin: 0;
          font-weight: 800;
          color: #081f63;
          font-size: 20px;
        }

        .feature-item p {
          margin-top: 4px;
          color: #5f6f90;
          font-size: 17px;
          line-height: 1.5;
        }

        .copyright {
          position: absolute;
          bottom: 24px;
          left: 24px;
          color: #7182a5;
          font-size: 14px;
        }

        /* CENTER */

        .auth-center {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  position: relative;
  overflow: hidden;
}

        .athlete-wrapper {
  width: 100%;
  max-width: 900px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 100%;
}

        .athlete-image {
  width: 135%;
  max-height: 98vh;
  object-fit: contain;
  object-position: bottom;
  transform: translateY(40px);
}

        /* RIGHT */

        .auth-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px;
        }

        .auth-card {
  width: 100%;
  max-width: 520px;
  background: white;
  border-radius: 32px;
  padding: 30px 32px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.06);
}

        .auth-title {
 font-size: 42px;
  line-height: 1;
            font-weight: 900;
          text-align: center;
          color: #081f63;
          margin-bottom: 8px;
        }

        .auth-subtitle {
  text-align: center;
  color: #68789a;
  font-size: 16px;
  margin-bottom: 20px;
}

        .form-label {
  font-weight: 700;
  color: #0d2463;
  margin-bottom: 6px;
  font-size: 14px;
}

        .form-control,
        .form-select {
          height: 52px;
          border-radius: 20px;
          border: 1px solid #dce5f4;
          background: #fbfcff;
          padding: 0 20px;
          font-size: 16px;
          color: #0d2463;
          box-shadow: none !important;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #4d72ff;
        }

        .btn-auth {
          height: 54px;
          border: none;
          border-radius: 20px;
          width: 100%;
          font-size: 20px;
          font-weight: 800;
          color: white;
          background: linear-gradient(
            135deg,
            #5b7cff,
            #3158ff
          );
          box-shadow: 0 18px 35px rgba(49,88,255,.28);
          transition: .25s ease;
        }

        .btn-auth:hover {
          transform: translateY(-2px);
        }

        .auth-footer {
          text-align: center;
          margin-top: 20px;
          color: #68789a;
          font-size: 16px;
        }

        .auth-footer a {
          font-weight: 800;
          text-decoration: none;
        }

        .back-btn {
          margin-top: 28px;
          width: 100%;
          height: 58px;
          border-radius: 18px;
          border: 1px solid #dce5f4;
          background: white;
          color: #081f63;
          font-weight: 700;
          transition: .25s ease;
        }

        .back-btn:hover {
          background: #f5f8ff;
        }

        /* MOBILE */

        @media (max-width: 1400px) {
          .hero-title {
            font-size: 76px;
          }

          .auth-title {
            font-size: 46px;
          }
        }

        @media (max-width: 1200px) {
          .auth-grid {
            grid-template-columns: 1fr;
          }

          .auth-left,
          .auth-center {
            display: none;
          }

          .auth-right {
            padding: 24px;
          }

          .auth-card {
            max-width: 100%;
            padding: 32px 24px;
          }

          .auth-title {
            font-size: 42px;
          }

          .auth-subtitle {
            font-size: 17px;
          }
        }

        @media (max-width: 576px) {
          .auth-card {
            border-radius: 28px;
            padding: 26px 20px;
          }

          .auth-title {
            font-size: 34px;
          }

          .form-control,
          .form-select,
          .btn-auth {
            height: 56px;
          }
        }
      `}</style>

      <div className="auth-wrapper">
        <div className="auth-grid">
          {/* LEFT */}
          <div className="auth-left">
            {/* <div className="brand-wrapper">
              <img src={logo} alt="logo" />

              <div className="brand-text">
                <h2>CHERASRIANS</h2>
                <p>ATHLETES PRO</p>
              </div>
            </div> */}

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="hero-title">
                Manage.
                <br />
                Train.
                <br />
                <span>Excel.</span>
              </div>

              <p className="hero-subtitle">
                All-in-one platform for athletes, coaches and administrators.
              </p>

              <div className="feature-list">
                <div className="feature-item">
                  <div
                    className="feature-icon"
                    style={{
                      background: "linear-gradient(135deg,#5b7cff,#3f5fff)",
                    }}
                  >
                    ✦
                  </div>

                  <div>
                    <h5>Performance Tracking</h5>
                    <p>Monitor progress and achieve peak performance.</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div
                    className="feature-icon"
                    style={{
                      background: "linear-gradient(135deg,#42d392,#34c985)",
                    }}
                  >
                    ✦
                  </div>

                  <div>
                    <h5>Training Management</h5>
                    <p>Plan, organize and optimize every training session.</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div
                    className="feature-icon"
                    style={{
                      background: "linear-gradient(135deg,#9b5cff,#7c4dff)",
                    }}
                  >
                    ✦
                  </div>

                  <div>
                    <h5>Team Collaboration</h5>
                    <p>Stay connected and achieve more together.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="copyright">© 2026 CherasRians Athletes Pro.</div>
          </div>

          {/* CENTER */}
          <div className="auth-center">
            <motion.div
              className="athlete-wrapper"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img src={athlete} alt="athlete" className="athlete-image" />
            </motion.div>
          </div>

          {/* RIGHT */}
          <div className="auth-right">
            <motion.div
              className="auth-card"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="auth-title">{title}</h1>

              <p className="auth-subtitle">{subtitle}</p>

              {children}

              {/* <Link to="/">
                <button className="back-btn">← Back to Landing Page</button>
              </Link> */}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
