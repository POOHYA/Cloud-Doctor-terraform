package com.ksj.clouddoctorweb.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA 설정 클래스
 * JPA Auditing 기능을 활성화하여 생성일시/수정일시 자동 관리
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
}