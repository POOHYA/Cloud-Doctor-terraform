package com.ksj.clouddoctorweb.repository;

import com.ksj.clouddoctorweb.entity.GuidelineSolutionImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GuidelineSolutionImageRepository extends JpaRepository<GuidelineSolutionImage, Long> {
    List<GuidelineSolutionImage> findByGuidelineIdOrderByDisplayOrderAsc(Long guidelineId);
    void deleteByGuidelineId(Long guidelineId);
}
