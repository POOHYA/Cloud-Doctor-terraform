package com.ksj.clouddoctorweb.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

/**
 * 가이드라인 조치방안 이미지 엔티티
 */
@Entity
@Table(name = "guideline_solution_images")
@Data
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class GuidelineSolutionImage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guideline_id", nullable = false)
    private Guideline guideline;
    
    @Column(name = "image_url", columnDefinition = "TEXT", nullable = false)
    private String imageUrl;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}