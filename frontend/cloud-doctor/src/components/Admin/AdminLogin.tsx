import Login from "../Login";

export default function AdminLogin() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Login showRegister={false} />
    </div>
  );
}
