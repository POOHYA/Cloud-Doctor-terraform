package com.ksj.clouddoctorweb.dto;

import lombok.Data;

/**
 * 로그인 요청 DTO
 */
@Data
public class LoginRequest {
    private String username;
    private String password;
}