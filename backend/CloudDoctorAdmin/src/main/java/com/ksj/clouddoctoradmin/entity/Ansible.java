package com.ksj.clouddoctoradmin.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ansible")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Ansible {

    @Id
    @Column(name = "Ansible_id", nullable = false)
    private Long id;

    @Column(name = "customers_id", nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private Boolean reset;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;
}
