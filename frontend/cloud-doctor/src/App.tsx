import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Ssgoi,SsgoiTransition } from "@ssgoi/react";
import { fade } from "@ssgoi/react/view-transitions";

import Header from "./components/Header";
import Footer from "./components/Footer";
import { Guide, Account, Database, Deployment, Encryption, Logging, Monitoring, Network, Storage } from "./components/Guide";

import Checklist from "./components/Checklist";
import Prowler from "./components/Prowler";
// import Prowler from "./components/Prowler";

const config = {
  defaultTransition: fade()
};

function App() {
  const [showDemoModal, setShowDemoModal] = useState(false);


  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col pt-16">
        <Header />
        <Ssgoi config={config}>
          <main className="flex-1 p-6" style={{ position: "relative" }}>
            <Routes>
              <Route path="/" element={<div>메인 페이지에 오신 것을 환영합니다!</div>} />
              <Route path="/guide" element={<Guide />}>
                <Route path="account" element={<Account />} />
                <Route path="compute" element={<Database/>} />
                <Route path="storage" element={<Storage />} />
                <Route path="network" element={<Network />} />
                <Route path="logging" element={<Logging />} />
                <Route path="monitoring" element={<Monitoring />} />
                <Route path="deployment" element={<Deployment />} />
                <Route path="encryption" element={<Encryption />} />
              </Route>  
              <Route path="/prowler" element={<Prowler />} />
              <Route path="/checklist" element={
                <SsgoiTransition id="checklist">
                  <Checklist />
                </SsgoiTransition>
                }/>
              </Routes>
          </main>
        </Ssgoi>
        <Footer onDemoClick={() => setShowDemoModal(true)} />
      </div>
    </BrowserRouter>
  );
}

export default App;