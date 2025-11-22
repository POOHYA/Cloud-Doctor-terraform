package com.ksj.clouddoctorweb.repository;

import com.ksj.clouddoctorweb.entity.CloudProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CloudProviderRepository extends JpaRepository<CloudProvider, Long> {
    List<CloudProvider> findByIsActiveTrue();
}