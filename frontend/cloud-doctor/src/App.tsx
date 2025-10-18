import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MainPage from "./components/MainPage";
import Guide from "./components/Guide";
import { AdminPage } from "./components/Admin";
import Checklist from "./components/Checklist";
import Prowler from "./components/Prowler";
import Login from "./components/Login";
import MyPage from "./components/MyPage";
import AuditCheck from "./components/AuditCheck";

function AppContent() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const location = useLocation();
  const isMainPage = location.pathname === "/";

  return (
    <div
      className={isMainPage ? "" : "min-h-screen bg-background flex flex-col"}
    >
      {!isMainPage && <Header />}

      <main className={isMainPage ? "" : "flex-1 p-6 pt-20"}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<MainPage />} />
            <Route
              path="/guide"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Guide />
                </motion.div>
              }
            >
              {/* <Route path="account" element={<Account />} />
              <Route path="compute" element={<Database />} />
              <Route path="storage" element={<Storage />} />
              <Route path="network" element={<Network />} />
              <Route path="logging" element={<Logging />} />
              <Route path="monitoring" element={<Monitoring />} />
              <Route path="deployment" element={<Deployment />} />
              <Route path="encryption" element={<Encryption />} /> */}
            </Route>
            <Route
              path="/prowler"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Prowler />
                </motion.div>
              }
            />
            <Route
              path="/checklist"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Checklist />
                </motion.div>
              }
            />
            <Route
              path="/auditcheck"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AuditCheck />
                </motion.div>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
          </Routes>
        </AnimatePresence>
      </main>
      {!isMainPage && <Footer onDemoClick={() => setShowDemoModal(true)} />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
