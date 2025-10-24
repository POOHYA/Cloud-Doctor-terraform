package com.ksj.clouddoctorweb.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ksj.clouddoctorweb.dto.ChangePasswordRequest;
import com.ksj.clouddoctorweb.dto.InfraAuditRequest;
import com.ksj.clouddoctorweb.dto.SaveChecklistRequest;
import com.ksj.clouddoctorweb.entity.User;
import com.ksj.clouddoctorweb.entity.UserChecklistResult;
import com.ksj.clouddoctorweb.repository.UserChecklistResultRepository;
import com.ksj.clouddoctorweb.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Log4j2
@Tag(name = "사용자", description = "사용자 정보 관리 API")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserChecklistResultRepository checklistResultRepository;
    private final ObjectMapper objectMapper;
    
    @Value("${infraaudit.api.url}")
    private String infraauditApiUrl;
    
    @Operation(summary = "내 정보 조회", description = "로그인한 사용자의 정보 조회")
    @GetMapping("/me")
    public ResponseEntity<User> getMyInfo(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        return ResponseEntity.ok(user);
    }
    
    @Operation(summary = "내 UUID 조회", description = "AWS 인프라 점검용 External ID 조회")
    @GetMapping("/uuid")
    public ResponseEntity<String> getMyUuid(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        String externalId = "clouddoctor-" + user.getExternalId();
        return ResponseEntity.ok(externalId);
    }
    
    @Operation(summary = "인프라 보안 점검 시작", description = "AWS 인프라 보안 점검 시작 (UUID 검증 포함)")
    @PostMapping("/audit/start")
    public ResponseEntity<?> startInfraAudit(@RequestBody InfraAuditRequest request, Authentication authentication) {
        try {
            User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
            
            String expectedUuid = "clouddoctor-" + user.getExternalId();
            
            // UUID 일치 확인
            if (!expectedUuid.equals(request.getExternalId())) {
                log.warn("계정 불일치: expected={}, provided={}", expectedUuid, request.getExternalId());
                return ResponseEntity.badRequest().body(
                    "🔑 External ID가 일치하지 않습니다.\n" +
                    "• '확인&복사' 버튼을 눌러 올바른 UUID를 사용해주세요\n" +
                    "• AWS Role의 Trust Policy에 동일한 UUID가 설정되었는지 확인해주세요\n" +
                    "• 다른 계정의 UUID를 사용하고 있을 수 있습니다"
                );
            }
            
            // TODO: 진행 중인 점검 확인 로직 추가
            
            // Python infraaudit API 호출
            String pythonApiUrl = infraauditApiUrl + "/api/audit/start";
            
            // 요청 데이터 준비
            Map<String, Object> auditRequest = new HashMap<>();
            auditRequest.put("account_id", request.getAccountId());
            auditRequest.put("role_name", request.getRoleName());
            auditRequest.put("external_id", request.getExternalId());
            auditRequest.put("checks", request.getChecks());
            
            // HTTP 요청 전송
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(auditRequest, headers);
            
            log.info("파이썬 API 요청: URL={}, data={}", pythonApiUrl, auditRequest);
            
            ResponseEntity<String> pythonResponse = restTemplate.postForEntity(pythonApiUrl, entity, String.class);
            
            log.info("인프라 점검 시작 성공: user={}, accountId={}, response={}", 
                user.getUsername(), request.getAccountId(), pythonResponse.getBody());
            
            return ResponseEntity.ok(pythonResponse.getBody());
        } catch (Exception e) {
            log.error("인프라 점검 시작 실패", e);
            
            // 사용자 친화적인 에러 메시지로 변환
            String userFriendlyMessage = convertToUserFriendlyMessage(e.getMessage());
            return ResponseEntity.badRequest().body(userFriendlyMessage);
        }
    }
    
    @Operation(summary = "비밀번호 변경", description = "현재 비밀번호 확인 후 새 비밀번호로 변경")
    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordRequest request,
                                               Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("현재 비밀번호가 일치하지 않습니다");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        log.info("비밀번호 변경 완료: {}", user.getUsername());
        return ResponseEntity.ok().build();
    }
    
    @Operation(summary = "체크리스트 저장", description = "사용자의 체크리스트 결과 저장")
    @PostMapping("/checklist")
    public ResponseEntity<UserChecklistResult> saveChecklist(@RequestBody SaveChecklistRequest request,
                                                             Authentication authentication) {
        try {
            User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
            
            UserChecklistResult result = new UserChecklistResult();
            result.setUser(user);
            result.setResultName(request.getResultName());
            result.setNotes(objectMapper.writeValueAsString(request.getAnswers()));
            result.setIsCompleted(true);
            result.setCompletionDate(LocalDateTime.now());
            
            UserChecklistResult saved = checklistResultRepository.save(result);
            log.info("체크리스트 저장 완료: user={}, name={}", user.getUsername(), request.getResultName());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("체크리스트 저장 실패", e);
            throw new RuntimeException("체크리스트 저장에 실패했습니다");
        }
    }
    
    @Operation(summary = "내 체크리스트 목록 조회", description = "로그인한 사용자의 저장된 체크리스트 목록")
    @GetMapping("/checklists")
    public ResponseEntity<List<UserChecklistResult>> getMyChecklists(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        List<UserChecklistResult> results = checklistResultRepository.findByUserId(user.getId());
        return ResponseEntity.ok(results);
    }
    
    @Operation(summary = "체크리스트 상세 조회", description = "저장된 체크리스트 상세 정보")
    @GetMapping("/checklist/{id}")
    public ResponseEntity<UserChecklistResult> getChecklistDetail(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        UserChecklistResult result = checklistResultRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("체크리스트를 찾을 수 없습니다"));
        
        if (!result.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("권한이 없습니다");
        }
        
        return ResponseEntity.ok(result);
    }
    
    @Operation(summary = "체크리스트 수정", description = "저장된 체크리스트 수정")
    @PutMapping("/checklist/{id}")
    public ResponseEntity<UserChecklistResult> updateChecklist(@PathVariable Long id,
                                                               @RequestBody SaveChecklistRequest request,
                                                               Authentication authentication) {
        try {
            User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
            
            UserChecklistResult result = checklistResultRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("체크리스트를 찾을 수 없습니다"));
            
            if (!result.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("권한이 없습니다");
            }
            
            result.setResultName(request.getResultName());
            result.setNotes(objectMapper.writeValueAsString(request.getAnswers()));
            
            UserChecklistResult updated = checklistResultRepository.save(result);
            log.info("체크리스트 수정 완료: id={}", id);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("체크리스트 수정 실패", e);
            throw new RuntimeException("체크리스트 수정에 실패했습니다");
        }
    }
    
    /**
     * AWS 에러를 사용자 친화적인 메시지로 변환
     */
    private String convertToUserFriendlyMessage(String errorMessage) {
        if (errorMessage == null) {
            return "점검 시작에 실패했습니다.";
        }
        
        // AssumeRole 권한 부족
        if (errorMessage.contains("is not authorized to perform: sts:AssumeRole")) {
            return "🚫 AWS 역할 접근 권한이 없습니다.\n" +
                   "• AWS 계정 ID가 올바른지 확인해주세요\n" +
                   "• CloudDoctorAuditRole이 생성되었는지 확인해주세요\n" +
                   "• Trust Policy에 올바른 External ID가 설정되었는지 확인해주세요";
        }
        
        // 역할을 찾을 수 없음
        if (errorMessage.contains("NoSuchEntity") || errorMessage.contains("does not exist")) {
            return "🔍 CloudDoctorAuditRole을 찾을 수 없습니다.\n" +
                   "• AWS 계정 ID가 올바른지 확인해주세요\n" +
                   "• '점검계정 생성 가이드'를 참고하여 Role을 생성해주세요";
        }
        
        // External ID 불일치
        if (errorMessage.contains("ExternalId")) {
            return "🔑 External ID가 일치하지 않습니다.\n" +
                   "• '확인&복사' 버튼을 눌러 올바른 UUID를 사용해주세요\n" +
                   "• AWS Role의 Trust Policy에 동일한 UUID가 설정되었는지 확인해주세요";
        }
        
        // 일반적인 AWS 에러
        if (errorMessage.contains("AWS") || errorMessage.contains("Amazon")) {
            return "☁️ AWS 연결 오류가 발생했습니다.\n" +
                   "• 입력한 정보를 다시 한 번 확인해주세요\n" +
                   "• 잠시 후 다시 시도해주세요";
        }
        
        // 기본 메시지
        return "점검 시작에 실패했습니다. 입력 정보를 확인하고 다시 시도해주세요.";
    }
}
