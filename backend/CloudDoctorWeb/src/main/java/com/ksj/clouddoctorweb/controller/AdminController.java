package com.ksj.clouddoctorweb.controller;

import com.ksj.clouddoctorweb.dto.GuidelineRequest;
import com.ksj.clouddoctorweb.dto.ServiceListRequest;
import com.ksj.clouddoctorweb.dto.ServiceListResponse;
import com.ksj.clouddoctorweb.entity.*;
import com.ksj.clouddoctorweb.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    private final GuidelineRepository guidelineRepository;
    
    /**
     * 서비스 리스트 생성
     */
    @Operation(summary = "서비스 생성", description = "ADMIN 전용: 클라우드 서비스 생성 (EC2, RDS 등)")
    @PostMapping("/services")
    public ResponseEntity<ServiceListResponse> createService(@RequestBody ServiceListRequest request,
                                                   Authentication authentication) {
        log.info("서비스 생성 요청: cloudProviderId={}, name={}, displayName={}", 
                 request.getCloudProviderId(), request.getName(), request.getDisplayName());
        
        // 필수 필드 검증
        if (request.getCloudProviderId() == null) {
            throw new RuntimeException("클라우드 제공업체 ID가 필요합니다");
        }
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("서비스 이름이 필요합니다");
        }
        // displayName이 없으면 name 사용
        String displayName = (request.getDisplayName() == null || request.getDisplayName().trim().isEmpty()) 
            ? request.getName().trim() 
            : request.getDisplayName().trim();
        
        CloudProvider provider = cloudProviderRepository.findById(request.getCloudProviderId())
            .orElseThrow(() -> new RuntimeException("클라우드 제공업체를 찾을 수 없습니다: " + request.getCloudProviderId()));
        
        User admin = userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new RuntimeException("관리자를 찾을 수 없습니다"));
        
        // 중복 서비스 이름 체크
        if (serviceListRepository.existsByCloudProviderIdAndName(request.getCloudProviderId(), request.getName().trim())) {
            throw new RuntimeException("이미 존재하는 서비스 이름입니다: " + request.getName());
        }
        
        ServiceList serviceList = new ServiceList();
        serviceList.setCloudProvider(provider);
        serviceList.setName(request.getName().trim());
        serviceList.setDisplayName(displayName);
        serviceList.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        serviceList.setCreatedBy(admin);
        
        ServiceList saved = serviceListRepository.save(serviceList);
        log.info("서비스 생성 성공: {} - {} (관리자: {})", provider.getName(), saved.getName(), admin.getUsername());
        return ResponseEntity.ok(ServiceListResponse.from(saved));
    }
    
    /**
     * 서비스 리스트 수정
     */
    @Operation(summary = "서비스 수정", description = "ADMIN 전용: 클라우드 서비스 정보 수정")
    @PutMapping("/services/{id}")
    public ResponseEntity<ServiceListResponse> updateService(@PathVariable Long id, 
                                                   @RequestBody ServiceListRequest request,
                                                   Authentication authentication) {
        ServiceList serviceList = serviceListRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("서비스를 찾을 수 없습니다"));
        
        serviceList.setName(request.getName());
        serviceList.setDisplayName(request.getDisplayName());
        serviceList.setIsActive(request.getIsActive());
        
        ServiceList updated = serviceListRepository.save(serviceList);
        log.info("서비스 수정: {}", updated.getName());
        return ResponseEntity.ok(ServiceListResponse.from(updated));
    }
    
    /**
     * 서비스 리스트 삭제
     */
    @Operation(summary = "서비스 삭제", description = "ADMIN 전용: 클라우드 서비스 삭제")
    @DeleteMapping("/services/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id,
                                            Authentication authentication) {
        serviceListRepository.deleteById(id);
        log.info("서비스 삭제: ID {}", id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * 모든 서비스 리스트 조회
     */
    @Operation(summary = "서비스 목록 조회", description = "ADMIN 전용: 모든 서비스 목록 조회")
    @GetMapping("/services")
    public ResponseEntity<List<ServiceListResponse>> getAllServices() {
        List<ServiceList> services = serviceListRepository.findAll();
        List<ServiceListResponse> responses = services.stream()
            .map(ServiceListResponse::from)
            .toList();
        return ResponseEntity.ok(responses);
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
    
    /**
     * 가이드라인 생성
     */
    @Operation(summary = "가이드라인 생성", description = "ADMIN 전용: 보안 가이드라인 생성")
    @PostMapping("/guidelines")
    public ResponseEntity<Guideline> createGuideline(@RequestBody GuidelineRequest request,
                                                   Authentication authentication) {
        log.info("가이드라인 생성 요청: title={}", request.getTitle());
        
        CloudProvider provider = cloudProviderRepository.findById(request.getCloudProviderId())
            .orElseThrow(() -> new RuntimeException("클라우드 제공업체를 찾을 수 없습니다"));
        
        ServiceList serviceList = serviceListRepository.findById(request.getServiceListId())
            .orElseThrow(() -> new RuntimeException("서비스를 찾을 수 없습니다"));
        
        User admin = userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new RuntimeException("관리자를 찾을 수 없습니다"));
        
        Guideline guideline = new Guideline();
        guideline.setTitle(request.getTitle());
        guideline.setCloudProvider(provider);
        guideline.setServiceList(serviceList);
        // 한글 중요도 직접 저장 (DB constraint에 맞춤)
        guideline.setImportanceLevelString(request.getImportanceLevel());
        guideline.setWhyDangerous(request.getWhyDangerous());
        guideline.setWhatHappens(request.getWhatHappens());
        guideline.setCheckStandard(request.getCheckStandard());
        guideline.setSolutionText(request.getSolutionText());
        guideline.setSideEffects(request.getSideEffects());
        guideline.setNote(request.getNote());
        guideline.setCreatedBy(admin);
        
        Guideline saved = guidelineRepository.save(guideline);
        
        // 링크 처리
        if (request.getLinks() != null && !request.getLinks().isEmpty()) {
            for (String url : request.getLinks()) {
                if (url != null && !url.trim().isEmpty()) {
                    GuidelineLink link = new GuidelineLink();
                    link.setGuideline(saved);
                    link.setUrl(url.trim());
                    // GuidelineLink 저장 로직 추가 필요
                }
            }
        }
        
        log.info("가이드라인 생성 성공: {}", saved.getTitle());
        return ResponseEntity.ok(saved);
    }
    
    /**
     * 가이드라인 삭제
     */
    @Operation(summary = "가이드라인 삭제", description = "ADMIN 전용: 가이드라인 삭제")
    @DeleteMapping("/guidelines/{id}")
    public ResponseEntity<Void> deleteGuideline(@PathVariable Long id) {
        guidelineRepository.deleteById(id);
        log.info("가이드라인 삭제: ID {}", id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * 사용자 External ID 조회
     */
    @Operation(summary = "사용자 External ID 조회", description = "ADMIN 전용: AWS STS Cross Account용 External ID 조회")
    @GetMapping("/users/{userId}/external-id")
    public ResponseEntity<Map<String, String>> getUserExternalId(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        Map<String, String> result = new HashMap<>();
        result.put("externalId", user.getExternalId());
        result.put("username", user.getUsername());
        return ResponseEntity.ok(result);
    }
}