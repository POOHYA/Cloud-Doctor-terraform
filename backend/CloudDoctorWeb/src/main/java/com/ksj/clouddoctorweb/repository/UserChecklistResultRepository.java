package com.ksj.clouddoctorweb.repository;

import com.ksj.clouddoctorweb.entity.UserChecklistResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserChecklistResultRepository extends JpaRepository<UserChecklistResult, Long> {
    List<UserChecklistResult> findByUserId(Long userId);
}