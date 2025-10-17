package com.ksj.clouddoctorweb.util;

import java.time.Instant;
import java.util.UUID;

/**
 * AWS STS External ID 생성 유틸리티
 */
public class ExternalIdGenerator {
    
    /**
     * 타임스탬프 + UUID 조합으로 고유한 External ID 생성
     * 형식: {timestamp}-{uuid}
     */
    public static String generate() {
        long timestamp = Instant.now().toEpochMilli();
        String uuid = UUID.randomUUID().toString();
        return timestamp + "-" + uuid;
    }
}