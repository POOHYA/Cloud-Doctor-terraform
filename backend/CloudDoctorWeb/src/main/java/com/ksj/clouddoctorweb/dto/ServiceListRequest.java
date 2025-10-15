package com.ksj.clouddoctorweb.dto;

import lombok.Data;

/**
 * 서비스 리스트 생성/수정 요청 DTO
 */
@Data
public class ServiceListRequest {
    private Long cloudProviderId;
    private String name;
    private String displayName;
    private Boolean isActive = true;
}