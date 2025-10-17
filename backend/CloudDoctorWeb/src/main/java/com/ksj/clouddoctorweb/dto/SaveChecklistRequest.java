package com.ksj.clouddoctorweb.dto;

import lombok.Data;
import java.util.Map;

@Data
public class SaveChecklistRequest {
    private String resultName;
    private Map<String, Boolean> answers;
}
