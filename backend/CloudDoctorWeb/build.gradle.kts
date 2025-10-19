plugins {
    java
    id("org.springframework.boot") version "3.3.6"                              // springdoc-openapi-starter-webmvc-ui:2.2.0 라이브러리가 Spring Boot 3.5.x (Spring Framework 6.2.x) 와 완전히 호환 안되는 이슈로 다운그레이드
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.ksj"
version = "0.0.1-SNAPSHOT"
description = "CloudDoctorWeb"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
    all {
        exclude(group = "org.springframework.boot", module = "spring-boot-starter-logging")
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.2.0")          // Swagger 추가, springdoc-openapi-starter-webmvc-ui:2.3.0 라이브러리가 Spring Boot 3.5.x (Spring Framework 6.2.x) 와 완전히 호환 안되는 이슈로 다운그레이드
    implementation("org.springframework.boot:spring-boot-starter-log4j2")             // Log4j2 추가
    implementation("io.jsonwebtoken:jjwt-api:0.12.3")                               // JWT API
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.3")                                 // JWT 구현체
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.3")                              // JWT Jackson
    implementation("software.amazon.awssdk:s3:2.21.29")                             // AWS S3 SDK
    implementation("software.amazon.awssdk:url-connection-client:2.21.29")           // AWS URL Connection Client
    compileOnly("org.projectlombok:lombok")
    runtimeOnly("io.micrometer:micrometer-registry-prometheus")
    runtimeOnly("org.postgresql:postgresql")
    annotationProcessor("org.projectlombok:lombok")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
