import { useState, useEffect } from "react";
import { Link, Routes, Route } from "react-router-dom";
import { userApi } from "../../api/user";
import GuideDetail from "./GuideDetail";

function Index() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const servicesData = await userApi.getServicesByProvider(1);
        const servicesWithCount = await Promise.all(
          servicesData.map(async (service: any) => {
            const guidelines = await userApi.getGuidelinesByService(service.id);
            return {
              ...service,
              guidelineCount: Array.isArray(guidelines) ? guidelines.length : 0,
            };
          })
        );
        console.log("Services with counts:", servicesWithCount);
        setServices(servicesWithCount);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <main>
      <section
        id="Guide"
        className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-primary-dark py-12"
      >
        <div className="p-6 max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-beige to-primary-light bg-clip-text text-transparent">
            📖 AWS 보안 가이드
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(services) && services.length > 0 ? (
              services.map((service) => (
                <Link
                  key={service.id}
                  to={`/guide/${service.name}`}
                  className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg bg-primary-light/20 flex items-center justify-center text-4xl">
                      📋
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-beige mb-2">
                        {service.displayName}
                      </h3>
                      <p className="text-sm text-slate-400">
                        총 {service.guidelineCount}개 항목
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center text-white">
                loading...
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function Guide() {
  return (
    <Routes>
      <Route index element={<Index />} />
      <Route path=":service" element={<GuideDetail />} />
    </Routes>
  );
}
