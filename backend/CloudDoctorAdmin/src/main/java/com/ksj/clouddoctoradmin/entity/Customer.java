package com.ksj.clouddoctoradmin.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Customer {

    @Id
    @Column(name = "customers_id", nullable = false)
    private Long id;

    @Column(name = "users_id", nullable = false)
    private Long userId;

    @Column(name = "users_email", nullable = false, length = 100)
    private String email;

    @Column(name = "company_name", nullable = false, length = 100)
    private String companyName;

    @Column(name = "modified_at", nullable = false)
    private LocalDateTime modifiedAt;
}
