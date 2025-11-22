package com.ksj.clouddoctorweb.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 토큰 응답 DTO
 */
@Data
@AllArgsConstructor
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    
    public TokenResponse(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}