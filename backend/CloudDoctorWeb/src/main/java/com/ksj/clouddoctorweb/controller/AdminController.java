package com.ksj.clouddoctorweb.controller;

import com.ksj.clouddoctorweb.dto.ServiceListRequest;
import com.ksj.clouddoctorweb.entity.CloudProvider;
import com.ksj.clouddoctorweb.entity.ServiceList;
import com.ksj.clouddoctorweb.entity.User;
import com.ksj.clouddoctorweb.repository.CloudProviderRepository;
import com.ksj.clouddoctorweb.repository.ServiceListRepository;
import com.ksj.clouddoctorweb.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 관리자 전용 컨트롤러
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Log4j2
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "관리자", description = "관리자 전용 API (ADMIN 권한 필요)")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminController {
    
    private final ServiceListRepository serviceListRepository;
    private final CloudProviderRepository cloudProviderRepository;
    private final UserRepository userRepository;
    
    /**
     * 서비스 리스트 생성
     */
    @Operation(summary = "서비스 생성", description = "ADMIN 전용: 클라우드 서비스 생성 (EC2, RDS 등)")
    @PostMapping("/services")
    public ResponseEntity<ServiceList> createService(@RequestBody ServiceListRequest request,
                                                   Authentication authentication) {
        CloudProvider provider = cloudProviderRepository.findById(request.getCloudProviderId())
            .orElseThrow(() -> new RuntimeException("클라우드 제공업체를 찾을 수 없습니다"));
        
        User admin = userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new RuntimeException("관리자를 찾을 수 없습니다"));
        
        ServiceList serviceList = new ServiceList();
        serviceList.setCloudProvider(provider);
        serviceList.setName(request.getName());
        serviceList.setDisplayName(request.getDisplayName());
        serviceList.setIsActive(request.getIsActive());
        serviceList.setCreatedBy(admin);
        
        ServiceList saved = serviceListRepository.save(serviceList);
        log.info("서비스 생성: {} - {} (관리자: {})", provider.getName(), saved.getName(), admin.getUsername());
        return ResponseEntity.ok(saved);
    }
    
    /**
     * 서비스 리스트 수정
     */
    @Operation(summary = "서비스 수정", description = "ADMIN 전용: 클라우드 서비스 정보 수정")
    @PutMapping("/services/{id}")
    public ResponseEntity<ServiceList> updateService(@PathVariable Long id, 
                                                   @RequestBody ServiceListRequest request) {
        ServiceList serviceList = serviceListRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("서비스를 찾을 수 없습니다"));
        
        serviceList.setName(request.getName());
        serviceList.setDisplayName(request.getDisplayName());
        serviceList.setIsActive(request.getIsActive());
        
        ServiceList updated = serviceListRepository.save(serviceList);
        log.info("서비스 수정: {}", updated.getName());
        return ResponseEntity.ok(updated);
    }
    
    /**
     * 서비스 리스트 삭제
     */
    @Operation(summary = "서비스 삭제", description = "ADMIN 전용: 클라우드 서비스 삭제")
    @DeleteMapping("/services/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        serviceListRepository.deleteById(id);
        log.info("서비스 삭제: ID {}", id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * 모든 서비스 리스트 조회
     */
    @Operation(summary = "서비스 목록 조회", description = "ADMIN 전용: 모든 서비스 목록 조회")
    @GetMapping("/services")
    public ResponseEntity<List<ServiceList>> getAllServices() {
        return ResponseEntity.ok(serviceListRepository.findAll());
    }
    
    /**
     * 전체 사용자 목록 조회
     */
    @Operation(summary = "사용자 목록 조회", description = "ADMIN 전용: 전체 사용자 목록 조회")
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        log.info("사용자 목록 조회 요청");
        return ResponseEntity.ok(userRepository.findAll());
    }
}