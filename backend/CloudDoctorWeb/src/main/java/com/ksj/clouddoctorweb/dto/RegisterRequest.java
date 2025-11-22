package com.ksj.clouddoctorweb.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 회원가입 요청 DTO
 */
@Data
@Schema(description = "회원가입 요청")
public class RegisterRequest {
    
    @Schema(description = "아이디", example = "user123", required = true)
    private String username;
    
    @Schema(description = "이메일 (@ 포함 필수)", example = "user@example.com", required = true)
    private String email;
    
    @Schema(description = "비밀번호", example = "password123", required = true)
    private String password;
    
    @Schema(description = "이름", example = "홍길동", required = true)
    private String fullName;
    
    @Schema(description = "회사명 (선택)", example = "ABC회사")
    private String company;
}