package com.ksj.clouddoctorweb.controller;

import com.ksj.clouddoctorweb.dto.ServiceListResponse;
import com.ksj.clouddoctorweb.dto.ChecklistResponse;
import com.ksj.clouddoctorweb.dto.GuidelineLinkRequest;
import com.ksj.clouddoctorweb.entity.*;
import com.ksj.clouddoctorweb.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Cloud Doctor API v1 컨트롤러
 * 프론트엔드에서 필요한 데이터를 제공하는 REST API
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Log4j2
@Tag(name = "공개 API", description = "비회원도 접근 가능한 공개 API")
public class ApiController {
    
    private final CloudProviderRepository cloudProviderRepository;
    private final ServiceListRepository serviceListRepository;
    private final GuidelineRepository guidelineRepository;
    private final ChecklistRepository checklistRepository;
    private final UserChecklistResultRepository userChecklistResultRepository;
    private final UserRepository userRepository;
    private final GuidelineLinkRepository guidelineLinkRepository;
    
    /**
     * 활성화된 클라우드 제공업체 목록 조회
     * @return 클라우드 제공업체 리스트
     */
    @Operation(summary = "클라우드 제공업체 목록", description = "AWS, GCP, Azure 등 활성화된 클라우드 제공업체 목록 조회")
    @GetMapping("/providers")
    public List<CloudProvider> getProviders() {
        log.info("클라우드 제공업체 목록 조회 요청");
        return cloudProviderRepository.findByIsActiveTrue();
    }
    
    /**
     * 특정 클라우드 제공업체의 서비스 리스트 조회
     * @param providerId 클라우드 제공업체 ID
     * @return 서비스 리스트
     */
    @Operation(summary = "제공업체별 서비스 목록", description = "특정 클라우드 제공업체의 서비스 목록 (EC2, RDS 등)")
    @GetMapping("/services/provider/{providerId}")
    public List<ServiceListResponse> getServicesByProvider(@PathVariable Long providerId) {
        log.info("클라우드 제공업체 ID {} 의 서비스 조회 요청", providerId);
        List<ServiceList> services = serviceListRepository.findByCloudProviderIdAndIsActiveTrue(providerId);
        return services.stream()
            .map(ServiceListResponse::from)
            .toList();
    }
    
    /**
     * 전체 가이드라인 목록 조회
     * @return 가이드라인 리스트
     */
    @Operation(summary = "가이드라인 목록", description = "전체 보안 가이드라인 목록 조회")
    @GetMapping("/guidelines")
    public List<Map<String, Object>> getGuidelines() {
        log.info("가이드라인 목록 조회 요청");
        List<Guideline> guidelines = guidelineRepository.findAllByOrderByIdAsc();
        List<Map<String, Object>> responses = new ArrayList<>();
        
        for (Guideline guideline : guidelines) {
            Map<String, Object> response = new HashMap<>();
            response.put("id", guideline.getId());
            response.put("title", guideline.getTitle());
            response.put("importanceLevel", guideline.getImportanceLevel());
            response.put("whyDangerous", guideline.getWhyDangerous());
            response.put("whatHappens", guideline.getWhatHappens());
            response.put("checkStandard", guideline.getCheckStandard());
            response.put("solutionText", guideline.getSolutionText());
            response.put("sideEffects", guideline.getSideEffects());
            response.put("note", guideline.getNote());
            response.put("createdAt", guideline.getCreatedAt());
            
            // 링크 조회
            List<GuidelineLink> links = guidelineLinkRepository.findByGuidelineId(guideline.getId());
            List<GuidelineLinkRequest> linkDtos = links.stream()
                .map(link -> new GuidelineLinkRequest(link.getTitle(), link.getUrl()))
                .toList();
            response.put("links", linkDtos);
            
            responses.add(response);
        }
        
        return responses;
    }
    
