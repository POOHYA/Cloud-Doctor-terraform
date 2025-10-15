package com.ksj.clouddoctorweb.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 가이드라인 엔티티
 * 관리자가 생성하는 보안 가이드라인
 */
@Entity
@Table(name = "guidelines")
@Data
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class Guideline {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cloud_provider_id", nullable = false)
    private CloudProvider cloudProvider;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_list_id", nullable = false)
    private ServiceList serviceList;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "importance_level", nullable = false)
    private ImportanceLevel importanceLevel;
    
    @Column(name = "why_dangerous", columnDefinition = "TEXT", nullable = false)
    private String whyDangerous;
    
    @Column(name = "what_happens", columnDefinition = "TEXT", nullable = false)
    private String whatHappens;
    
    @Column(name = "check_criteria", columnDefinition = "TEXT", nullable = false)
    private String checkCriteria;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @OneToMany(mappedBy = "guideline", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<GuidelineSolutionImage> solutionImages;
    
    @OneToMany(mappedBy = "guideline", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<GuidelineLink> links;
    
    @OneToMany(mappedBy = "guideline", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Checklist> checklists;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum ImportanceLevel {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}