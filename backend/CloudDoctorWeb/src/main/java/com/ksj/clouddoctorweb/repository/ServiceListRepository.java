package com.ksj.clouddoctorweb.repository;

import com.ksj.clouddoctorweb.entity.ServiceList;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceListRepository extends JpaRepository<ServiceList, Long> {
    List<ServiceList> findByCloudProviderIdAndIsActiveTrue(Long cloudProviderId);
    List<ServiceList> findByIsActiveTrue();
    List<ServiceList> findByCloudProviderIdAndIsActiveTrueOrderByIdAsc(Long cloudProviderId);
    List<ServiceList> findByCloudProviderIdOrderByIdAsc(Long cloudProviderId);
    List<ServiceList> findAllByOrderByIdAsc();
    boolean existsByCloudProviderIdAndName(Long cloudProviderId, String name);
}