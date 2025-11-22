package com.ksj.clouddoctorweb.security;

import com.ksj.clouddoctorweb.entity.User;
import com.ksj.clouddoctorweb.repository.UserRepository;
import com.ksj.clouddoctorweb.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * JWT 인증 필터
 */
@Component
@RequiredArgsConstructor
@Log4j2
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtService jwtService;
    private final UserRepository userRepository;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        log.info("JWT 필터 처리: {} {}", request.getMethod(), requestURI);
        
        // /api/auth/ 경로는 JWT 검증 완전 제외
        if (requestURI.startsWith("/api/auth/")) {
            log.info("인증 불필요 경로, JWT 검증 건너뜀: {}", requestURI);
            filterChain.doFilter(request, response);
            return;
        }
        
        String jwt = null;
        final String userAgent = request.getHeader("User-Agent");
        
        // 1. 쿠키에서 토큰 추출
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("accessToken".equals(cookie.getName())) {
                    jwt = cookie.getValue();
                    break;
                }
            }
        }
        
        // 2. 쿠키에 없으면 Authorization 헤더 확인 (Swagger 등을 위해)
        if (jwt == null) {
            final String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwt = authHeader.substring(7);
            }
        }
        
        if (jwt == null) {
            // Access Token이 없으면 Refresh Token으로 자동 갱신 시도
            String refreshToken = null;
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("refreshToken".equals(cookie.getName())) {
                        refreshToken = cookie.getValue();
                        break;
                    }
                }
            }
            
            // Refresh Token으로 자동 갱신 시도
            if (refreshToken != null && isAuthRequiredEndpoint(requestURI)) {
                try {
                    if (jwtService.validateRefreshToken(refreshToken, userAgent)) {
                        String username = jwtService.extractUsername(refreshToken);
                        User user = userRepository.findByUsername(username).orElse(null);
                        if (user != null && user.getIsActive()) {
                            // 새 Access Token 생성
                            String newAccessToken = jwtService.generateAccessToken(user, userAgent);
                            
                            // 새 쿠키 설정
                            Cookie newAccessCookie = new Cookie("accessToken", newAccessToken);
                            newAccessCookie.setHttpOnly(true);
                            newAccessCookie.setPath("/");
                            newAccessCookie.setMaxAge(300); // 5분
                            response.addCookie(newAccessCookie);
                            
                            // 인증 설정
                            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                username, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                            );
                            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authToken);
                            
                            log.info("토큰 자동 갱신 성공: {}", username);
                            filterChain.doFilter(request, response);
                            return;
                        }
                    }
                } catch (Exception e) {
                    log.warn("Refresh Token 갱신 실패: {}", e.getMessage());
                }
            }
            
            // 인증 필요 엔드포인트에서 Access Token 없으면 401 반환
            if (isAuthRequiredEndpoint(requestURI)) {
                log.info("Access Token 없음, 인증 필요 엔드포인트: {} {}", request.getMethod(), requestURI);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Access token required\", \"logout\": true}");
                return;
            }
            
            log.info("토큰 없음: {} {}", request.getMethod(), requestURI);
            filterChain.doFilter(request, response);
            return;
        }
        
        log.info("토큰 발견: {} {}", request.getMethod(), requestURI);
        
        String username = null;
        try {
            username = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            log.error("토큰 파싱 실패: {}, 토큰 타입: {}", e.getMessage(), jwt.substring(0, Math.min(50, jwt.length())));
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Invalid token format\", \"logout\": true}");
            return;
        }
        
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                if (jwtService.validateToken(jwt, userAgent)) {
                    User user = userRepository.findByUsername(username).orElse(null);
                    if (user != null && user.getIsActive()) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            username, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                        );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        log.info("사용자 {} 인증 성공", username);
                    } else {
                        log.warn("비활성 사용자: {}", username);
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"error\":\"Unauthorized\", \"logout\": true}");
                        return;
                    }
                } else {
                    log.warn("토큰 검증 실패 (만료 또는 부정): {}, Redis 토큰 상태 확인 필요", username);
                    SecurityContextHolder.clearContext();
                    
                    // 인증 필요 엔드포인트에서만 401 반환, 비회원 접근 가능 경로는 통과
                    if (isAuthRequiredEndpoint(requestURI)) {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"error\":\"Token expired or invalid\", \"logout\": true}");
                        return;
                    }
                    // 비회원 접근 가능 경로는 그냥 통과
                    log.info("토큰 만료되었지만 비회원 접근 가능 경로: {}", requestURI);
                }
            } catch (Exception e) {
                log.warn("토큰 처리 중 오류: {}", e.getMessage());
                SecurityContextHolder.clearContext();
                
                // 인증 필요 엔드포인트에서만 401 반환
                if (isAuthRequiredEndpoint(requestURI)) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Authentication failed\", \"logout\": true}");
                    return;
                }
            }
        }
        
        filterChain.doFilter(request, response);
    }
    
    /**
     * 인증이 필요한 엔드포인트 판별
     * 기본적으로 대부분의 API는 인증이 필요하고,
     * 명시적으로 공개된 경로만 예외로 둔다.
     */
    private boolean isAuthRequiredEndpoint(String requestURI) {
        // 1. 완전 공개 경로 (JWT 검증 불필요)
        if (requestURI.startsWith("/api/auth/") ||
            requestURI.startsWith("/health") ||
            requestURI.startsWith("/swagger-ui/") ||
            requestURI.startsWith("/v3/api-docs/") ||
            requestURI.startsWith("/swagger-resources/") ||
            requestURI.startsWith("/webjars/")) {
            return false;
        }

        // 2. 비로그인 접근 허용 경로
        if (requestURI.startsWith("/api/guidelines") ||
            requestURI.startsWith("/api/providers") ||
            requestURI.startsWith("/api/services") ||
            requestURI.equals("/api/users")) {
            return false;
        }

        // 3. 관리자, 사용자 개인 정보 등은 인증 필수
        return requestURI.startsWith("/admin/") ||
            requestURI.startsWith("/api/user/") ||
            requestURI.equals("/api/my-external-id");
    }
}