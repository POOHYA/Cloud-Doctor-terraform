package com.ksj.clouddoctorweb.service.impl;

import com.ksj.clouddoctorweb.dto.LoginRequest;
import com.ksj.clouddoctorweb.dto.RegisterRequest;
import com.ksj.clouddoctorweb.dto.TokenResponse;
import com.ksj.clouddoctorweb.entity.User;
import com.ksj.clouddoctorweb.repository.UserRepository;
import com.ksj.clouddoctorweb.service.AuthService;
import com.ksj.clouddoctorweb.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 인증 서비스 구현체
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class AuthServiceImpl implements AuthService {
    
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public User register(RegisterRequest registerRequest) {
        // 이메일 형식 검증
        if (!registerRequest.getEmail().contains("@")) {
            throw new RuntimeException("올바른 이메일 형식이 아닙니다.");
        }
        
        // 중복 체크
        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            throw new RuntimeException("이미 존재하는 사용자명입니다");
        }
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new RuntimeException("이미 사용 중인 이메일입니다");
        }
        
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFullName(registerRequest.getFullName());
        user.setRole(User.Role.USER);
        user.setCompany(registerRequest.getCompany());
        
        User savedUser = userRepository.save(user);
        log.info("회원가입 성공: {}", savedUser.getUsername());
        return savedUser;
    }
    
    @Override
    public TokenResponse login(LoginRequest loginRequest, String userAgent) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다");
        }
        
        String accessToken = jwtService.generateAccessToken(user, userAgent);
        String refreshToken = jwtService.generateRefreshToken(user, userAgent);
        
        log.info("로그인 성공: {}", user.getUsername());
        return new TokenResponse(accessToken, refreshToken);
    }
    
    @Override
    public void logout(String username) {
        // Redis에서 액세스 토큰 삭제
        jwtService.removeAccessToken(username);
        // DB에서 리프레시 토큰 삭제
        jwtService.removeRefreshToken(username);
        log.info("로그아웃: {}", username);
    }
    
    @Override
    public TokenResponse refreshToken(String refreshToken, String userAgent) {
        // 리프레시 토큰 DB + User-Agent 검증
        if (!jwtService.validateRefreshToken(refreshToken, userAgent)) {
            throw new RuntimeException("이미 로그인되어 있습니다. 다시 로그인 해주세요.");
        }
        
        String username = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        // 계정 활성화 상태 확인
        if (!user.getIsActive()) {
            jwtService.removeRefreshToken(username);
            throw new RuntimeException("비활성화된 계정입니다");
        }
        
        String newAccessToken = jwtService.generateAccessToken(user, userAgent);
        String newRefreshToken = jwtService.generateRefreshToken(user, userAgent);
        
        log.info("토큰 갱신 성공: {}", username);
        return new TokenResponse(newAccessToken, newRefreshToken);
    }
}