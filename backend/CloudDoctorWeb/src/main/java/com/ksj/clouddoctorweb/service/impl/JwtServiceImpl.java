package com.ksj.clouddoctorweb.service.impl;

import com.ksj.clouddoctorweb.entity.RefreshToken;
import com.ksj.clouddoctorweb.entity.User;
import com.ksj.clouddoctorweb.exception.SessionExpiredException;
import com.ksj.clouddoctorweb.repository.RefreshTokenRepository;
import com.ksj.clouddoctorweb.service.JwtService;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Date;
import java.util.concurrent.TimeUnit;

/**
 * JWT 토큰 서비스 구현체
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class JwtServiceImpl implements JwtService {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final RefreshTokenRepository refreshTokenRepository;
    
    @Value("${jwt.secret:cloudDoctorSecretKeyForJwtTokenGeneration2024}")
    private String jwtSecret;
    
    @Value("${jwt.access-token-expiration}") // 5분
    private long accessTokenExpiration;
    
    @Value("${jwt.refresh-token-expiration}") // 2시간
    private long refreshTokenExpiration;
    
    private SecretKey getSigningKey() {
        byte[] keyBytes = Base64.getDecoder().decode(Base64.getEncoder().encodeToString(jwtSecret.getBytes()));
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    @Override
    public String generateAccessToken(User user, String userAgent) {
        String token = Jwts.builder()
                .subject(user.getUsername())
                .claim("role", user.getRole().name())
                .claim("userId", user.getId())
                .claim("userAgent", userAgent)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(getSigningKey())
                .compact();
        
        storeAccessToken(user.getUsername(), token);
        log.info("액세스 토큰 생성: {}", user.getUsername());
        return token;
    }
    
    @Override
    @Transactional
    public String generateRefreshToken(User user, String userAgent) {
        // 기존 리프레시 토큰 삭제
        refreshTokenRepository.deleteByUserId(user.getId());
        refreshTokenRepository.flush();
        
        long now = System.currentTimeMillis();
        String token = Jwts.builder()
                .subject(user.getUsername())
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .claim("fullName", user.getFullName())
                .claim("email", user.getEmail())
                .claim("timestamp", now)
                .issuedAt(new Date(now))
                .expiration(new Date(now + refreshTokenExpiration))
                .signWith(getSigningKey())
                .compact();
        
        // DB에 저장 (User-Agent 포함)
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(token);
        refreshToken.setUserAgent(userAgent);
        refreshToken.setExpiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpiration / 1000));
        refreshTokenRepository.save(refreshToken);
        
        log.info("리프레시 토큰 생성 및 DB 저장: {}", user.getUsername());
        return token;
    }
    
    @Override
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    @Override
    public boolean validateToken(String token, String userAgent) {
        try {
            Claims claims = extractAllClaims(token);
            String tokenUserAgent = claims.get("userAgent", String.class);
            String username = claims.getSubject();
            String storedToken = getStoredAccessToken(username);
            
            log.info("토큰 검증: username={}, expired={}, storedTokenExists={}, userAgent={}", 
                username, isTokenExpired(token), storedToken != null, userAgent);
            
            Date expiration = extractExpiration(token);
            log.info("토큰 만료 시간: {}, 현재 시간: {}", expiration, new Date());
            
            if (isTokenExpired(token)) {
                log.warn("토큰 만료: {}", username);
                return false;
            }
            
            if (storedToken == null) {
                log.warn("Redis에 저장된 토큰 없음: {}, 토큰 재생성 필요", username);
                return false;
            }
            
            if (!token.equals(storedToken)) {
                log.warn("토큰 불일치: {}", username);
                return false;
            }
            
            // User-Agent 검증 비활성화 (테스트용)
            // if (!userAgent.equals(tokenUserAgent)) {
            //     log.warn("User-Agent 불일치: {} vs {}", userAgent, tokenUserAgent);
            //     return false;
            // }
            
            return true;
        } catch (Exception e) {
            log.error("토큰 검증 실패: {}", e.getMessage());
            return false;
        }
    }
    
    @Override
    public void storeAccessToken(String username, String token) {
        try {
            redisTemplate.opsForValue().set(
                "access_token:" + username, 
                token, 
                accessTokenExpiration, 
                TimeUnit.MILLISECONDS
            );
            log.info("Redis에 액세스 토큰 저장 성공: {}", username);
        } catch (Exception e) {
            log.error("Redis 토큰 저장 실패: {}, 오류: {}", username, e.getMessage());
        }
    }
    
    @Override
    public String getStoredAccessToken(String username) {
        return redisTemplate.opsForValue().get("access_token:" + username);
    }
    
    @Override
    public void removeAccessToken(String username) {
        redisTemplate.delete("access_token:" + username);
    }
    
    @Override
    public boolean validateRefreshToken(String token, String userAgent) {
        try {
            Claims claims = extractAllClaims(token);
            
            // DB에서 토큰 조회
            RefreshToken storedToken = refreshTokenRepository.findByToken(token)
                .orElse(null);
            
            if (storedToken == null) {
                log.warn("리프레시 토큰이 DB에 없음");
                return false;
            }
            
            // User-Agent 검증 (다른 브라우저 차단)
            if (!userAgent.equals(storedToken.getUserAgent())) {
                log.warn("다른 브라우저에서 리프레시 토큰 사용 시도: {} vs {}", 
                    userAgent, storedToken.getUserAgent());
                refreshTokenRepository.delete(storedToken);
                return false;
            }
            
            // 만료 시간 확인
            if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                log.warn("Refresh Token 만료: {}", storedToken.getUser().getUsername());
                refreshTokenRepository.delete(storedToken);
                throw new SessionExpiredException("로그인 유효기간이 만료되었습니다. 다시 로그인해주세요.");
            }
            
            return true;
        } catch (Exception e) {
            log.error("리프레시 토큰 검증 실패: {}", e.getMessage());
            return false;
        }
    }
    
    @Override
    @Transactional
    public void removeRefreshToken(String username) {
        refreshTokenRepository.findByToken(username)
            .ifPresent(refreshToken -> {
                refreshTokenRepository.deleteByUserId(refreshToken.getUser().getId());
                log.info("Refresh Token DB에서 삭제: {}", refreshToken.getUser().getUsername());
            });
    }
    
    @Override
    @Transactional
    public void removeAllRefreshTokensByUsername(String username) {
        refreshTokenRepository.deleteByUserUsername(username);
        log.info("사용자 모든 Refresh Token DB에서 삭제: {}", username);
    }
    
    private <T> T extractClaim(String token, java.util.function.Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}