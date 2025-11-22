package com.ksj.clouddoctorweb.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Guideline {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cloud_provider_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private CloudProvider cloudProvider;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_list_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private ServiceList serviceList;
    
    @Column(name = "importance_level", nullable = false)
    private String importanceLevel;
    
    @Column(name = "why_dangerous", columnDefinition = "TEXT", nullable = false)
    private String whyDangerous;
    
    @Column(name = "what_happens", columnDefinition = "TEXT", nullable = false)
    private String whatHappens;
    
    @Column(name = "check_standard", columnDefinition = "TEXT")
    private String checkStandard;
    
    @Column(name = "solution_text", columnDefinition = "TEXT")
    private String solutionText;
    
    @Column(name = "side_effects", columnDefinition = "TEXT")
    private String sideEffects;
    
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User createdBy;
    
    @OneToMany(mappedBy = "guideline", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<GuidelineSolutionImage> solutionImages;
    
    @OneToMany(mappedBy = "guideline", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<GuidelineLink> links;
    
    @OneToMany(mappedBy = "guideline", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Checklist> checklists;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 사용하지 않는 메서드 제거
    // public void setImportanceLevelString(String level) {
    //     this.importanceLevel = level;
    // }
    
    public enum ImportanceLevel {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}