package com.ksj.clouddoctorweb.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 사용자 체크리스트 결과 엔티티
 * 사용자가 수행한 체크리스트 점검 결과
 */
@Entity
@Table(name = "user_checklist_results")
@Data
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class UserChecklistResult {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_id", nullable = false)
    private Checklist checklist;
    
    @Column(name = "result_name", nullable = false, length = 200)
    private String resultName;
    
    @Column(name = "is_completed")
    private Boolean isCompleted = false;
    
    @Column(name = "completion_date")
    private LocalDateTime completionDate;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @OneToMany(mappedBy = "userChecklistResult", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UserChecklistItemResult> itemResults;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}