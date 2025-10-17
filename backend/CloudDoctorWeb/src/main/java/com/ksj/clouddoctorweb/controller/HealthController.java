package com.ksj.clouddoctorweb.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * ALB 헬스체크용 컨트롤러
 */
@RestController
@Log4j2
@Tag(name = "헬스체크", description = "ALB 헬스체크 및 서버 상태 확인 API")
public class HealthController {
    
    @Operation(summary = "헬스체크", description = "ALB 헬스체크용 엔드포인트 (80/443 포트)")
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "CloudDoctor");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(response);
    }
    
    @Operation(summary = "루트 헬스체크", description = "루트 경로 헬스체크")
    @GetMapping("/")
    public ResponseEntity<Map<String, String>> root() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "CloudDoctor API Server");
        response.put("status", "Running");
        return ResponseEntity.ok(response);
    }
}