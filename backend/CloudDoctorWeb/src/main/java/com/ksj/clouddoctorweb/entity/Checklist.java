package com.ksj.clouddoctorweb.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

/**
 * 체크리스트 엔티티
 * 가이드라인 하위의 체크리스트 항목들
 */
@Entity
@Table(name = "checklists")
@Data
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class Checklist {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cloud_provider_id", nullable = false)
    @JsonIgnore
    private CloudProvider cloudProvider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_list_id", nullable = false)
    @JsonIgnore
    private ServiceList serviceList;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guideline_id", nullable = false)
    @JsonIgnore
    private Guideline guideline;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    @JsonIgnore
    private User createdBy;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}