package com.ksj.clouddoctorweb.dto;

import com.ksj.clouddoctorweb.entity.ServiceList;
import lombok.Data;

@Data
public class ServiceListResponse {
    private Long id;
    private String name;
    private String displayName;
    private Boolean isActive;
    private CloudProviderDto cloudProvider;
    
    @Data
    public static class CloudProviderDto {
        private Long id;
        private String name;
        private String displayName;
    }
    
    public static ServiceListResponse from(ServiceList serviceList) {
        ServiceListResponse response = new ServiceListResponse();
        response.setId(serviceList.getId());
        response.setName(serviceList.getName());
        response.setDisplayName(serviceList.getDisplayName());
        response.setIsActive(serviceList.getIsActive());
        
        CloudProviderDto providerDto = new CloudProviderDto();
        providerDto.setId(serviceList.getCloudProvider().getId());
        providerDto.setName(serviceList.getCloudProvider().getName());
        providerDto.setDisplayName(serviceList.getCloudProvider().getDisplayName());
        response.setCloudProvider(providerDto);
        
        return response;
    }
}