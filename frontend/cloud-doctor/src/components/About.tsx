export default function About() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-primary-dark py-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* 슬로건 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-beige to-primary-light bg-clip-text text-transparent leading-tight tracking-wide">
            실제 침해사례 기반의 보안 가이드라인으로,
            <br />
            AWS 인프라를 안전하게 관리하세요.
          </h1>
          <p className="text-xl md:text-2xl text-primary-light max-w-4xl mx-auto leading-relaxed">
            CloudDoctor는 실제 AWS 침해사례와 공격 기법을 바탕으로 한 실효성
            있는 보안 점검으로, 여러분의 인프라를 실제 공격에 강한 운영 환경을
            만듭니다.
          </p>
        </div>

        {/* 내용 */}
        <div className="bg-primary-dark/50 backdrop-blur-xl rounded-3xl shadow-2xl p-10 mb-16 border border-primary">
          <h2 className="text-3xl font-bold text-beige mb-8 text-center">
            제공 서비스
          </h2>
          <p className="text-lg text-beige leading-relaxed mb-6">
            연이어 발생하는 클라우드 침해사고에 대응하기 위해, CloudDoctor는
            실제 AWS 보안사고와 공격기법 약 350건을 직접 분석했습니다. 이를
            기반으로 한 보안 가이드와 체크리스트를 통해, 단순 점검을 넘어 실제
            위협에 대응할 수 있는 현실적인 보안 검증 체계를 제공합니다. 현실적인
            보안 가이드라인과 체크리스트, 웹사이트 내 자동 점검 기능을
            제공합니다. 보안 전문가가 아니더라도 구체적인 점검 절차와 즉시 적용
            가능한 조치안을 통해 최소한의 보안을 지킬 수 있습니다.
          </p>
          <div className="space-y-8">
            <div className="bg-primary/30 rounded-xl p-6 border border-beige/20">
              <h3 className="text-2xl font-bold text-beige mb-4 flex items-center gap-3">
                <span className="text-3xl">📖</span> 가이드라인
              </h3>
              <ul className="space-y-2 text-primary-light">
                <li className="flex items-start gap-2">
                  <span>
                    • 실제 침해사례 기반의 대응 가이드라인으로 왜 위험한가 /
                    어떤 일이 벌어질까 / 점검 기준 / 조치 방안 / 침해사례 및
                    공격기법 / Side Effect 등 제공
                  </span>
                </li>
              </ul>
            </div>
            <div className="bg-primary/30 rounded-xl p-6 border border-beige/20">
              <h3 className="text-2xl font-bold text-beige mb-4 flex items-center gap-3">
                <span className="text-3xl">✅</span> 체크리스트
              </h3>
              <ul className="space-y-2 text-primary-light">
                <li className="flex items-start gap-2">
                  <span>
                    • 가이드라인을 바탕으로 산출된 항목들을 O / X 로 체크
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>• 등급을 Nice/ Warning / Critical 로 제공</span>
                </li>
              </ul>
            </div>
            <div className="bg-primary/30 rounded-xl p-6 border border-beige/20">
              <h3 className="text-2xl font-bold text-beige mb-4 flex items-center gap-3">
                <span className="text-3xl">🔍</span> 보안 점검
              </h3>
              <ul className="space-y-2 text-primary-light">
                <li className="flex items-start gap-2">
                  <span>
                    • AWS 계정 연결(CloudFormation을 통한 Role 생성) 후 IAM, S3,
                    EC2 등의 서비스에서 가이드라인 기반의 점검 사항 자동 스캔
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>
                    • 결과: 서비스별 보안 점검 결과 + raw data + 조치 가이드라인
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 사용 방법 */}
        <div className="bg-primary-dark/50 backdrop-blur-xl rounded-3xl shadow-2xl p-10 mb-16 border border-primary">
          <h2 className="text-3xl font-bold text-beige mb-8 text-center">
            📚 사용 방법
          </h2>
          <div className="space-y-8">
            <div className="bg-primary/30 rounded-xl p-6 border border-beige/20">
              <h3 className="text-2xl font-bold text-beige mb-4 flex items-center gap-3">
                <span className="text-3xl">📖</span> 가이드라인
              </h3>
              <ul className="space-y-2 text-primary-light">
                <li className="flex items-start gap-2">
                  <span>
                    • 27개 서비스 목록에서 보고 싶은 서비스를 클릭하면 해당
                    서비스의 가이드가 표시됩니다.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>
                    • 왼쪽 목차의 제목을 클릭하면 해당 가이드로 스크롤되어
                    내용을 바로 확인할 수 있습니다.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>
                    • 조치방안의 캡쳐 버튼을 누르면, 취약 기준에 따른 조치
                    가이드를 확인할 수 있습니다.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>
                    • 이미지를 클릭하면 전체 창으로 보이고, 이미지를 다시
                    클릭하면 확대/축소가 가능합니다.
                  </span>
                </li>
              </ul>
            </div>
            <div className="bg-primary/30 rounded-xl p-6 border border-beige/20">
              <h3 className="text-2xl font-bold text-beige mb-4 flex items-center gap-3">
                <span className="text-3xl">✅</span> 체크리스트
              </h3>
              <ul className="space-y-2 text-primary-light">
                <li className="flex items-start gap-2">
                  <span>
                    • 사용 중인 서비스를 선택하면 해당 서비스의 체크리스트를
                    확인할 수 있습니다.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>
                    • 항목을 체크하면 진행률이 업데이트 되어 남은 항목의 갯수를
                    쉽게 확인할 수 있습니다.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>
                    • 모든 체크리스트 확인을 완료하면 보안 상태가 Nice / Warning
                    / Critical로 표시됩니다.
                  </span>
                </li>
              </ul>
            </div>
            <div className="bg-primary/30 rounded-xl p-6 border border-beige/20">
              <h3 className="text-2xl font-bold text-beige mb-4 flex items-center gap-3">
                <span className="text-3xl">🔍</span> 자동 점검 (회원 전용)
              </h3>
              <ul className="space-y-2 text-primary-light">
                <li className="flex items-start gap-2">
                  <span>
                    • 자동 점검은 회원 가입 후 로그인해야 이용할 수 있습니다.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>
                    • 최초 점검 시에는 Cloud Doctor가 점검을 수행할 IAM Role
                    생성(위임) 과정이 필요합니다.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>
                    • 보안 점검 탭 상단의 '점검 IAM Role 생성 가이드'를 따라
                    Role을 생성합니다.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>• AWS 콘솔에서 Account ID를 복사해 입력합니다.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>
                    • External ID 옆의 확인&복사 버튼을 눌러 External ID를
                    활성화합니다.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>
                    • 검사할 서비스를 선택하거나, 개별 점검 항목을 선택한 뒤
                    하단의 '점검 시작' 버튼을 눌러 보안 점검을 실행합니다.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>
                    • 점검 결과에서 취약 항목을 확인하고, 제공된 조치 방안을
                    따라 수정합니다.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-primary to-accent rounded-3xl p-12 shadow-2xl">
          <p className="text-2xl text-white mb-8 leading-relaxed">
            Cloud Doctor와 함께 최소한의 보안 체계를 신속히 마련하고,
            <br />
            실제 공격에 강한 운영 환경을 구현할 수 있습니다.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/guide"
              className="px-8 py-4 bg-beige text-primary-dark rounded-xl font-bold text-lg hover:bg-primary-light transition-all shadow-lg"
            >
              📖 가이드라인 보기
            </a>
            <a
              href="/checklist"
              className="px-8 py-4 bg-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/30 transition-all shadow-lg border-2 border-white/50"
            >
              ✅ 체크리스트 시작
            </a>
            <a
              href="/auditcheck"
              className="px-8 py-4 bg-accent text-white rounded-xl font-bold text-lg hover:bg-accent/80 transition-all shadow-lg"
            >
              🔍 자동 점검 시작
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
