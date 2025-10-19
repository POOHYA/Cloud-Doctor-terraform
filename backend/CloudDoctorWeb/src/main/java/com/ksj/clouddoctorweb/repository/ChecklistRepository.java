package com.ksj.clouddoctorweb.repository;

import com.ksj.clouddoctorweb.entity.Checklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ChecklistRepository extends JpaRepository<Checklist, Long> {
    @Query("SELECT c FROM Checklist c WHERE c.guideline.id = :guidelineId AND c.isActive = true ORDER BY c.id ASC")
    List<Checklist> findByGuidelineIdAndIsActiveTrue(Long guidelineId);
    
    @Query("SELECT c FROM Checklist c WHERE c.cloudProvider.id = :cloudProviderId AND c.serviceList.id = :serviceListId AND c.isActive = true ORDER BY c.id ASC")
    List<Checklist> findByCloudProviderIdAndServiceListIdAndIsActiveTrue(Long cloudProviderId, Long serviceListId);
    
    @Query("SELECT c FROM Checklist c WHERE c.isActive = true ORDER BY c.id ASC")
    List<Checklist> findAllActiveOrderedByProviderServiceGuideline();
    
    List<Checklist> findAllByOrderByIdAsc();
}