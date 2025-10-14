import { Link } from "react-router-dom";

export { default as Account } from "./Account";
export { default as Database } from "./Database";
export { default as Deployment } from "./Deployment";
export { default as Encryption } from "./Encryption";
export { default as Logging } from "./Logging";
export { default as Monitoring } from "./Monitoring";
export { default as Network } from "./Network";
export { default as Storage } from "./Storage";

function Index() {
  return (
      <main>
      <section id="Guide">
        <div className="p-4">
          <h1 className="text-2xl mb-4">보안가이드</h1>
          <div className="space-y-2">
            
              <Link to={`/guide/account`} className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <img className="w-24 h-24 rounded-lg object-cover" alt="" src="/img/account.png" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">계정 및 접근 제어</h3>
                    <p className="text-sm text-gray-600">No. 4 · 2025</p>
                  </div>
                </div>
              </Link>
              
              <Link to={`/guide/compute`} className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <img className="w-24 h-24 rounded-lg object-cover" alt="" src="/img/compute.png" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">컴퓨팅 및 가상 머신</h3>
                    <p className="text-sm text-gray-600">No. 3 · 2025</p>
                  </div>
                </div>
              </Link>
              
              <Link to={`/guide/storage`} className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <img className="w-24 h-24 rounded-lg object-cover" alt="" src="/img/storage.png" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">스토리지 및 디스크</h3>
                    <p className="text-sm text-gray-600">No. 3 · 2025</p>
                  </div>
                </div>
              </Link>
              

              <Link to={`/guide/network`} className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <img className="w-24 h-24 rounded-lg object-cover" alt="" src="/img/network.png" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">네트워크 및 보안</h3>
                    <p className="text-sm text-gray-600">No. 3 · 2025</p>
                  </div>
                </div>
              </Link>

              
              <Link to={`/guide/database`} className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <img className="w-24 h-24 rounded-lg object-cover" alt="" src="/img/database.png" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">데이터베이스</h3>
                    <p className="text-sm text-gray-600">No. 3 · 2025</p>
                  </div>
                </div>
              </Link>
              
              <Link to={`/guide/monitoring`} className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <img className="w-24 h-24 rounded-lg object-cover" alt="" src="/img/monitoring.png" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">모니터링 및 감사</h3>
                    <p className="text-sm text-gray-600">No. 3 · 2025</p>
                  </div>
                </div>
              </Link>

              <Link to={`/guide/deployment`} className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <img className="w-24 h-24 rounded-lg object-cover" alt="" src="/img/deployment.png" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">애플리케이션 통합/배포 서비스</h3>
                    <p className="text-sm text-gray-600">No. 3 · 2025</p>
                  </div>
                </div>
              </Link>
              
              <Link to={`/guide/logging`} className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <img className="w-24 h-24 rounded-lg object-cover" alt="" src="/img/logging.png" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">클라우드 로깅</h3>
                    <p className="text-sm text-gray-600">No. 4 · 2025</p>
                  </div>
                </div>
              </Link>
              
              <Link to={`/guide/encryption`} className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <img className="w-24 h-24 rounded-lg object-cover" alt="" src="/img/encryption.png" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">암호화</h3>
                    <p className="text-sm text-gray-600">No. 4 · 2025</p>
                  </div>
                </div>
              </Link>

          </div>
        </div>

      </section>
      </main>
  );
}

export default Index;
export { Index as Guide };