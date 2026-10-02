import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    navigate("/login");
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      name: "Users",
      path: "/users",
    },
    {
      name: "Sellers",
      path: "/sellers",
    },
    {
      name: "Buyers",
      path: "/buyers",
    },
    {
      name: "Products",
      path: "/products",
    },
    {
      name: "Pending Approvals",
      path: "/pending-approvals",
    },
    {
      name: "Orders",
      path: "/orders",
    },
  ];

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <h1>Next360</h1>
        <p>Admin Panel</p>
      </div>

      <nav className="sidebar-nav">

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            {item.name}
          </NavLink>
        ))}

      </nav>

      <div className="sidebar-bottom">

        <button
          className="sidebar-logout"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;