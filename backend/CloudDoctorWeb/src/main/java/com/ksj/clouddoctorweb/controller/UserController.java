package com.ksj.clouddoctorweb.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ksj.clouddoctorweb.dto.ChangePasswordRequest;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

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
    
    @Operation(summary = "내 정보 조회", description = "로그인한 사용자의 정보 조회")
    @GetMapping("/me")
    public ResponseEntity<User> getMyInfo(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        return ResponseEntity.ok(user);
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
}
