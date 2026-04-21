export default function AdminSidebar() {
  return (
    <>
      <style>{`
        @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css');
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&display=swap');

        .admin-sidebar-preview {
          display: flex;
          align-items: stretch;
          min-height: 100vh;
          background: #f3ede8;
          font-family: 'Quicksand', sans-serif;
        }

        :root {
          --sidebar-bg: #5f432e;
          --sidebar-hover: #7a5a41;
          --text-light: #fcf6f6;
        }

        .sidenav {
          height: 100vh;
          width: 240px;
          position: relative;
          z-index: 100;
          background-color: var(--sidebar-bg);
          padding: 20px 15px;
          display: flex;
          flex-direction: column;
          box-shadow: 2px 0 10px rgba(0,0,0,0.15);
        }

        .sidebar-header {
          padding: 20px 10px;
          margin-bottom: 30px;
          text-align: center;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .admin-logo {
          width: 60px;
          height: 60px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
          font-size: 24px;
          color: var(--text-light);
        }

        .greeting {
          font-size: 16px;
          color: var(--text-light);
          margin: 0;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .nav-links {
          flex-grow: 1;
        }

        .nav-link {
          padding: 12px 15px;
          text-decoration: none;
          font-size: 16px;
          color: var(--text-light);
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          border-radius: 10px;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          font-family: 'Quicksand', sans-serif;
          font-weight: 500;
        }

        .nav-link i {
          margin-right: 15px;
          font-size: 20px;
          opacity: 0.8;
        }

        .nav-link:hover,
        .nav-link.active {
          background-color: var(--sidebar-hover);
          color: #fff;
          transform: translateX(5px);
        }

        .logout-section {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .btn-logout {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          color: var(--text-light);
          padding: 10px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: 0.3s;
          cursor: pointer;
          font-family: 'Quicksand', sans-serif;
          font-size: 15px;
          font-weight: 500;
        }

        .btn-logout:hover {
          background: #a44c4c;
          border-color: #a44c4c;
          color: white;
        }

        .main-content {
          flex: 1;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #5f432e;
        }

        .main-content h2 {
          font-size: 22px;
          font-weight: 700;
          opacity: 0.5;
        }
      `}</style>

      <div className="admin-sidebar-preview">
        <div className="sidenav">
          <div className="sidebar-header">
            <div className="admin-logo">
              <i className="bi bi-person-badge"></i>
            </div>
            <p className="greeting">Admin Portal</p>
          </div>

          <div className="nav-links">
            <button className="nav-link active">
              <i className="bi bi-cart-check"></i> Orders
            </button>
            <button className="nav-link">
              <i className="bi bi-cake2"></i> Products
            </button>
            <button className="nav-link">
              <i className="bi bi-chat-left-dots"></i> Feedback
            </button>
          </div>

          <div className="logout-section">
            <button className="btn-logout">
              <i className="bi bi-box-arrow-left"></i> Logout
            </button>
          </div>
        </div>

        <div className="main-content">
          <h2>Main content area</h2>
        </div>
      </div>
    </>
  );
}
