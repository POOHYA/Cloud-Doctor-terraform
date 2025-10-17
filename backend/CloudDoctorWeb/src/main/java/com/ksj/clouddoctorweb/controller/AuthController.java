package com.ksj.clouddoctorweb.controller;

import com.ksj.clouddoctorweb.dto.LoginRequest;
import com.ksj.clouddoctorweb.dto.RegisterRequest;
import com.ksj.clouddoctorweb.dto.TokenResponse;
import com.ksj.clouddoctorweb.entity.User;
import com.ksj.clouddoctorweb.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 인증 컨트롤러
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Log4j2
@Tag(name = "인증", description = "회원가입, 로그인, 로그아웃 API")
public class AuthController {
    
    private final AuthService authService;
    
    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration;
    
    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;
    
    @Value("${cookie.secure}")
    private boolean cookieSecure;
    
    @Value("${spring.profiles.active:dev}")
    private String activeProfile;
    
    /**
     * 아이디 중복확인
     */
    @Operation(summary = "아이디 중복확인", description = "사용자명 중복 여부 확인")
    @GetMapping("/check-username")
    public ResponseEntity<Map<String, Boolean>> checkUsername(@RequestParam String username) {
        boolean exists = authService.existsByUsername(username);
        Map<String, Boolean> result = new HashMap<>();
        result.put("exists", exists);
        return ResponseEntity.ok(result);
    }
    
    /**
     * 이메일 중복확인
     */
    @Operation(summary = "이메일 중복확인", description = "이메일 중복 여부 확인")
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean exists = authService.existsByEmail(email);
        Map<String, Boolean> result = new HashMap<>();
        result.put("exists", exists);
        return ResponseEntity.ok(result);
    }
    
    /**
     * 회원가입
     */
    @Operation(summary = "회원가입", description = "새로운 사용자 계정 생성. 이메일은 @ 포함 필수")
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest registerRequest) {
        User user = authService.register(registerRequest);
        return ResponseEntity.ok(user);
    }
    
    /**
     * 로그인
     */
    @Operation(summary = "로그인", description = "사용자 인증 후 HttpOnly 쿠키로 토큰 발급")
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest loginRequest, 
                                             HttpServletRequest request,
                                             HttpServletResponse response) {
        String userAgent = request.getHeader("User-Agent");
        TokenResponse tokenResponse = authService.login(loginRequest, userAgent);
        
        // 환경 구분: Origin 헤더 또는 Profile로 판단
        String origin = request.getHeader("Origin");
        boolean isLocal = (origin != null && origin.contains("localhost")) || 
                         "dev".equals(activeProfile) || "local".equals(activeProfile);
        
        if (isLocal) {
            // 로컬 개발환경: SameSite=Lax, Secure=false
            response.addHeader("Set-Cookie", String.format(
                "accessToken=%s; Path=/; Max-Age=%d; HttpOnly; SameSite=Lax",
                tokenResponse.getAccessToken(),
                (int) (accessTokenExpiration / 1000)
            ));
            
            response.addHeader("Set-Cookie", String.format(
                "refreshToken=%s; Path=/; Max-Age=%d; HttpOnly; SameSite=Lax",
                tokenResponse.getRefreshToken(),
                (int) (refreshTokenExpiration / 1000)
            ));
        } else {
            // 프로덕션 환경: SameSite=None, Secure=true (Cross-Site 지원)
            response.addHeader("Set-Cookie", String.format(
                "accessToken=%s; Path=/; Max-Age=%d; HttpOnly; SameSite=None; Secure; Domain=.takustory.site",
                tokenResponse.getAccessToken(),
                (int) (accessTokenExpiration / 1000)
            ));
            
            response.addHeader("Set-Cookie", String.format(
                "refreshToken=%s; Path=/; Max-Age=%d; HttpOnly; SameSite=None; Secure; Domain=.takustory.site",
                tokenResponse.getRefreshToken(),
                (int) (refreshTokenExpiration / 1000)
            ));
        }
        
        log.info("쿠키 설정 완료: accessToken, refreshToken");
        
        Map<String, String> result = new HashMap<>();
        result.put("message", "로그인 성공");
        result.put("username", loginRequest.getUsername());
        result.put("role", tokenResponse.getTokenType());
        
        // 로컬 개발환경에서는 쿠키 대신 Bearer 토큰 사용
        if (isLocal) {
            result.put("accessToken", tokenResponse.getAccessToken());
            result.put("refreshToken", tokenResponse.getRefreshToken());
        }
        
        log.info("로그인 응답: username={}, role={}", loginRequest.getUsername(), tokenResponse.getTokenType());
        return ResponseEntity.ok(result);
    }
    
    /**
     * 로그아웃
     */
    @Operation(summary = "로그아웃", description = "사용자 로그아웃 및 Access Token 쿠키 삭제")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }
        
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }
        
        // 모든 쿠키 삭제
        response.addHeader("Set-Cookie", "accessToken=; Path=/; Max-Age=0; HttpOnly");
        response.addHeader("Set-Cookie", "refreshToken=; Path=/; Max-Age=0; HttpOnly");
        
        return ResponseEntity.ok().build();
    }
    
    /**
     * 토큰 갱신
     */
    @Operation(summary = "Refresh 토큰 갱신", description = "쿠키의 Refresh 토큰으로 Access Token만 재발급")
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(HttpServletRequest request,
                                                      HttpServletResponse response) {
        String refreshToken = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }
        
        if (refreshToken == null) {
            throw new RuntimeException("Refresh 토큰이 없습니다");
        }
        
        String userAgent = request.getHeader("User-Agent");
        TokenResponse tokenResponse = authService.refreshToken(refreshToken, userAgent);
        
        // 새 Access Token만 발급
        Cookie accessCookie = new Cookie("accessToken", tokenResponse.getAccessToken());
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(true);  // Cross-Site에 필수
        accessCookie.setPath("/");
        accessCookie.setMaxAge((int) (accessTokenExpiration / 1000));
        response.addCookie(accessCookie);
        
        String sameSite = "SameSite=None";
        String secure = "Secure; ";
        
        response.addHeader("Set-Cookie", String.format(
            "accessToken=%s; Path=/; Max-Age=%d; HttpOnly; %s%s",
            tokenResponse.getAccessToken(),
            (int) (accessTokenExpiration / 1000),
            secure,
            sameSite
        ));
        
        Map<String, String> result = new HashMap<>();
        result.put("message", "토큰 갱신 성공");
        
        // 개발 환경에서만 새 Access Token 노출
        if ("dev".equals(activeProfile) || "local".equals(activeProfile)) {
            result.put("accessToken", tokenResponse.getAccessToken());
        }
        
        return ResponseEntity.ok(result);
    }
}