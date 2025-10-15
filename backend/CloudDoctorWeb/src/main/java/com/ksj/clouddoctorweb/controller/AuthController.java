package com.ksj.clouddoctorweb.controller;

import com.ksj.clouddoctorweb.dto.LoginRequest;
import com.ksj.clouddoctorweb.dto.RegisterRequest;
import com.ksj.clouddoctorweb.dto.TokenResponse;
import com.ksj.clouddoctorweb.entity.User;
import com.ksj.clouddoctorweb.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
    @Operation(summary = "로그인", description = "사용자 인증 후 액세스/리프레시 토큰 발급")
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest loginRequest, 
                                             HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        TokenResponse response = authService.login(loginRequest, userAgent);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 로그아웃
     */
    @Operation(summary = "로그아웃", description = "사용자 로그아웃 및 토큰 삭제")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication) {
        authService.logout(authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * 토큰 갱신
     */
    @Operation(summary = "Refresh 토큰 갱신", description = "사용자 Refresh 토큰 재발급")
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@RequestParam String refreshToken,
                                               HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        TokenResponse response = authService.refreshToken(refreshToken, userAgent);
        return ResponseEntity.ok(response);
    }
}