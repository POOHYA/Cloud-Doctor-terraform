package com.ksj.clouddoctorweb.repository;

import com.ksj.clouddoctorweb.entity.Checklist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChecklistRepository extends JpaRepository<Checklist, Long> {
    List<Checklist> findByGuidelineIdAndIsActiveTrue(Long guidelineId);
}