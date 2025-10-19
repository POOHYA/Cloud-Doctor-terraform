package com.ksj.clouddoctorweb.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

/**
 * 서비스 리스트 엔티티
 * 클라우드 제공업체별 서비스 목록 (EC2, RDS 등)
 */
@Entity
@Table(name = "service_lists")
@Data
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class ServiceList {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cloud_provider_id", nullable = false)
    private CloudProvider cloudProvider;
    
    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;
    
    @Column(name = "service_real_case_count", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer serviceRealCaseCount = 0;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    

    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}