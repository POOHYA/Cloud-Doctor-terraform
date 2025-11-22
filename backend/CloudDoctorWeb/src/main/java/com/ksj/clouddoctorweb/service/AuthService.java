package com.ksj.clouddoctorweb.service;

import com.ksj.clouddoctorweb.dto.LoginRequest;
import com.ksj.clouddoctorweb.dto.RegisterRequest;
import com.ksj.clouddoctorweb.dto.TokenResponse;
import com.ksj.clouddoctorweb.entity.User;

/**
 * 인증 서비스 인터페이스
 */
public interface AuthService {
    
    /**
     * 회원가입 처리
     */
    User register(RegisterRequest registerRequest);
    
    /**
     * 로그인 처리
     */
    TokenResponse login(LoginRequest loginRequest, String userAgent);
    
    /**
     * 로그아웃 처리
     */
    void logout(String refreshToken);
    
    /**
     * 사용자별 모든 토큰 삭제
     */
    void logoutAllTokensByUsername(String username);
    
    /**
     * Redis에서 Access Token 삭제
     */
    void removeAccessToken(String username);
    
    /**
     * 토큰 갱신
     */
    TokenResponse refreshToken(String refreshToken, String userAgent);
    
    /**
     * 아이디 중복 확인
     */
    boolean existsByUsername(String username);
    
    /**
     * 이메일 중복 확인
     */
    boolean existsByEmail(String email);
}