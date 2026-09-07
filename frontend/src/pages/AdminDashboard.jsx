import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Package,
  ShoppingBag,
  Tags,
  Star,
  LogOut,
  Menu,
  X,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  Pencil,
  ShieldCheck,
  Clock3,
  Leaf,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import adminService from "../services/adminService";
import harvestHubLogo from "../assets/logo.png";
import "./AdminDashboard.css";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "farmers", label: "Farmer Approvals", icon: UserCheck },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "categories", label: "Categories", icon: Tags },
  { id: "reviews", label: "Reviews", icon: Star },
];

const SECTION_HERO = {
  overview: {
    eyebrow: "PLATFORM OVERVIEW",
    description:
      "Monitor HarvestHub activity, approve farmers, manage listings and keep the marketplace organized.",
  },
  users: {
    eyebrow: "USER MANAGEMENT",
    description:
      "View registered buyers, farmers and administrators across the HarvestHub community.",
  },
  farmers: {
    eyebrow: "FARMER VERIFICATION",
    description:
      "Review pending farmer profiles and verify trusted growers before they trade on the marketplace.",
  },
  products: {
    eyebrow: "MARKETPLACE PRODUCTS",
    description:
      "Monitor active product listings, stock visibility, pricing and the farmers behind each listing.",
  },
  orders: {
    eyebrow: "ORDER MANAGEMENT",
    description:
      "Track marketplace orders, buyers, farmers, totals and current fulfilment status in one place.",
  },
  categories: {
    eyebrow: "PRODUCT CATEGORIES",
    description:
      "Organize the HarvestHub catalogue with clear agricultural categories that make products easier to discover.",
  },
  reviews: {
    eyebrow: "REVIEWS & RATINGS",
    description:
      "Monitor buyer-to-farmer feedback and rating trends. Demo review records are shown until live review data is available.",
  },
};

const MOCK_REVIEWS = [
  {
    id: "mock-review-001",
    buyerName: "Nimali Perera",
    farmerName: "Sunil Organic Farm",
    rating: 5,
    comment:
      "Fresh vegetables and very careful packing. The order arrived in good condition.",
    date: "2026-09-05T09:25:00.000Z",
  },
  {
    id: "mock-review-002",
    buyerName: "Kasun Fernando",
    farmerName: "Green Valley Harvest",
    rating: 4,
    comment:
      "Good quality produce and the quantities were accurate. Delivery was slightly late.",
    date: "2026-09-04T13:10:00.000Z",
  },
  {
    id: "mock-review-003",
    buyerName: "Shalini Silva",
    farmerName: "Lakmal Fresh Foods",
    rating: 5,
    comment:
      "Very happy with the fruits. Everything was fresh and matched the product listing.",
    date: "2026-09-02T06:40:00.000Z",
  },
  {
    id: "mock-review-004",
    buyerName: "Dinesh Jayawardena",
    farmerName: "Green Valley Harvest",
    rating: 3,
    comment:
      "Products were fine, but I expected better sorting before packing.",
    date: "2026-08-31T15:55:00.000Z",
  },
  {
    id: "mock-review-005",
    buyerName: "Amaya Ranasinghe",
    farmerName: "Sunil Organic Farm",
    rating: 4,
    comment: "Reliable farmer and good communication. I would order again.",
    date: "2026-08-29T11:15:00.000Z",
  },
  {
    id: "mock-review-006",
    buyerName: "Ravindu Senanayake",
    farmerName: "Lakmal Fresh Foods",
    rating: 2,
    comment:
      "Some items were not as fresh as expected, although the rest of the order was acceptable.",
    date: "2026-08-27T08:05:00.000Z",
  },
];

const CATEGORY_OPTIONS = [
  "Vegetables",
  "Fruits",
  "Grains & Rice",
  "Spices & Herbs",
  "Livestock Products",
  "Aquaculture",
  "Plantation Crops",
  "Organic & Other",
];

const EMPTY_ANALYTICS = {
  overview: {
    totalUsers: 0,
    totalFarmers: 0,
    totalBuyers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalReviews: 0,
    totalCategories: 0,
    pendingFarmers: 0,
  },
  recentActivity: { recentUsers: 0, recentOrders: 0, recentReviews: 0 },
  orderStatus: [],
  totalRevenue: 0,
};

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-LK", { maximumFractionDigits: 2 })}`;
}

