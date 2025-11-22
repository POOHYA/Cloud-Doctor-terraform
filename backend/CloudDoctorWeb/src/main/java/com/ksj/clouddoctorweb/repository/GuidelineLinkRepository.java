package com.ksj.clouddoctorweb.repository;

import com.ksj.clouddoctorweb.entity.GuidelineLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface GuidelineLinkRepository extends JpaRepository<GuidelineLink, Long> {
    List<GuidelineLink> findByGuidelineId(Long guidelineId);
    
    @Modifying
    @Transactional
    void deleteByGuidelineId(Long guidelineId);
}