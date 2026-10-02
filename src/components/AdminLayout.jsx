import Sidebar from "./Sidebar";

function AdminLayout({ children }) {
  return (
    <div className="admin-layout">

      <Sidebar />

      <div className="admin-main">
        {children}
      </div>

    </div>
  );
}

export default AdminLayout;