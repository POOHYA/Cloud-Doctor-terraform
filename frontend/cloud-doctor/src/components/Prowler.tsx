export default function Prowler() {
  return (
      <section id="Guide">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <main className="max-w-3xl w-full p-6 bg-white rounded-2xl shadow-md">
            <h1 className="text-2xl font-semibold mb-2">React + TypeScript + Tailwind</h1>
            <p className="text-sm text-gray-600 mb-4">기본 템플릿입니다 — 여기에 컴포넌트를 추가해서 개발을 시작하세요.</p>

            <section className="space-y-3">
              <div className="p-4 border rounded">여기에 컴포넌트 또는 레이아웃을 넣으세요.</div>
              <div className="p-4 border rounded">Tailwind 클래스를 사용해 스타일하세요.</div>
            </section>

            <footer className="mt-6 text-xs text-gray-500">Built with React · TypeScript · TailwindCSS</footer>
          </main>
        </div>
      </section>
  );
}