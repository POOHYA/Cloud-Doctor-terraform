package com.ksj.clouddoctorweb.dto;

import lombok.Data;

@Data
public class ChecklistRequest {
    private Long cloudProviderId;
    private Long serviceListId;
    private Long guidelineId;
    private String title;
    private Boolean isActive = true;
}