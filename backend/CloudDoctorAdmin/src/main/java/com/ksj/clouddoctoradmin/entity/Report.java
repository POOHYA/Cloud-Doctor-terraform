package com.ksj.clouddoctoradmin.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reports")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Report {

    @Id
    @Column(name = "reports_id", nullable = false)
    private Long id;

    @Column(name = "customers_id", nullable = false)
    private Long customerId;

    @Column(name = "admins_id", nullable = false)
    private Long adminId;

    @Column(name = "terraform_id", nullable = false)
    private Long terraformId;

    @Column(name = "Ansible_id", nullable = false)
    private Long ansibleId;

    @Column(name = "reports_name", nullable = false, length = 100)
    private String name;

    @Column(name = "reports_type", nullable = false)
    private Boolean type;
}
