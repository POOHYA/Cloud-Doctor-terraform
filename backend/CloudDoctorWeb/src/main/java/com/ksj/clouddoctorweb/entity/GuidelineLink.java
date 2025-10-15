package com.ksj.clouddoctorweb.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

/**
 * 가이드라인 링크 엔티티
 * 가이드라인에 연결된 참고 링크들
 */
@Entity
@Table(name = "guideline_links")
@Data
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class GuidelineLink {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guideline_id", nullable = false)
    private Guideline guideline;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String url;
    
    @Column(length = 200)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}