package com.ksj.clouddoctorweb.dto;

import lombok.Data;
import java.util.List;

@Data
public class InfraAuditRequest {
    private String accountId;
    private String roleName = "CloudDoctorAuditRole";
    private String externalId;
    private List<String> checks;
}