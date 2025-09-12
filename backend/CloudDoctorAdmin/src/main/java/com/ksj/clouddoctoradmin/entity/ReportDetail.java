package com.ksj.clouddoctoradmin.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reports_detail")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ReportDetail {

    @Id
    @Column(name = "reports_detail_id", nullable = false)
    private Long id;

    @Column(name = "reports_id", nullable = false)
    private Long reportId;

    @Column(name = "security_log_name", nullable = false, length = 200)
    private String logName;

    @Column(name = "security_log_level", nullable = false, length = 10)
    private String logLevel;

    @Column(name = "security_log_comment", nullable = false, length = 2000)
    private String logComment;
}