function initials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

function getErrorMessage(error, fallback = "Something went wrong") {
  return error?.response?.data?.message || fallback;
}

function StatusPill({ tone = "neutral", children }) {
  return <span className={`admin-pill admin-pill--${tone}`}>{children}</span>;
}

function ratingWidthClass(count, total) {
  if (!total || !count) return "admin-rating-width--0";
  const percentage = Math.round((count / total) * 100);
  if (percentage <= 17) return "admin-rating-width--17";
  if (percentage <= 33) return "admin-rating-width--33";
  if (percentage <= 50) return "admin-rating-width--50";
  if (percentage <= 67) return "admin-rating-width--67";
  if (percentage <= 83) return "admin-rating-width--83";
  return "admin-rating-width--100";
}

function Stars({ rating }) {
  return (
    <div className="admin-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={15}
          fill={star <= rating ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="admin-empty">
      <Leaf size={34} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);
  const [users, setUsers] = useState([]);
  const [pendingFarmers, setPendingFarmers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState(MOCK_REVIEWS);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    icon: "🌾",
    description: "",
  });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [savingCategory, setSavingCategory] = useState(false);

  const loadDashboard = useCallback(async ({ quiet = false } = {}) => {
    quiet ? setRefreshing(true) : setLoading(true);
    setError("");

    const requests = await Promise.allSettled([
      adminService.getAnalytics(),
      adminService.getUsers(),
      adminService.getPendingFarmers(),
      adminService.getProducts(),
      adminService.getOrders(),
      adminService.getCategories(),
    ]);

    const [
      analyticsResult,
      usersResult,
      farmersResult,
      productsResult,
      ordersResult,
      categoriesResult,
    ] = requests;

    if (analyticsResult.status === "fulfilled")
      setAnalytics(analyticsResult.value.data.data || EMPTY_ANALYTICS);
    if (usersResult.status === "fulfilled")
      setUsers(usersResult.value.data.data?.users || []);
    if (farmersResult.status === "fulfilled")
      setPendingFarmers(farmersResult.value.data.data || []);
    if (productsResult.status === "fulfilled")
      setProducts(productsResult.value.data.data?.products || []);
    if (ordersResult.status === "fulfilled")
      setOrders(ordersResult.value.data.data?.orders || []);
    if (categoriesResult.status === "fulfilled")
      setCategories(categoriesResult.value.data.data || []);

    const failed = requests.filter((result) => result.status === "rejected");
    if (failed.length === requests.length) {
      setError(
        getErrorMessage(
          failed[0]?.reason,
          "Could not connect to the admin API. Make sure the backend is running and you are logged in as an admin.",
        ),
      );
    } else if (failed.length > 0) {
      setError(
        "Some admin data could not be loaded. The available sections are still shown below.",
      );
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadDashboard();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    setSearchTerm("");
    setNotice("");
    setSidebarOpen(false);
  };

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 3200);
    return () => clearTimeout(timer);
  }, [notice]);

  const query = searchTerm.trim().toLowerCase();

  const filteredUsers = useMemo(
    () =>
      users.filter((item) => {
        if (!query) return true;
        return [item.fullName, item.email, item.role, item.district].some(
          (value) =>
            String(value || "")
              .toLowerCase()
              .includes(query),
        );
      }),
    [users, query],
  );

  const filteredFarmers = useMemo(
    () =>
      pendingFarmers.filter((item) => {
        if (!query) return true;
        return [
          item.farmName,
          item.location,
          item.district,
          item.userId?.fullName,
          item.userId?.email,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
        );
      }),
    [pendingFarmers, query],
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((item) => {
        if (!query) return true;
        return [
          item.name,
          item.category,
          item.district,
          item.farmerId?.fullName,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
        );
      }),
    [products, query],
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter((item) => {
        if (!query) return true;
        return [
          item._id,
          item.status,
          item.buyerId?.fullName,
          item.farmerId?.fullName,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
        );
      }),
    [orders, query],
  );

  const filteredCategories = useMemo(
    () =>
      categories.filter((item) => {
        if (!query) return true;
        return [item.name, item.description].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
        );
      }),
    [categories, query],
  );

  const filteredReviews = useMemo(
    () =>
      reviews.filter((item) => {
        if (!query) return true;
        return [
          item.buyerName,
          item.farmerName,
          item.comment,
          item.rating,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
        );
      }),
    [reviews, query],
  );

  const reviewStats = useMemo(() => {
    const total = reviews.length;
    const average = total
      ? reviews.reduce((sum, item) => sum + item.rating, 0) / total
      : 0;
    const distribution = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: reviews.filter((item) => item.rating === rating).length,
    }));
    return { total, average, distribution };
  }, [reviews]);

  const verifyFarmer = async (farmer) => {
    const farmerId = farmer.userId?._id || farmer.userId;
    if (!farmerId) return;
    try {
      await adminService.verifyFarmer(farmerId, true);
      setPendingFarmers((current) =>
        current.filter((item) => item._id !== farmer._id),
      );
      setAnalytics((current) => ({
        ...current,
        overview: {
          ...current.overview,
          pendingFarmers: Math.max(
            0,
            Number(current.overview?.pendingFarmers || 0) - 1,
          ),
        },
      }));
      setNotice("Farmer verified successfully.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not verify farmer."));
    }
  };

  const toggleProduct = async (product) => {
    try {
      const response = await adminService.toggleProductVisibility(product._id);
      const updated = response.data.data;
      setProducts((current) =>
        current.map((item) =>
          item._id === product._id ? { ...item, ...updated } : item,
        ),
      );
      setNotice(
        `Product ${updated.isAvailable ? "activated" : "deactivated"} successfully.`,
      );
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Could not update product visibility."),
      );
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", icon: "🌾", description: "" });
    setEditingCategoryId(null);
  };

  const submitCategory = async (event) => {
    event.preventDefault();
    if (!categoryForm.name) {
      setError("Select a category name first.");
      return;
    }

    setSavingCategory(true);
    setError("");
    try {
      if (editingCategoryId) {
        const response = await adminService.updateCategory(editingCategoryId, {
          ...categoryForm,
          isActive: true,
        });
        setCategories((current) =>
          current.map((item) =>
            item._id === editingCategoryId ? response.data.data : item,
          ),
        );
        setNotice("Category updated successfully.");
      } else {
        const response = await adminService.createCategory(categoryForm);
        setCategories((current) =>
          [...current, response.data.data].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
        setNotice("Category added successfully.");
      }
      resetCategoryForm();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not save category."));
    } finally {
      setSavingCategory(false);
    }
  };

  const editCategory = (category) => {
    setEditingCategoryId(category._id);
    setCategoryForm({
      name: category.name || "",
      icon: category.icon || "🌾",
      description: category.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeCategory = async (category) => {
    if (!window.confirm(`Delete “${category.name}”?`)) return;
    try {
      await adminService.deleteCategory(category._id);
      setCategories((current) =>
        current.filter((item) => item._id !== category._id),
      );
      setNotice("Category deleted successfully.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not delete category."));
    }
  };

  const removeMockReview = (review) => {
    if (!window.confirm("Remove this demo review from the admin view?")) return;
    setReviews((current) => current.filter((item) => item.id !== review.id));
    setNotice("Demo review removed.");
  };

  const overview = analytics.overview || EMPTY_ANALYTICS.overview;
  const recent = analytics.recentActivity || EMPTY_ANALYTICS.recentActivity;
  const activeLabel =
    NAV_ITEMS.find((item) => item.id === activeSection)?.label || "Overview";

  const statCards = [
    {
      label: "Total Users",
      value: overview.totalUsers,
      meta: `${overview.totalFarmers || 0} farmers · ${overview.totalBuyers || 0} buyers`,
      icon: Users,
    },
    {
      label: "Products",
      value: overview.totalProducts,
      meta: "Marketplace listings",
      icon: Package,
    },
    {
      label: "Orders",
      value: overview.totalOrders,
      meta: `${recent.recentOrders || 0} in the last 7 days`,
      icon: ShoppingBag,
    },
    {
      label: "Pending Farmers",
      value: overview.pendingFarmers,
      meta: "Waiting for verification",
      icon: UserCheck,
    },
    {
      label: "Categories",
      value: overview.totalCategories,
      meta: "Active product groups",
      icon: Tags,
    },
    {
      label: "Demo Reviews",
      value: reviewStats.total,
      meta: `${reviewStats.average.toFixed(1)} average rating`,
      icon: Star,
    },
  ];

  return (
    <div className="admin-shell">
      <aside
        className={`admin-sidebar ${sidebarOpen ? "admin-sidebar--open" : ""}`}
      >
        <div className="admin-brand">
          <img
            className="admin-brand__logo"
            src={harvestHubLogo}
            alt="HarvestHub logo"
          />

          <button
            className="admin-sidebar__close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-nav">
          <p className="admin-nav__label">MANAGEMENT</p>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`admin-nav__item ${activeSection === id ? "admin-nav__item--active" : ""}`}
              onClick={() => handleSectionChange(id)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {id === "farmers" && Number(overview.pendingFarmers || 0) > 0 && (
                <span className="admin-nav__badge">
                  {overview.pendingFarmers}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-profile-mini">
            <div className="admin-avatar">
              {initials(user?.fullName || "Admin")}
            </div>
            <div>
              <strong>{user?.fullName || "Administrator"}</strong>
              <span>{user?.email || "HarvestHub Admin"}</span>
            </div>
          </div>
          <button className="admin-logout" onClick={logout}>
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="admin-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__title">
            <button
              className="admin-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <p>Admin Dashboard</p>
              <h1>{activeLabel}</h1>
            </div>
          </div>
          <div className="admin-topbar__actions">
            <button
              className="admin-refresh"
              onClick={() => loadDashboard({ quiet: true })}
              disabled={refreshing}
            >
              <RefreshCw size={17} className={refreshing ? "admin-spin" : ""} />
              <span>Refresh</span>
            </button>
            <div className="admin-admin-badge">
              <ShieldCheck size={17} /> Admin
            </div>
          </div>
        </header>

        <div className="admin-content">
          {error && (
            <div className="admin-alert admin-alert--error">
              <XCircle size={18} />
              <span>{error}</span>
              <button onClick={() => setError("")} aria-label="Dismiss">
                <X size={16} />
              </button>
            </div>
          )}
          {notice && (
            <div className="admin-alert admin-alert--success">
              <CheckCircle2 size={18} />
              <span>{notice}</span>
            </div>
          )}

          {loading ? (
            <div className="admin-loading">
              <div className="admin-loader" />
              <p>Loading admin data...</p>
            </div>
          ) : (
            <>
              {activeSection === "overview" && (
                <section className="admin-section">
                  <div className="admin-page-hero admin-page-hero--overview">
                    <div className="admin-page-hero__content">
                      <span className="admin-page-hero__eyebrow">
                        {SECTION_HERO.overview.eyebrow}
                      </span>
                      <h2>
                        Welcome back, {user?.fullName?.split(" ")[0] || "Admin"}
                        .
                      </h2>
                      <p>{SECTION_HERO.overview.description}</p>
                    </div>
                  </div>

                  <div className="admin-stat-grid">
                    {statCards.map(({ label, value, meta, icon: Icon }) => (
                      <article className="admin-stat-card" key={label}>
                        <div className="admin-stat-card__icon">
                          <Icon size={21} />
                        </div>
                        <div>
                          <span>{label}</span>
                          <strong>{Number(value || 0).toLocaleString()}</strong>
                          <small>{meta}</small>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="admin-overview-grid">
                    <article className="admin-panel">
                      <div className="admin-panel__heading">
                        <div>
                          <span>LAST 7 DAYS</span>
                          <h3>Recent activity</h3>
                        </div>
                        <Clock3 size={20} />
                      </div>
                      <div className="admin-activity-list">
                        <div>
                          <span>New users</span>
                          <strong>{recent.recentUsers || 0}</strong>
                        </div>
                        <div>
                          <span>New orders</span>
                          <strong>{recent.recentOrders || 0}</strong>
                        </div>
                        <div>
                          <span>New database reviews</span>
                          <strong>{recent.recentReviews || 0}</strong>
                        </div>
                      </div>
                    </article>

                    <article className="admin-panel">
                      <div className="admin-panel__heading">
                        <div>
                          <span>ORDERS</span>
                          <h3>Status breakdown</h3>
                        </div>
                        <ShoppingBag size={20} />
                      </div>
                      <div className="admin-status-list">
                        {analytics.orderStatus?.length ? (
                          analytics.orderStatus.map((item) => (
                            <div key={item._id || "unknown"}>
                              <span className="admin-status-dot" />
                              <span>{item._id || "Unknown"}</span>
                              <strong>{item.count}</strong>
                            </div>
                          ))
                        ) : (
                          <p className="admin-muted">
                            No order status data yet.
                          </p>
                        )}
                      </div>
                    </article>
                  </div>
                </section>
              )}

              {activeSection !== "overview" && (
                <section className="admin-section">
                  <div
                    className={`admin-page-hero admin-page-hero--${activeSection}`}
                  >
                    <div className="admin-page-hero__content">
                      <span className="admin-page-hero__eyebrow">
                        {SECTION_HERO[activeSection]?.eyebrow ||
                          "HARVESTHUB ADMIN"}
                      </span>
                      <h2>{activeLabel}</h2>
                      <p>
                        {SECTION_HERO[activeSection]?.description ||
                          `View and manage ${activeLabel.toLowerCase()} without leaving the admin console.`}
                      </p>
                    </div>
                    {activeSection !== "categories" && (
                      <label className="admin-search admin-search--hero">
                        <Search size={18} />
                        <input
                          value={searchTerm}
                          onChange={(event) =>
                            setSearchTerm(event.target.value)
                          }
                          placeholder={`Search ${activeLabel.toLowerCase()}...`}
                        />
                      </label>
                    )}
                  </div>

                  {activeSection === "users" && (
                    <div className="admin-table-card">
                      {filteredUsers.length ? (
                        <div className="admin-table-wrap">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>District</th>
                                <th>Joined</th>
                                <th>Farmer status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredUsers.map((item) => (
                                <tr key={item._id}>
                                  <td>
                                    <div className="admin-user-cell">
                                      <div className="admin-avatar admin-avatar--small">
                                        {initials(item.fullName)}
                                      </div>
                                      <div>
                                        <strong>{item.fullName}</strong>
                                        <span>{item.email}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <StatusPill
                                      tone={
                                        item.role === "admin"
                                          ? "gold"
                                          : item.role === "farmer"
                                            ? "green"
                                            : "blue"
                                      }
                                    >
                                      {item.role}
                                    </StatusPill>
                                  </td>
                                  <td>{item.district || "—"}</td>
                                  <td>{formatDate(item.createdAt)}</td>
                                  <td>
                                    {item.role === "farmer" ? (
                                      <StatusPill
                                        tone={
                                          item.isVerified ? "green" : "amber"
                                        }
                                      >
                                        {item.isVerified
                                          ? "Verified"
                                          : "Pending"}
                                      </StatusPill>
                                    ) : (
                                      <span className="admin-muted">
                                        Not applicable
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <EmptyState
                          title="No users found"
                          description="There are no users matching your current search."
                        />
                      )}
                    </div>
                  )}

                  {activeSection === "farmers" && (
                    <div className="admin-table-card">
                      {filteredFarmers.length ? (
                        <div className="admin-table-wrap">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Farmer</th>
                                <th>Farm</th>
                                <th>Location</th>
                                <th>Phone</th>
                                <th>Registered</th>
                                <th className="admin-align-right">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredFarmers.map((item) => (
                                <tr key={item._id}>
                                  <td>
                                    <div className="admin-user-cell">
                                      <div className="admin-avatar admin-avatar--small">
                                        {initials(item.userId?.fullName)}
                                      </div>
                                      <div>
                                        <strong>
                                          {item.userId?.fullName || "Farmer"}
                                        </strong>
                                        <span>{item.userId?.email || "—"}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <strong>{item.farmName}</strong>
                                  </td>
                                  <td>
                                    {item.location || item.district || "—"}
                                  </td>
                                  <td>
                                    {item.phone || item.userId?.phone || "—"}
                                  </td>
                                  <td>{formatDate(item.createdAt)}</td>
                                  <td className="admin-align-right">
                                    <button
                                      className="admin-btn admin-btn--primary"
                                      onClick={() => verifyFarmer(item)}
                                    >
                                      <CheckCircle2 size={16} /> Verify
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <EmptyState
                          title="No pending farmers"
                          description="All current farmer profiles are verified."
                        />
                      )}
                    </div>
                  )}

                  {activeSection === "products" && (
                    <div className="admin-table-card">
                      {filteredProducts.length ? (
                        <div className="admin-table-wrap">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Farmer</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th className="admin-align-right">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredProducts.map((item) => (
                                <tr key={item._id}>
                                  <td>
                                    <div className="admin-product-cell">
                                      {item.images?.[0] ? (
                                        <img src={item.images[0]} alt="" />
                                      ) : (
                                        <div className="admin-product-placeholder">
                                          <Leaf size={18} />
                                        </div>
                                      )}
                                      <div>
                                        <strong>{item.name}</strong>
                                        <span>{item.district}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td>{item.farmerId?.fullName || "—"}</td>
                                  <td>{item.category}</td>
                                  <td>
                                    {formatMoney(item.pricePerUnit)} /{" "}
                                    {item.unit}
                                  </td>
                                  <td>
                                    {item.quantity ?? 0} {item.unit}
                                  </td>
                                  <td>
                                    <StatusPill
                                      tone={
                                        item.isAvailable ? "green" : "neutral"
                                      }
                                    >
                                      {item.isAvailable ? "Visible" : "Hidden"}
                                    </StatusPill>
                                  </td>
                                  <td className="admin-align-right">
                                    <button
                                      className={`admin-btn ${item.isAvailable ? "admin-btn--danger-soft" : "admin-btn--primary"}`}
                                      onClick={() => toggleProduct(item)}
                                    >
                                      {item.isAvailable ? (
                                        <XCircle size={16} />
                                      ) : (
                                        <CheckCircle2 size={16} />
                                      )}
                                      {item.isAvailable ? "Hide" : "Show"}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <EmptyState
                          title="No products found"
                          description="No marketplace products match this search."
                        />
                      )}
                    </div>
                  )}

                  {activeSection === "orders" && (
                    <div className="admin-table-card">
                      {filteredOrders.length ? (
                        <div className="admin-table-wrap">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Order</th>
                                <th>Buyer</th>
                                <th>Farmer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredOrders.map((item) => (
                                <tr key={item._id}>
                                  <td>
                                    <strong>
                                      #
                                      {String(item._id).slice(-8).toUpperCase()}
                                    </strong>
                                  </td>
                                  <td>{item.buyerId?.fullName || "—"}</td>
                                  <td>{item.farmerId?.fullName || "—"}</td>
                                  <td>{item.items?.length || 0}</td>
                                  <td>
                                    <strong>
                                      {formatMoney(item.totalAmount)}
                                    </strong>
                                  </td>
                                  <td>
                                    <StatusPill
                                      tone={
                                        item.status === "delivered"
                                          ? "green"
                                          : item.status === "cancelled"
                                            ? "red"
                                            : item.status === "pending"
                                              ? "amber"
                                              : "blue"
                                      }
                                    >
                                      {item.status}
                                    </StatusPill>
                                  </td>
                                  <td>{formatDate(item.createdAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <EmptyState
                          title="No orders found"
                          description="No orders match this search yet."
                        />
                      )}
                    </div>
                  )}

                  {activeSection === "categories" && (
                    <div className="admin-category-layout">
                      <form
                        className="admin-panel admin-category-form"
                        onSubmit={submitCategory}
                      >
                        <div className="admin-panel__heading">
                          <div>
                            <span>{editingCategoryId ? "EDIT" : "NEW"}</span>
                            <h3>
                              {editingCategoryId
                                ? "Update category"
                                : "Add category"}
                            </h3>
                          </div>
                          <Tags size={20} />
                        </div>
                        <label>
                          <span>Category name</span>
                          <select
                            value={categoryForm.name}
                            onChange={(event) =>
                              setCategoryForm((current) => ({
                                ...current,
                                name: event.target.value,
                              }))
                            }
                          >
                            <option value="">Select a category</option>
                            {CATEGORY_OPTIONS.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span>Icon</span>
                          <input
                            value={categoryForm.icon}
                            maxLength={8}
                            onChange={(event) =>
                              setCategoryForm((current) => ({
                                ...current,
                                icon: event.target.value,
                              }))
                            }
                            placeholder="🌾"
                          />
                        </label>
                        <label>
                          <span>Description</span>
                          <textarea
                            value={categoryForm.description}
                            maxLength={200}
                            onChange={(event) =>
                              setCategoryForm((current) => ({
                                ...current,
                                description: event.target.value,
                              }))
                            }
                            placeholder="Short description for this product category"
                          />
                        </label>
                        <div className="admin-form-actions">
                          <button
                            type="submit"
                            className="admin-btn admin-btn--primary"
                            disabled={savingCategory}
                          >
                            {editingCategoryId ? (
                              <Pencil size={16} />
                            ) : (
                              <Plus size={16} />
                            )}
                            {savingCategory
                              ? "Saving..."
                              : editingCategoryId
                                ? "Save changes"
                                : "Add category"}
                          </button>
                          {editingCategoryId && (
                            <button
                              type="button"
                              className="admin-btn admin-btn--secondary"
                              onClick={resetCategoryForm}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>

                      <div className="admin-panel">
                        <div className="admin-panel__heading">
                          <div>
                            <span>ACTIVE</span>
                            <h3>Current categories</h3>
                          </div>
                          <span className="admin-count-badge">
                            {filteredCategories.length}
                          </span>
                        </div>
                        <label className="admin-search admin-search--full">
                          <Search size={18} />
                          <input
                            value={searchTerm}
                            onChange={(event) =>
                              setSearchTerm(event.target.value)
                            }
                            placeholder="Search categories..."
                          />
                        </label>
                        <div className="admin-category-list">
                          {filteredCategories.length ? (
                            filteredCategories.map((item) => (
                              <div
                                className="admin-category-row"
                                key={item._id}
                              >
                                <div className="admin-category-row__icon">
                                  {item.icon || "🌾"}
                                </div>
                                <div className="admin-category-row__body">
                                  <strong>{item.name}</strong>
                                  <span>
                                    {item.description || "No description added"}
                                  </span>
                                </div>
                                <div className="admin-category-row__actions">
                                  <button
                                    onClick={() => editCategory(item)}
                                    title="Edit"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    onClick={() => removeCategory(item)}
                                    title="Delete"
                                    className="danger"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <EmptyState
                              title="No categories found"
                              description="Add a category using the form."
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === "reviews" && (
                    <>
                      <div className="admin-review-summary">
                        <article>
                          <span>Demo reviews</span>
                          <strong>{reviewStats.total}</strong>
                          <small>Mock records for the current demo</small>
                        </article>
                        <article>
                          <span>Average rating</span>
                          <strong>
                            {reviewStats.average.toFixed(1)}{" "}
                            <Star size={20} fill="currentColor" />
                          </strong>
                          <small>Calculated from demo records</small>
                        </article>
                        <article className="admin-rating-distribution">
                          <span>Rating distribution</span>
                          <div>
                            {reviewStats.distribution.map((item) => (
                              <div key={item.rating}>
                                <label>{item.rating}★</label>
                                <div className="admin-rating-bar">
                                  <i
                                    className={ratingWidthClass(
                                      item.count,
                                      reviewStats.total,
                                    )}
                                  />
                                </div>
                                <b>{item.count}</b>
                              </div>
                            ))}
                          </div>
                        </article>
                      </div>

                      <div className="admin-table-card">
                        {filteredReviews.length ? (
                          <div className="admin-table-wrap">
                            <table className="admin-table">
                              <thead>
                                <tr>
                                  <th>Buyer</th>
                                  <th>Farmer</th>
                                  <th>Rating</th>
                                  <th>Review</th>
                                  <th>Date</th>
                                  <th className="admin-align-right">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredReviews.map((item) => (
                                  <tr key={item.id}>
                                    <td>
                                      <div className="admin-user-cell">
                                        <div className="admin-avatar admin-avatar--small">
                                          {initials(item.buyerName)}
                                        </div>
                                        <strong>{item.buyerName}</strong>
                                      </div>
                                    </td>
                                    <td>{item.farmerName}</td>
                                    <td>
                                      <Stars rating={item.rating} />
                                    </td>
                                    <td className="admin-review-comment">
                                      {item.comment}
                                    </td>
                                    <td>{formatDate(item.date)}</td>
                                    <td className="admin-align-right">
                                      <button
                                        className="admin-icon-btn admin-icon-btn--danger"
                                        onClick={() => removeMockReview(item)}
                                        title="Remove demo review"
                                      >
                                        <Trash2 size={17} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <EmptyState
                            title="No demo reviews found"
                            description="No reviews match your search."
                          />
                        )}
                      </div>
                    </>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
