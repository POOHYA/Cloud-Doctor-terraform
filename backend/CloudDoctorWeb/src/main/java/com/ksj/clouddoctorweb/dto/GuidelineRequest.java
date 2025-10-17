package com.ksj.clouddoctorweb.dto;

import lombok.Data;

@Data
public class GuidelineRequest {
    private String title;
    private Long cloudProviderId;
    private Long serviceListId;
    private String importanceLevel;
    private String whyDangerous;
    private String whatHappens;
    private String checkStandard;
    private String solutionText;
    private String sideEffects;
    private String note;
    private java.util.List<String> links;
}