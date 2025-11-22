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
 * 사용자 체크리스트 항목 결과 엔티티
 * 개별 체크리스트 항목의 점검 결과
 */
@Entity
@Table(name = "user_checklist_item_results")
@Data
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class UserChecklistItemResult {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_checklist_result_id", nullable = false)
    private UserChecklistResult userChecklistResult;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_id", nullable = false)
    private Checklist checklist;
    
    @Column(name = "is_checked")
    private Boolean isChecked = false;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "checked_at")
    private LocalDateTime checkedAt;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}