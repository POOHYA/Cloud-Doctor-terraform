import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../api/admin";

export default function MyPage() {
  const { adminUser } = useAuth();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checklists, setChecklists] = useState<any[]>([]);

  useEffect(() => {
    if (adminUser) {
      loadUserInfo();
      loadChecklists();
    }
  }, [adminUser]);

  const loadUserInfo = async () => {
    try {
      const info = await adminApi.getUserInfo();
      setUserInfo(info);
    } catch (error) {
      console.error("사용자 정보 로드 실패:", error);
    }
  };

  const loadChecklists = async () => {
    try {
      const data = await adminApi.getMyChecklists();
      setChecklists(data);
    } catch (error) {
      console.error("체크리스트 로드 실패:", error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (currentPassword === newPassword) {
      setError("기존 비밀번호와 같습니다. 다른 비밀번호를 입력해주세요.");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await adminApi.changePassword(currentPassword, newPassword);
      setSuccess("비밀번호가 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("비밀번호 변경에 실패했습니다.");
    }
  };

  if (!adminUser) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-primary-dark/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary text-center">
        <h2 className="text-2xl font-bold mb-4 text-beige">
          로그인이 필요합니다
        </h2>
        <p className="text-primary-light mb-6">
          마이페이지를 사용하려면 로그인해주세요.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-primary-light hover:to-accent shadow-lg transition-all"
        >
          로그인하기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <div className="bg-primary-dark/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4 text-beige">마이페이지</h1>

        {userInfo && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary-light">
                아이디:
              </span>
              <span className="text-beige">{userInfo.username}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary-light">이름:</span>
              <span className="text-beige">{userInfo.fullName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary-light">이메일:</span>
              <span className="text-beige">{userInfo.email}</span>
            </div>
            {userInfo.company && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary-light">회사:</span>
                <span className="text-beige">{userInfo.company}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-primary-dark/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-beige">비밀번호 변경</h2>

        {success && (
          <div className="mb-4 p-3 bg-green-900/20 border-l-4 border-green-500 rounded-r-lg text-green-400 text-sm">
            {success}
          </div>
        )}

        {!isChangingPassword ? (
          <button
            onClick={() => setIsChangingPassword(true)}
            className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-primary-light hover:to-accent shadow-md transition-all"
          >
            비밀번호 변경하기
          </button>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-900/20 border-l-4 border-red-500 rounded-r-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호"
              className="w-full p-3 bg-primary-dark/50 border-2 border-primary text-beige rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-primary-light"
              required
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호"
              className="w-full p-3 bg-primary-dark/50 border-2 border-primary text-beige rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-primary-light"
              required
            />
            <input
              type="password"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              placeholder="새 비밀번호 확인"
              className="w-full p-3 bg-primary-dark/50 border-2 border-primary text-beige rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-primary-light"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-primary-light hover:to-accent shadow-md transition-all"
              >
                변경
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setError("");
                  setSuccess("");
                }}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 shadow-md transition-all"
              >
                취소
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
