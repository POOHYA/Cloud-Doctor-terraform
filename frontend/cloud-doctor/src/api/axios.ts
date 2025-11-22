import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 또는 403 에러 처리
    if (error.response?.status === 401 || error.response?.status === 403) {
      const responseData = error.response?.data;

      // logout 플래그가 있거나 403이면 즉시 로그아웃
      if (responseData?.logout || error.response?.status === 403) {
        console.log("인증 만료/권한 없음, 자동 로그아웃");

        sessionStorage.removeItem("username");
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("fullName");

        alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");

        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }

        return Promise.reject(error);
      }

      // 401이고 logout 플래그가 없으면 토큰 갱신 시도
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        console.log("401 오류 발생, 토큰 재갱신 시도...");

        try {
          await axios.post(`${API_BASE_URL}/api/auth/refresh`, null, {
            withCredentials: true,
          });

          console.log("토큰 재갱신 성공");
          return axiosInstance(originalRequest);
        } catch (refreshError: any) {
          console.log("토큰 재갱신 실패, 자동 로그아웃");

          sessionStorage.removeItem("username");
          sessionStorage.removeItem("role");
          sessionStorage.removeItem("fullName");

          alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");

          if (window.location.pathname.startsWith("/admin")) {
            window.location.href = "/admin";
          } else {
            window.location.href = "/";
          }

          return Promise.reject(error);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
