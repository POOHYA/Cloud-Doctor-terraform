import { useState } from "react";

interface AdminRegisterProps {
  onSwitchToLogin: () => void;
}

export default function AdminRegister({ onSwitchToLogin }: AdminRegisterProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      if (localStorage.getItem("admin_" + username)) {
        alert("이미 존재하는 아이디입니다.");
        return;
      }

      localStorage.setItem(
        "admin_" + username,
        JSON.stringify({
          username,
          password,
          createdAt: new Date().toISOString(),
        })
      );

      alert("회원가입이 완료되었습니다.");
      onSwitchToLogin();
    } catch (error) {
      console.error("회원가입 중 오류 발생:", error);
      alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">관리자 회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">아이디</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            비밀번호 확인
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
        >
          회원가입
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        이미 계정이 있으신가요?{" "}
        <button
          onClick={onSwitchToLogin}
          className="text-blue-500 hover:underline"
        >
          로그인
        </button>
      </p>
    </div>
  );
}
