package com.ksj.clouddoctorweb.service;

import com.ksj.clouddoctorweb.entity.User;

/**
 * JWT 토큰 서비스 인터페이스
 */
public interface JwtService {
    
    /**
     * 액세스 토큰 생성
     */
    String generateAccessToken(User user, String userAgent);
    
    /**
     * 리프레시 토큰 생성 및 DB 저장
     */
    String generateRefreshToken(User user, String userAgent);
    
    /**
     * 토큰에서 사용자명 추출
     */
    String extractUsername(String token);
    
    /**
     * 액세스 토큰 유효성 검증 (Redis + User-Agent)
     */
    boolean validateToken(String token, String userAgent);
    
    /**
     * 리프레시 토큰 유효성 검증 (DB + User-Agent)
     */
    boolean validateRefreshToken(String token, String userAgent);
    
    /**
     * 액세스 토큰을 Redis에 저장
     */
    void storeAccessToken(String username, String token);
    
    /**
     * Redis에서 액세스 토큰 조회
     */
    String getStoredAccessToken(String username);
    
    /**
     * Redis에서 액세스 토큰 삭제
     */
    void removeAccessToken(String username);
    
    /**
     * DB에서 리프레시 토큰 삭제
     */
    void removeRefreshToken(String username);
}