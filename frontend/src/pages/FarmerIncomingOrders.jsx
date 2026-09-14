import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  UserRound,
  X,
} from "lucide-react";

import Logo from "../components/Logo";
import { useApp } from "../context/FarmerContext";
import { getFarmerOrders, updateOrderStatus } from "../services/orderService";

const STATUS_TABS = [
  "all",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const ACTIVE_STATUSES = ["pending", "confirmed", "processing", "shipped"];

const STATUS_FLOW = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

const NEXT_STATUS = {
  pending: { status: "confirmed", label: "Confirm Order" },
  confirmed: { status: "processing", label: "Start Processing" },
  processing: { status: "shipped", label: "Mark as Shipped" },
  shipped: { status: "delivered", label: "Mark Delivered" },
};

const FILTER_LABELS = {
  all: "All Orders",
  pending: "Pending Orders",
  active: "Active Orders",
  shipped: "Ready to Deliver",
  confirmed: "Confirmed Orders",
  processing: "Processing Orders",
  delivered: "Delivered Orders",
  cancelled: "Cancelled Orders",
};

const formatCurrency = (amount) =>
  `LKR ${Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDisplayOrderNumber = (order) => {
  if (!order?._id) return "ORD-PENDING";

  const year = order.createdAt
    ? new Date(order.createdAt).getFullYear()
    : new Date().getFullYear();

  return `ORD-${year}-${order._id.slice(-6).toUpperCase()}`;
};

const getStatusStyles = (status) => {
  const styles = {
    pending: {
      backgroundColor: "#f5e6c8",
      color: "#9b6418",
      borderColor: "#ead09b",
    },
    confirmed: {
      backgroundColor: "#e9efe6",
      color: "#31593f",
      borderColor: "#cadbc5",
    },
    processing: {
      backgroundColor: "#e8edf4",
      color: "#46627f",
      borderColor: "#ced8e4",
    },
    shipped: {
      backgroundColor: "#e3efe9",
      color: "#2f6b50",
      borderColor: "#c6ddd1",
    },
    delivered: {
      backgroundColor: "#dcebdd",
      color: "#2c6540",
      borderColor: "#bdd7c0",
    },
    cancelled: {
      backgroundColor: "#f2dfda",
      color: "#9d4b39",
      borderColor: "#e3beb5",
    },
  };

  return styles[status] || styles.pending;
};

function HamburgerIcon({ open }) {
  return (
    <div className="flex h-4 w-5 flex-col justify-between">
      <motion.span
        className="block h-0.5 origin-left rounded-full"
        style={{ backgroundColor: "currentColor" }}
        animate={open ? { rotate: 45, y: -1 } : { rotate: 0, y: 0 }}
      />
      <motion.span
        className="block h-0.5 rounded-full"
        style={{ backgroundColor: "currentColor" }}
        animate={open ? { opacity: 0, x: 8 } : { opacity: 1, x: 0 }}
      />
      <motion.span
        className="block h-0.5 origin-left rounded-full"
        style={{ backgroundColor: "currentColor" }}
        animate={open ? { rotate: -45, y: 1 } : { rotate: 0, y: 0 }}
      />
    </div>
  );
}

export default function FarmerIncomingOrders() {
  const navigate = useNavigate();
  const { user, logout } = useApp();
  const orderSectionRef = useRef(null);

  const [orders, setOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusTarget, setStatusTarget] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let ignore = false;

    getFarmerOrders()
      .then((response) => {
        if (!ignore) {
          setOrders(Array.isArray(response.data) ? response.data : []);
          setErrorMessage("");
        }
      })
      .catch((error) => {
        if (!ignore) {
          setOrders([]);
          setErrorMessage(
            error.response?.data?.message || "Unable to load incoming orders.",
          );
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setStatusTarget(null);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await getFarmerOrders();
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to load incoming orders.",
      );
    } finally {
      setLoading(false);
    }
  };

  const statistics = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => order.status === "pending").length,
      active: orders.filter((order) => ACTIVE_STATUSES.includes(order.status))
        .length,
      readyToDeliver: orders.filter((order) => order.status === "shipped")
        .length,
    }),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      let matchesFilter = true;

      if (selectedFilter === "active") {
        matchesFilter = ACTIVE_STATUSES.includes(order.status);
      } else if (selectedFilter !== "all") {
        matchesFilter = order.status === selectedFilter;
      }

      if (!matchesFilter) return false;
      if (!search) return true;

      const orderNumber = getDisplayOrderNumber(order).toLowerCase();
      const buyerName = (
        order.buyerId?.fullName ||
        order.shippingAddress?.fullName ||
        ""
      ).toLowerCase();
      const phone = (order.shippingAddress?.phone || "").toLowerCase();
      const itemNames = Array.isArray(order.items)
        ? order.items
            .map((item) => String(item.productName || "").toLowerCase())
            .join(" ")
        : "";

      return (
        orderNumber.includes(search) ||
        buyerName.includes(search) ||
        phone.includes(search) ||
        itemNames.includes(search)
      );
    });
  }, [orders, selectedFilter, searchTerm]);

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    window.setTimeout(() => {
      orderSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  };

  const handleConfirmStatus = async () => {
    if (!statusTarget?.order?._id || !statusTarget?.nextStatus) return;

    try {
      setUpdatingStatus(true);
      setErrorMessage("");

      const response = await updateOrderStatus(
        statusTarget.order._id,
        statusTarget.nextStatus,
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === statusTarget.order._id ? response.data : order,
        ),
      );

      setStatusTarget(null);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to update order status.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statCards = [
    {
      id: "all",
      label: "Total Orders",
      value: statistics.total,
      note: "All incoming orders",
      icon: ShoppingBag,
    },
    {
      id: "pending",
      label: "Pending",
      value: statistics.pending,
      note: "Needs confirmation",
      icon: Clock3,
    },
    {
      id: "active",
      label: "Active Orders",
      value: statistics.active,
      note: "Currently in progress",
      icon: Package,
    },
    {
      id: "shipped",
      label: "Ready to Deliver",
      value: statistics.readyToDeliver,
      note: "Shipped orders",
      icon: Truck,
    },
  ];

  const drawerItems = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      action: () =>
        navigate("/farmer/dashboard", { state: { tab: "overview" } }),
    },
    {
      label: "My Products",
      icon: Package,
      action: () =>
        navigate("/farmer/dashboard", { state: { tab: "products" } }),
    },
    {
      label: "Orders",
      icon: ClipboardList,
      active: true,
      action: () => setMenuOpen(false),
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0ece0" }}>
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{
                backgroundColor: "rgba(5,12,7,0.55)",
                backdropFilter: "blur(5px)",
              }}
              onClick={() => setMenuOpen(false)}
            />

            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col overflow-hidden"
              style={{ backgroundColor: "#1a3326" }}
            >
              <div
                className="h-1 w-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #c98a2b, transparent)",
                }}
              />

              <div
                className="flex items-center justify-between border-b px-6 pb-4 pt-5"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                <Logo size="lg" />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition hover:text-white"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                >
                  <X size={15} />
                </button>
              </div>

              <div
                className="mx-4 mt-5 rounded-2xl p-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(201,138,43,0.18), rgba(201,138,43,0.06))",
                  border: "1px solid rgba(201,138,43,0.2)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 text-lg font-bold text-white"
                    style={{
                      borderColor: "rgba(201,138,43,0.5)",
                      backgroundColor: "#c98a2b",
                    }}
                  >
                    {user?.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase() || "F"
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">
                      {user?.name || "Farmer"}
                    </p>
                    <p
                      className="mt-0.5 text-[11px]"
                      style={{ color: "rgba(255,255,255,0.48)" }}
                    >
                      Verified Farmer
                    </p>
                    {user?.farmName && (
                      <p
                        className="mt-0.5 truncate text-[11px]"
                        style={{ color: "#d8ad5f" }}
                      >
                        {user.farmName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <nav className="mt-5 flex-1 space-y-1 px-3">
                <p
                  className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  Navigation
                </p>
                {drawerItems.map(({ label, icon: Icon, active, action }) => (
                  <motion.button
                    key={label}
                    type="button"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      action();
                      if (!active) setMenuOpen(false);
                    }}
                    className="relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-left"
                    style={{
                      backgroundColor: active
                        ? "rgba(201,138,43,0.15)"
                        : "transparent",
                    }}
                  >
                    {active && (
                      <div
                        className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full"
                        style={{ backgroundColor: "#c98a2b" }}
                      />
                    )}
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: active
                          ? "rgba(201,138,43,0.2)"
                          : "rgba(255,255,255,0.07)",
                      }}
                    >
                      <Icon
                        size={15}
                        style={{
                          color: active ? "#c98a2b" : "rgba(255,255,255,0.55)",
                        }}
                      />
                    </div>
                    <span
                      className="flex-1 text-sm font-semibold"
                      style={{
                        color: active ? "#e8c87a" : "rgba(255,255,255,0.75)",
                      }}
                    >
                      {label}
                    </span>
                    <ChevronRight
                      size={14}
                      style={{ color: "rgba(255,255,255,0.2)" }}
                    />
                  </motion.button>
                ))}
              </nav>

              <div
                className="border-t p-4"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
              >
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  <LogOut size={14} /> Log out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-30 flex items-center justify-between border-b px-5 py-2 md:px-8"
        style={{
          backgroundColor: "rgba(31,59,44,0.97)",
          backdropFilter: "blur(14px)",
          borderColor: "rgba(255,255,255,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        }}
      >
        <div className="flex items-center gap-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => setMenuOpen((value) => !value)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:text-white"
            style={{ backgroundColor: "rgba(255,255,255,0.09)" }}
          >
            <HamburgerIcon open={menuOpen} />
          </motion.button>
          <Logo size="dashboard" />
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => navigate("/farmer/dashboard")}
            className="text-xs transition hover:text-white"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Dashboard
          </button>
          <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.2)" }} />
          <span className="text-xs font-semibold" style={{ color: "#c98a2b" }}>
            Incoming Orders
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/60"
            style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
          >
            <Bell size={16} />
          </button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/farmer/add-product")}
            className="hidden items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white md:flex"
            style={{
              background: "linear-gradient(135deg, #c98a2b, #a86e1e)",
              boxShadow: "0 2px 12px rgba(201,138,43,0.35)",
            }}
          >
            <Plus size={13} /> Add Product
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            onClick={() => setMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 text-sm font-bold text-white"
            style={{
              borderColor: "rgba(201,138,43,0.5)",
              backgroundColor: "#c98a2b",
            }}
          >
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() || "F"
            )}
          </motion.button>
        </div>
      </motion.header>

      <section className="relative h-65 overflow-hidden md:h-75">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1577950535377-24fce6e4d85e?w=1800&fit=crop)",
            backgroundSize: "cover",
            backgroundPosition: "center 44%",
          }}
          initial={{ scale: 1.04 }}
          animate={{ scale: 1.11, x: "-1.5%" }}
          transition={{
            duration: 24,
            ease: "linear",
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(5,14,8,0.94) 0%, rgba(31,59,44,0.74) 50%, rgba(31,59,44,0.18) 100%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(201,138,43,0.65), transparent)",
          }}
        />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-5 md:px-8">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]"
            >
              <button
                type="button"
                onClick={() => navigate("/farmer/dashboard")}
                className="transition hover:text-white"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                Farmer Dashboard
              </button>
              <ChevronRight
                size={13}
                style={{ color: "rgba(255,255,255,0.35)" }}
              />
              <span style={{ color: "#c98a2b" }}>Incoming Orders</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="flex items-center gap-3"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: "rgba(201,138,43,0.18)",
                  color: "#e0aa49",
                }}
              >
                <ClipboardList size={23} />
              </div>
              <h1
                className="text-4xl font-black text-white md:text-5xl"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Incoming Orders
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="mt-3 max-w-2xl text-sm md:text-base"
              style={{ color: "rgba(255,255,255,0.62)" }}
            >
              Manage customer orders from confirmation to delivery, with live
              status updates from your real order data.
            </motion.p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <motion.section
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.07 } },
          }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {statCards.map(({ id, label, value, note, icon: Icon }) => {
            const active = selectedFilter === id;
            return (
              <motion.button
                key={id}
                type="button"
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  show: { opacity: 1, y: 0 },
                }}
                whileHover={{
                  y: -5,
                  boxShadow: "0 16px 40px rgba(31,59,44,0.14)",
                }}
                whileTap={{ scale: 0.985 }}
                onClick={() => handleFilterChange(id)}
                className="relative overflow-hidden rounded-2xl p-5 text-left transition"
                style={{
                  backgroundColor: active ? "#f7f0df" : "#fbf9f1",
                  border: active ? "1px solid #c98a2b" : "1px solid #ded5bd",
                  boxShadow: active
                    ? "0 10px 28px rgba(201,138,43,0.12)"
                    : "none",
                }}
              >
                <div
                  className="absolute -right-5 -top-5 h-24 w-24 rounded-full opacity-50"
                  style={{
                    background: "linear-gradient(135deg,#e9efe6,#d3e3cc)",
                  }}
                />
                <div className="relative z-10">
                  <div className="mb-3 flex items-start justify-between">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{
                        background: "linear-gradient(135deg,#e9efe6,#d3e3cc)",
                      }}
                    >
                      <Icon size={18} style={{ color: "#1f3b2c" }} />
                    </div>
                    {active && (
                      <span
                        className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: "#1f3b2c", color: "#fff" }}
                      >
                        Selected
                      </span>
                    )}
                  </div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: "#8a7f6a" }}
                  >
                    {label}
                  </p>
                  <p
                    className="mt-1 text-[28px] font-bold leading-none"
                    style={{
                      color: "#211d15",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {value}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p
                      className="text-xs font-medium"
                      style={{ color: "#1f3b2c" }}
                    >
                      {note}
                    </p>
                    <ChevronRight size={14} style={{ color: "#c98a2b" }} />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.section>

        <section ref={orderSectionRef} className="scroll-mt-24 pt-8">
          <div
            className="overflow-hidden rounded-2xl"
            style={{ backgroundColor: "#fbf9f1", border: "1px solid #ded5bd" }}
          >
            <div
              className="flex flex-col gap-4 border-b p-5 md:p-6 lg:flex-row lg:items-center lg:justify-between"
              style={{ borderColor: "#ded5bd" }}
            >
              <div>
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: "#c98a2b" }}
                >
                  Order Management
                </p>
                <h2
                  className="mt-1 text-xl font-bold md:text-2xl"
                  style={{ color: "#211d15", fontFamily: "Fraunces, serif" }}
                >
                  {FILTER_LABELS[selectedFilter] || "Incoming Orders"}
                </h2>
                <p className="mt-1 text-xs" style={{ color: "#8a7f6a" }}>
                  Showing {filteredOrders.length} of {orders.length} orders
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label
                  className="flex items-center gap-2 rounded-xl px-3.5 py-2.5"
                  style={{
                    backgroundColor: "#f5f1e6",
                    border: "1px solid #ded5bd",
                  }}
                >
                  <Search size={17} style={{ color: "#8a7f6a" }} />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search order, buyer or product..."
                    className="w-full min-w-0 bg-transparent text-sm outline-none sm:w-64"
                    style={{ color: "#211d15" }}
                  />
                </label>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
                  style={{ backgroundColor: "#1f3b2c", color: "#fff" }}
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh
                </motion.button>
              </div>
            </div>

            <div
              className="flex gap-2 overflow-x-auto border-b px-5 py-4 md:px-6"
              style={{ borderColor: "#ede8db" }}
            >
              {STATUS_TABS.map((status) => {
                const active = selectedFilter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleFilterChange(status)}
                    className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition"
                    style={{
                      backgroundColor: active ? "#1f3b2c" : "#f5f1e6",
                      color: active ? "#fff" : "#6a5f50",
                      border: active
                        ? "1px solid #1f3b2c"
                        : "1px solid #ded5bd",
                    }}
                  >
                    {status === "all"
                      ? "All"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                );
              })}
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="mx-5 mt-5 rounded-xl px-4 py-3 text-sm md:mx-6"
                style={{
                  backgroundColor: "#f2dfda",
                  color: "#8b3f31",
                  border: "1px solid #e3beb5",
                }}
              >
                {errorMessage}
              </div>
            )}

            <div className="p-5 md:p-6">
              {loading ? (
                <div className="flex min-h-56 flex-col items-center justify-center gap-3">
                  <RefreshCw
                    size={28}
                    className="animate-spin"
                    style={{ color: "#1f3b2c" }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#8a7f6a" }}
                  >
                    Loading incoming orders...
                  </span>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: "#e9efe6", color: "#1f3b2c" }}
                  >
                    <Package size={28} />
                  </div>
                  <h3
                    className="text-xl font-bold"
                    style={{ color: "#211d15", fontFamily: "Fraunces, serif" }}
                  >
                    No matching orders
                  </h3>
                  <p
                    className="mt-2 max-w-md text-sm"
                    style={{ color: "#8a7f6a" }}
                  >
                    Try another status card or search term. New customer orders
                    will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {filteredOrders.map((order) => {
                      const buyerName =
                        order.buyerId?.fullName ||
                        order.shippingAddress?.fullName ||
                        "Customer";
                      const nextAction = NEXT_STATUS[order.status];
                      const currentIndex = STATUS_FLOW.indexOf(order.status);
                      const statusStyle = getStatusStyles(order.status);

                      return (
                        <motion.article
                          layout
                          key={order._id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          whileHover={{
                            boxShadow: "0 14px 34px rgba(31,59,44,0.10)",
                          }}
                          className="overflow-hidden rounded-2xl"
                          style={{
                            backgroundColor: "#fffdf8",
                            border: "1px solid #ded5bd",
                          }}
                        >
                          <div
                            className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                            style={{ borderColor: "#ede8db" }}
                          >
                            <div>
                              <p
                                className="text-[10px] font-bold uppercase tracking-widest"
                                style={{ color: "#9a9080" }}
                              >
                                Order
                              </p>
                              <h3
                                className="mt-1 text-base font-bold"
                                style={{
                                  color: "#211d15",
                                  fontFamily: "JetBrains Mono, monospace",
                                }}
                              >
                                #{getDisplayOrderNumber(order)}
                              </h3>
                              <p
                                className="mt-1 flex items-center gap-1.5 text-xs"
                                style={{ color: "#8a7f6a" }}
                              >
                                <Clock3 size={13} />
                                {formatDate(order.createdAt)} ·{" "}
                                {formatTime(order.createdAt)}
                              </p>
                            </div>

                            <span
                              className="w-fit rounded-full border px-3 py-1.5 text-xs font-bold capitalize"
                              style={statusStyle}
                            >
                              {order.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-[1fr_1.55fr_0.7fr] lg:p-6">
                            <section>
                              <p
                                className="mb-3 text-[10px] font-bold uppercase tracking-widest"
                                style={{ color: "#9a9080" }}
                              >
                                Customer
                              </p>
                              <div className="flex items-center gap-3">
                                <div
                                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                                  style={{
                                    backgroundColor: "#e9efe6",
                                    color: "#1f3b2c",
                                  }}
                                >
                                  <UserRound size={19} />
                                </div>
                                <div className="min-w-0">
                                  <p
                                    className="truncate text-sm font-bold"
                                    style={{ color: "#211d15" }}
                                  >
                                    {buyerName}
                                  </p>
                                  <p
                                    className="mt-1 flex items-center gap-1.5 text-xs"
                                    style={{ color: "#8a7f6a" }}
                                  >
                                    <Phone size={12} />
                                    {order.shippingAddress?.phone ||
                                      "Phone unavailable"}
                                  </p>
                                </div>
                              </div>

                              <div
                                className="mt-4 flex gap-2 rounded-xl p-3"
                                style={{
                                  backgroundColor: "#f5f1e6",
                                  color: "#6a5f50",
                                }}
                              >
                                <MapPin size={15} className="mt-0.5 shrink-0" />
                                <p className="text-xs leading-relaxed">
                                  {order.shippingAddress?.address ||
                                    "Address unavailable"}
                                  {order.shippingAddress?.district
                                    ? `, ${order.shippingAddress.district}`
                                    : ""}
                                </p>
                              </div>
                            </section>

                            <section>
                              <p
                                className="mb-3 text-[10px] font-bold uppercase tracking-widest"
                                style={{ color: "#9a9080" }}
                              >
                                Order Items
                              </p>
                              <div className="space-y-2.5">
                                {order.items?.map((item, index) => (
                                  <div
                                    key={item.productId || index}
                                    className="flex items-center gap-3 rounded-xl p-3"
                                    style={{
                                      backgroundColor: "#f8f5ec",
                                      border: "1px solid #ede8db",
                                    }}
                                  >
                                    <div
                                      className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                                      style={{
                                        backgroundColor: "#e9efe6",
                                        color: "#1f3b2c",
                                      }}
                                    >
                                      {item.image ? (
                                        <img
                                          src={item.image}
                                          alt={item.productName}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <Package size={19} />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p
                                        className="truncate text-sm font-semibold"
                                        style={{ color: "#211d15" }}
                                      >
                                        {item.productName}
                                      </p>
                                      <p
                                        className="mt-0.5 text-xs"
                                        style={{ color: "#8a7f6a" }}
                                      >
                                        {item.quantity} {item.unit} ×{" "}
                                        {formatCurrency(item.pricePerUnit)}
                                      </p>
                                    </div>
                                    <p
                                      className="text-xs font-bold sm:text-sm"
                                      style={{
                                        color: "#1f3b2c",
                                        fontFamily: "JetBrains Mono, monospace",
                                      }}
                                    >
                                      {formatCurrency(item.subtotal)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </section>

                            <section className="lg:text-right">
                              <p
                                className="mb-3 text-[10px] font-bold uppercase tracking-widest"
                                style={{ color: "#9a9080" }}
                              >
                                Order Total
                              </p>
                              <p
                                className="text-xl font-bold"
                                style={{
                                  color: "#1f3b2c",
                                  fontFamily: "JetBrains Mono, monospace",
                                }}
                              >
                                {formatCurrency(order.totalAmount)}
                              </p>
                              <span
                                className="mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold"
                                style={{
                                  backgroundColor: "#f5e6c8",
                                  color: "#8e5d17",
                                }}
                              >
                                Cash on Delivery
                              </span>
                            </section>
                          </div>

                          {order.status !== "cancelled" && (
                            <div
                              className="border-t px-5 py-4 lg:px-6"
                              style={{ borderColor: "#ede8db" }}
                            >
                              <div className="grid grid-cols-5 gap-1">
                                {STATUS_FLOW.map((status, index) => {
                                  const complete = index <= currentIndex;
                                  return (
                                    <div
                                      key={status}
                                      className="relative flex flex-col items-center text-center"
                                    >
                                      {index > 0 && (
                                        <div
                                          className="absolute right-1/2 top-3 h-0.5 w-full"
                                          style={{
                                            backgroundColor:
                                              index <= currentIndex
                                                ? "#4a7c59"
                                                : "#ded5bd",
                                          }}
                                        />
                                      )}
                                      <div
                                        className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold"
                                        style={{
                                          backgroundColor: complete
                                            ? "#1f3b2c"
                                            : "#fbf9f1",
                                          color: complete ? "#fff" : "#9a9080",
                                          borderColor: complete
                                            ? "#1f3b2c"
                                            : "#ded5bd",
                                        }}
                                      >
                                        {complete ? "✓" : ""}
                                      </div>
                                      <span
                                        className="mt-2 text-[9px] font-semibold capitalize sm:text-[10px]"
                                        style={{
                                          color: complete
                                            ? "#1f3b2c"
                                            : "#9a9080",
                                        }}
                                      >
                                        {status}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div
                            className="flex justify-end border-t px-5 py-4 lg:px-6"
                            style={{
                              backgroundColor: "#faf7ef",
                              borderColor: "#ede8db",
                            }}
                          >
                            {nextAction ? (
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                  setStatusTarget({
                                    order,
                                    nextStatus: nextAction.status,
                                    label: nextAction.label,
                                  })
                                }
                                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #1f3b2c, #315b43)",
                                  boxShadow: "0 4px 14px rgba(31,59,44,0.22)",
                                }}
                              >
                                {order.status === "processing" ? (
                                  <Truck size={17} />
                                ) : (
                                  <CheckCircle2 size={17} />
                                )}
                                {nextAction.label}
                              </motion.button>
                            ) : (
                              <div
                                className="flex items-center gap-2 text-sm font-semibold"
                                style={{ color: "#4a7c59" }}
                              >
                                <CheckCircle2 size={17} />
                                {order.status === "delivered"
                                  ? "Order completed"
                                  : "No further action"}
                              </div>
                            )}
                          </div>
                        </motion.article>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {statusTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-70 flex items-center justify-center p-4"
            style={{
              backgroundColor: "rgba(5,12,7,0.58)",
              backdropFilter: "blur(6px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-md rounded-3xl p-6"
              style={{
                backgroundColor: "#fbf9f1",
                border: "1px solid #ded5bd",
              }}
            >
              <button
                type="button"
                onClick={() => setStatusTarget(null)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: "#f0ece0", color: "#6a5f50" }}
              >
                <X size={17} />
              </button>

              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "#e9efe6", color: "#1f3b2c" }}
              >
                <Truck size={24} />
              </div>

              <h2
                className="text-2xl font-bold"
                style={{ color: "#211d15", fontFamily: "Fraunces, serif" }}
              >
                {statusTarget.label}?
              </h2>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: "#6a5f50" }}
              >
                Update{" "}
                <strong>#{getDisplayOrderNumber(statusTarget.order)}</strong> to{" "}
                <strong>{statusTarget.nextStatus}</strong>?
              </p>
              <p className="mt-2 text-xs" style={{ color: "#9a9080" }}>
                The buyer will see this update in their order tracking timeline.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStatusTarget(null)}
                  disabled={updatingStatus}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
                  style={{ backgroundColor: "#f0ece0", color: "#6a5f50" }}
                >
                  Not Now
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStatus}
                  disabled={updatingStatus}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: "#1f3b2c" }}
                >
                  {updatingStatus ? "Updating..." : statusTarget.label}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
