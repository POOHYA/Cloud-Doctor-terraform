package com.ksj.clouddoctoradmin.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @Column(name = "users_id", nullable = false)
    private Long id;

    @Column(nullable = false)
    private Boolean role;

    @Column(name = "users_name", nullable = false, length = 200)
    private String name;

    @Column(name = "users_email", nullable = false, length = 1000)
    private String email;

    @Column(name = "users_password", nullable = false, length = 500)
    private String password;

    @Column(name = "MFA", nullable = false)
    private Integer mfa;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;
}
