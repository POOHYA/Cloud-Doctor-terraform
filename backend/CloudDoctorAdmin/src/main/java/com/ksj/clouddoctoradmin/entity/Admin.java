package com.ksj.clouddoctoradmin.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "admins")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Admin {

    @Id
    @Column(name = "admins_id", nullable = false)
    private Long id;

    @Column(name = "users_id", nullable = false)
    private Long userId;

    @Column(name = "users_email", nullable = false, length = 100)
    private String email;
}
