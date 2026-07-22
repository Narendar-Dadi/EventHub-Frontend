import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  Calendar,
  FileText,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Shield,
  Star,
  Sun,
  Ticket,
  Users
} from "lucide-react";
import { api, setToken, getToken, getStoredUser, storeUser } from "./api/client";
import Toast from "./components/Toast";
import AuthModal from "./components/AuthModal";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import { FALLBACK_EVENTS } from "./constants";
import HomeView from "./views/HomeView";
import EventsDirectory from "./views/EventsDirectory";
import EventDetail from "./views/EventDetail";
import PaymentView from "./views/PaymentView";
import TicketView from "./views/TicketView";
import DashboardView from "./views/DashboardView";
import StudentDashboardView from "./views/StudentDashboardView";
import AdminDashboardView from "./views/AdminDashboardView";
import OrganizerRegisterView from "./views/OrganizerRegisterView";
import CreateEventView from "./views/CreateEventView";
import PaymentSettingsView from "./views/PaymentSettingsView";
import TransactionsView from "./views/TransactionsView";
import QRScannerView from "./views/QRScannerView";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [route, setRoute] = useState({ path: "home", params: null });
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);          // lifted from StudentDashboard
  const [transactions, setTransactions] = useState([]);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [authModal, setAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [dbOnline, setDbOnline] = useState(true);
  const [savingEvent, setSavingEvent] = useState(false);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const refreshEvents = useCallback(async () => {
    try {
      const data = await api.getEvents();
      setEvents(data);
      setDbOnline(true);
    } catch {
      setEvents(FALLBACK_EVENTS);
      setDbOnline(false);
      showToast("Database offline — showing cached demo events", "error");
    }
  }, [showToast]);

  const refreshTransactions = useCallback(async () => {
    if (!getToken()) { setTransactions([]); return; }
    try {
      const data = await api.getTransactions();
      setTransactions(data);
    } catch { setTransactions([]); }
  }, []);

  // ── Refresh student tickets (called on mount + after registration) ──
  const refreshTickets = useCallback(async () => {
    if (!getToken()) { setTickets([]); return; }
    try {
      const data = await api.getMyTickets();
      setTickets(data.tickets || []);
    } catch { setTickets([]); }
  }, []);

  const refreshPaymentConfig = useCallback(async () => {
    try {
      const data = await api.getPaymentConfig();
      setPaymentConfig(data);
    } catch {
      setPaymentConfig({ configured: false, currency: "INR", platformFee: 20 });
    }
  }, []);

  // ── Session restore: localStorage first, then /me for authoritative role ──
  useEffect(() => {
    async function restoreSession() {
      const token = getToken();
      if (!token) { setSessionLoading(false); return; }

      const storedUser = getStoredUser();
      if (storedUser) setUser(storedUser); // instant paint

      try {
        const { user: me } = await api.getMe();
        setUser(me);
        storeUser(me);
      } catch {
        setToken(null);
        storeUser(null);
        setUser(null);
      } finally {
        setSessionLoading(false);
      }
    }
    restoreSession();
  }, []);

  useEffect(() => { refreshEvents(); refreshPaymentConfig(); }, [refreshEvents, refreshPaymentConfig]);

  useEffect(() => {
    if (user?.role === "admin") refreshTransactions();
    else setTransactions([]);
  }, [user, refreshTransactions]);

  // Fetch tickets whenever user changes (login/logout/restore)
  useEffect(() => {
    if (user?.role === "student") refreshTickets();
    else setTickets([]);
  }, [user, refreshTickets]);

  const navigate = (path, params = null) => {
    setRoute({ path, params });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Role-based redirect after login ─────────────────────
  function redirectByRole(role) {
    if (role === "admin") navigate("admin-dashboard");
    else if (role === "organizer") navigate("dashboard");
    else navigate("student-dashboard");
  }

  const handleLogin = async (credentials) => {
    setAuthLoading(true);
    try {
      const data = await api.login(credentials);
      setToken(data.token);
      storeUser(data.user);
      setUser(data.user);
      setAuthModal(false);
      showToast(`Welcome back, ${data.user.name}! 👋`, "success");
      if (data.user.role === "admin") await refreshTransactions();
      redirectByRole(data.user.role);
    } catch (err) {
      throw err; // bubble to AuthModal for status handling
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (form) => {
    setAuthLoading(true);
    try {
      const data = await api.register(form);
      setToken(data.token);
      storeUser(data.user);
      setUser(data.user);
      setAuthModal(false);
      showToast("Student account created! Welcome to EventHub 🎉", "success");
      redirectByRole(data.user.role);
    } catch (err) {
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    storeUser(null);
    setUser(null);
    setTransactions([]);
    navigate("home");
    showToast("Logged out successfully");
  };

  const handleCreateEvent = async (newEvent) => {
    if (!user || (user.role !== "admin" && user.role !== "organizer")) {
      showToast("Only organizers and admins can create events", "error");
      return;
    }
    setSavingEvent(true);
    try {
      await api.createEvent(newEvent);
      await refreshEvents();
      showToast("Event created successfully!", "success");
      navigate("dashboard");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingEvent(false);
    }
  };

  const handleRegisterEvent = (event) => {
    if (!user) {
      setAuthModal(true);
      showToast("Please login to register for events", "error");
      return;
    }
    navigate("payment", { event });
  };

  const handleTicketSuccess = async (ticket) => {
    // 1. Immediately prepend new ticket to state — dashboard sees it instantly
    setTickets((prev) => [ticket, ...prev]);
    // 2. Also fetch from API to get the full Ticket document (with all fields)
    refreshTickets();
    // 3. Refresh event counts + transactions
    await refreshEvents();
    if (user?.role === "admin") await refreshTransactions();
    // 4. Show ticket page first, then student-dashboard is already up to date
    navigate("ticket", { ticket });
  };

  // ── Route rendering ──────────────────────────────────────
  const renderView = () => {
    switch (route.path) {
      case "home":
        return <HomeView navigate={navigate} events={events} />;

      case "events":
        return <EventsDirectory navigate={navigate} events={events} />;

      case "event-detail":
        return <EventDetail navigate={navigate} event={route.params} onRegister={handleRegisterEvent} />;

      case "register-organizer":
        return <OrganizerRegisterView navigate={navigate} />;

      case "payment":
        return (
          <RoleProtectedRoute user={user} allowedRoles={[]} navigate={navigate} requireAuth>
            <PaymentView
              event={route.params.event}
              user={user}
              paymentConfig={paymentConfig}
              onSuccess={handleTicketSuccess}
              onCancel={() => navigate("event-detail", route.params.event)}
              showToast={showToast}
            />
          </RoleProtectedRoute>
        );

      case "ticket":
        return <TicketView ticket={route.params.ticket} navigate={navigate} user={user} />;

      // Student dashboard
      case "student-dashboard":
        return (
          <RoleProtectedRoute user={user} allowedRoles={["student"]} navigate={navigate}>
            <StudentDashboardView
              user={user}
              events={events}
              tickets={tickets}
              navigate={navigate}
              refreshTickets={refreshTickets}
            />
          </RoleProtectedRoute>
        );

      // Organizer dashboard (organizer + admin)
      case "dashboard":
        return (
          <RoleProtectedRoute user={user} allowedRoles={["organizer", "admin"]} navigate={navigate}>
            <DashboardView
              user={user}
              events={events}
              navigate={navigate}
              transactions={transactions}
              onEventsRefresh={refreshEvents}
              showToast={showToast}
            />
          </RoleProtectedRoute>
        );

      // Admin dashboard
      case "admin-dashboard":
        return (
          <RoleProtectedRoute user={user} allowedRoles={["admin"]} navigate={navigate}>
            <AdminDashboardView
              user={user}
              events={events}
              navigate={navigate}
              transactions={transactions}
              showToast={showToast}
            />
          </RoleProtectedRoute>
        );

      case "qr-scanner":
        return (
          <RoleProtectedRoute user={user} allowedRoles={["admin", "organizer"]} navigate={navigate}>
            <QRScannerView user={user} navigate={navigate} />
          </RoleProtectedRoute>
        );

      case "create-event":
        return (
          <RoleProtectedRoute user={user} allowedRoles={["organizer", "admin"]} navigate={navigate}>
            <CreateEventView navigate={navigate} onSave={handleCreateEvent} organizer={user?.name} saving={savingEvent} />
          </RoleProtectedRoute>
        );

      case "settings":
        return (
          <RoleProtectedRoute user={user} allowedRoles={["admin"]} navigate={navigate}>
            <PaymentSettingsView navigate={navigate} user={user} showToast={showToast} />
          </RoleProtectedRoute>
        );

      case "transactions":
        return (
          <RoleProtectedRoute user={user} allowedRoles={["admin"]} navigate={navigate}>
            <TransactionsView navigate={navigate} transactions={transactions} user={user} />
          </RoleProtectedRoute>
        );

      default:
        return <HomeView navigate={navigate} events={events} />;
    }
  };

  // ── Role-based nav links ─────────────────────────────────
  const renderNavLinks = () => {
    if (!user) return (
      <>
        <button onClick={() => navigate("home")} className="font-medium hover:text-blue-500 transition-colors">Home</button>
        <button onClick={() => navigate("events")} className="font-medium hover:text-blue-500 transition-colors">Events</button>
        <button onClick={() => navigate("register-organizer")}
          className="font-medium hover:text-purple-600 transition-colors flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
          <Briefcase size={14} /> Become Organizer
        </button>
      </>
    );

    if (user.role === "student") return (
      <>
        <button onClick={() => navigate("home")} className="font-medium hover:text-blue-500 transition-colors">Home</button>
        <button onClick={() => navigate("events")} className="font-medium hover:text-blue-500 transition-colors">Events</button>
        <button onClick={() => navigate("student-dashboard")} className="font-medium hover:text-blue-500 transition-colors flex items-center gap-1.5">
          <Ticket size={14} /> My Registrations
        </button>
      </>
    );

    if (user.role === "organizer") return (
      <>
        <button onClick={() => navigate("home")} className="font-medium hover:text-blue-500 transition-colors">Home</button>
        <button onClick={() => navigate("dashboard")} className="font-medium hover:text-blue-500 transition-colors flex items-center gap-1.5">
          <LayoutDashboard size={14} /> Dashboard
        </button>
        <button onClick={() => navigate("create-event")} className="font-medium hover:text-blue-500 transition-colors flex items-center gap-1.5">
          <Calendar size={14} /> Create Event
        </button>
        <button onClick={() => navigate("events")} className="font-medium hover:text-blue-500 transition-colors">Events</button>
      </>
    );

    if (user.role === "admin") return (
      <>
        <button onClick={() => navigate("home")} className="font-medium hover:text-blue-500 transition-colors">Home</button>
        <button onClick={() => navigate("admin-dashboard")} className="font-medium hover:text-blue-500 transition-colors flex items-center gap-1.5">
          <Shield size={14} /> Admin
        </button>
        <button onClick={() => navigate("dashboard")} className="font-medium hover:text-blue-500 transition-colors flex items-center gap-1.5">
          <LayoutDashboard size={14} /> Events
        </button>
        <button onClick={() => navigate("transactions")} className="font-medium hover:text-blue-500 transition-colors flex items-center gap-1.5">
          <FileText size={14} /> Transactions
        </button>
        <button onClick={() => navigate("settings")} className="font-medium hover:text-blue-500 transition-colors flex items-center gap-1.5">
          <Settings size={14} /> Settings
        </button>
      </>
    );
    return null;
  };

  // ── Role badge ───────────────────────────────────────────
  const roleBadge = () => {
    if (!user) return null;
    const cfg = {
      admin:     { icon: Shield,    cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
      organizer: { icon: Briefcase, cls: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" },
      student:   { icon: Users,     cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" }
    }[user.role] || { icon: Users, cls: "bg-blue-100 text-blue-700" };
    const Icon = cfg.icon;
    return (
      <button className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm ${cfg.cls}`}>
        <Icon size={15} /> {user.name}
      </button>
    );
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className={`no-print fixed w-full z-40 top-0 backdrop-blur-md border-b ${
        darkMode ? "border-slate-800 bg-slate-950/80" : "border-slate-200 bg-white/80"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("home")}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                Event<span className="text-blue-600">Hub</span>
              </span>
            </div>

            {/* Nav links */}
            <div className="hidden md:flex items-center space-x-5">
              {renderNavLinks()}
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
              {!dbOnline && (
                <span className="hidden sm:inline text-xs text-amber-600 dark:text-amber-400 font-medium">DB offline</span>
              )}
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {user ? (
                <div className="relative group">
                  {roleBadge()}
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                        user.role === "admin" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                        user.role === "organizer" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}>{user.role}</span>
                    </div>

                    {user.role === "student" && (
                      <>
                        <button onClick={() => navigate("student-dashboard")} className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"><Ticket size={15} /> My Registrations</button>
                        <button onClick={() => navigate("events")} className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"><Calendar size={15} /> Browse Events</button>
                      </>
                    )}

                    {user.role === "organizer" && (
                      <>
                        <button onClick={() => navigate("dashboard")} className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"><LayoutDashboard size={15} /> Dashboard</button>
                        <button onClick={() => navigate("create-event")} className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"><Calendar size={15} /> Create Event</button>
                      </>
                    )}

                    {user.role === "admin" && (
                      <>
                        <button onClick={() => navigate("admin-dashboard")} className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"><Shield size={15} /> Admin Dashboard</button>
                        <button onClick={() => navigate("dashboard")} className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"><LayoutDashboard size={15} /> Organizer View</button>
                        <button onClick={() => navigate("transactions")} className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"><FileText size={15} /> Transactions</button>
                        <button onClick={() => navigate("settings")} className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"><Settings size={15} /> Payment Settings</button>
                        <button onClick={() => navigate("create-event")} className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"><Calendar size={15} /> Create Event</button>
                      </>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 flex items-center gap-2 text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAuthModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium text-sm">
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main ────────────────────────────────────────────── */}
      <main className="pt-16 min-h-[calc(100vh-4rem)]">
        <AnimatePresence mode="wait">
          <motion.div key={route.path}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Auth Modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {authModal && (
          <AuthModal
            darkMode={darkMode}
            onClose={() => setAuthModal(false)}
            onLogin={handleLogin}
            onRegister={handleRegister}
            loading={authLoading}
            onNavigate={navigate}
          />
        )}
      </AnimatePresence>

      {/* ── Toasts ──────────────────────────────────────────── */}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <Toast message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
