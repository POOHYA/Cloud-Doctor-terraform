package com.ksj.clouddoctorweb.dto;

import com.ksj.clouddoctorweb.entity.Checklist;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChecklistResponse {
    private Long id;
    private String title;
    private Long cloudProviderId;
    private String cloudProviderName;
    private Long serviceListId;
    private String serviceListName;
    private Long guidelineId;
    private String guidelineTitle;
    private Boolean isActive;
    private LocalDateTime createdAt;
    
    public static ChecklistResponse from(Checklist checklist) {
        ChecklistResponse response = new ChecklistResponse();
        response.setId(checklist.getId());
        response.setTitle(checklist.getTitle());
        response.setCloudProviderId(checklist.getCloudProvider().getId());
        response.setCloudProviderName(checklist.getCloudProvider().getName());
        response.setServiceListId(checklist.getServiceList().getId());
        response.setServiceListName(checklist.getServiceList().getDisplayName());
        response.setGuidelineId(checklist.getGuideline().getId());
        response.setGuidelineTitle(checklist.getGuideline().getTitle());
        response.setIsActive(checklist.getIsActive());
        response.setCreatedAt(checklist.getCreatedAt());
        return response;
    }
}