    /**
     * 특정 서비스의 가이드라인 조회
     * @param serviceId 서비스 ID
     * @return 가이드라인 리스트
     */
    @Operation(summary = "서비스별 가이드라인", description = "특정 서비스의 보안 가이드라인 목록")
    @GetMapping("/guidelines/service/{serviceId}")
    public List<Map<String, Object>> getGuidelinesByService(@PathVariable Long serviceId) {
        log.info("서비스 ID {} 의 가이드라인 조회 요청", serviceId);
        List<Guideline> guidelines = guidelineRepository.findByServiceListIdOrderByIdAsc(serviceId);
        List<Map<String, Object>> responses = new ArrayList<>();
        
        for (Guideline guideline : guidelines) {
            Map<String, Object> response = new HashMap<>();
            response.put("id", guideline.getId());
            response.put("title", guideline.getTitle());
            response.put("importanceLevel", guideline.getImportanceLevel());
            response.put("whyDangerous", guideline.getWhyDangerous());
            response.put("whatHappens", guideline.getWhatHappens());
            response.put("checkStandard", guideline.getCheckStandard());
            response.put("solutionText", guideline.getSolutionText());
            response.put("sideEffects", guideline.getSideEffects());
            response.put("note", guideline.getNote());
            response.put("createdAt", guideline.getCreatedAt());
            
            // 링크 조회
            List<GuidelineLink> links = guidelineLinkRepository.findByGuidelineId(guideline.getId());
            List<GuidelineLinkRequest> linkDtos = links.stream()
                .map(link -> new GuidelineLinkRequest(link.getTitle(), link.getUrl()))
                .toList();
            response.put("links", linkDtos);
            
            responses.add(response);
        }
        
        return responses;
    }
    
    /**
     * 특정 가이드라인의 체크리스트 조회
     * @param guidelineId 가이드라인 ID
     * @return 체크리스트 리스트
     */
    @Operation(summary = "가이드라인별 체크리스트", description = "특정 가이드라인의 체크리스트 항목 목록")
    @GetMapping("/checklists/guideline/{guidelineId}")
    public List<Checklist> getChecklistsByGuideline(@PathVariable Long guidelineId) {
        log.info("가이드라인 ID {} 의 체크리스트 조회 요청", guidelineId);
        return checklistRepository.findByGuidelineIdAndIsActiveTrue(guidelineId);
    }
    
    /**
     * 사용자의 체크리스트 결과 목록 조회
     * @param userId 사용자 ID
     * @return 사용자 체크리스트 결과 리스트
     */
    @Operation(summary = "사용자 체크리스트 결과", description = "사용자가 저장한 체크리스트 점검 결과 목록")
    @GetMapping("/user-checklists/{userId}")
    public List<UserChecklistResult> getUserChecklists(@PathVariable Long userId) {
        log.info("사용자 ID {} 의 체크리스트 결과 조회 요청", userId);
        return userChecklistResultRepository.findByUserId(userId);
    }
    
    /**
     * 내 External ID 조회 (로그인 필수)
     */
    @Operation(summary = "내 External ID 조회", description = "AWS STS Cross Account용 내 External ID 조회")
    @GetMapping("/my-external-id")
    public ResponseEntity<Map<String, String>> getMyExternalId(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        Map<String, String> result = new HashMap<>();
        result.put("externalId", user.getExternalId());
        result.put("username", user.getUsername());
        return ResponseEntity.ok(result);
    }
    
    /**
     * 체크리스트 전체 조회 (사용자용)
     */
    @Operation(summary = "체크리스트 전체 조회", description = "사용자용: 모든 체크리스트 조회")
    @GetMapping("/checklists")
    public ResponseEntity<List<ChecklistResponse>> getAllChecklists() {
        List<Checklist> checklists = checklistRepository.findAllActiveOrderedByProviderServiceGuideline();
        List<ChecklistResponse> responses = checklists.stream()
            .map(ChecklistResponse::from)
            .toList();
        return ResponseEntity.ok(responses);
    }
    
    /**
     * 특정 서비스의 체크리스트 조회
     */
    @Operation(summary = "서비스별 체크리스트 조회", description = "특정 서비스의 체크리스트 조회")
    @GetMapping("/checklists/service/{providerId}/{serviceId}")
    public ResponseEntity<List<ChecklistResponse>> getChecklistsByService(
            @PathVariable Long providerId, 
            @PathVariable Long serviceId) {
        List<Checklist> checklists = checklistRepository.findByCloudProviderIdAndServiceListIdAndIsActiveTrue(providerId, serviceId);
        List<ChecklistResponse> responses = checklists.stream()
            .map(ChecklistResponse::from)
            .toList();
        return ResponseEntity.ok(responses);
    }
}