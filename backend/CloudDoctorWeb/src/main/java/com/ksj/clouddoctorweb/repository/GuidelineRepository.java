package com.ksj.clouddoctorweb.repository;

import com.ksj.clouddoctorweb.entity.Guideline;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GuidelineRepository extends JpaRepository<Guideline, Long> {
    List<Guideline> findByCloudProviderIdOrderByIdAsc(Long cloudProviderId);
    List<Guideline> findByServiceListIdOrderByIdAsc(Long serviceListId);
    List<Guideline> findAllByOrderByIdAsc();
}