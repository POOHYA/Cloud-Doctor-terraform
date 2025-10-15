package com.ksj.clouddoctorweb.repository;

import com.ksj.clouddoctorweb.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUserId(Long userId);
    void deleteByExpiresAtBefore(LocalDateTime now);
}