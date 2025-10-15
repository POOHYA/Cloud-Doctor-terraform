-- ===========================================
-- 1. ENUM 타입 생성
-- ===========================================
CREATE TYPE user_role_t AS ENUM ('USER', 'ADMIN');
CREATE TYPE importance_level_t AS ENUM ('HIGH', 'MEDIUM', 'LOW');
CREATE TYPE checklist_status_t AS ENUM ('unchecked', 'checked');

-- ===========================================
-- 2. users (회원)
--  - 애플리케이션에서 회원가입 시 role = 'USER' 기본
--  - 관리자 생성/권한 관리는 애플리케이션에서 제어 권장
-- ===========================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt/scrypt 등 해시 저장
    full_name VARCHAR(150),
    company VARCHAR(150),
    role user_role_t NOT NULL DEFAULT 'USER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===========================================
-- 3. auth_tokens (토큰 저장소)
--  - JWT 자체는 애플리케이션에서 발행. 리프레시 토큰/세션 토큰 보관용.
-- ===========================================
CREATE TABLE auth_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL, -- 안전을 위해 토큰은 해시 저장 가능
    token_type VARCHAR(50) NOT NULL DEFAULT 'refresh', -- refresh / session 등
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked BOOLEAN NOT NULL DEFAULT FALSE
);

-- ===========================================
-- 4. servicelists (클라우드 제공자 -> 서비스, ex: AWS / EC2)
--  - cloud_provider: AWS, GCP, AZURE ...
--  - name: EC2, S3, Compute Engine ...
--  - UNIQUE cloud_provider + name
-- ===========================================
CREATE TABLE servicelists (
    id BIGSERIAL PRIMARY KEY,
    cloud_provider VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT uniq_provider_name UNIQUE (cloud_provider, name)
);

-- ===========================================
-- 5. guides (가이드라인) - 관리자만 생성/수정/삭제 (애플리케이션 권한 검증)
--  - one servicelist -> many guides
--  - guide has title, importance_level, 상세 필드, solution 관련(이미지/링크 별도 테이블)
-- ===========================================
CREATE TABLE guides (
    id BIGSERIAL PRIMARY KEY,
    servicelist_id BIGINT NOT NULL REFERENCES servicelists(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    cloud_provider VARCHAR(50) NOT NULL, -- 중복 정보지만 프론트 필터용으로 보존 가능
    importance_level importance_level_t NOT NULL DEFAULT 'MEDIUM',
    detailed_description_why TEXT,
    detailed_description_how_to_cause TEXT,
    detailed_description_check_standard TEXT,
    solution_text TEXT, -- 조치 방안 텍스트(이미지는 guide_images에 저장)
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT uniq_guide_title_per_service UNIQUE (servicelist_id, title)
);

-- ===========================================
-- 6. guide_links (가이드라인별 다중 링크)
-- ===========================================
CREATE TABLE guide_links (
    id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===========================================
-- 7. guide_images (가이드라인 조치 방안 등에서 여러 이미지 보관)
--  - 실제 이미지는 S3/GCS 같은 외부 스토리지에 저장하고 URL을 보관 권장
-- ===========================================
CREATE TABLE guide_images (
    id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===========================================
-- 8. checklist_templates (관리자가 가이드라인 하위로 생성하는 체크리스트 항목)
--  - 하나의 guide는 여러 checklist_templates 를 가질 수 있음
--  - 템플릿 항목은 제목만 요구(요구에 맞게)
-- ===========================================
CREATE TABLE checklist_templates (
    id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT uniq_template_title_per_guide UNIQUE (guide_id, title)
);

-- ===========================================
-- 9. user_checklists (사용자가 생성/저장하는 체크리스트 '인스턴스')
--  - 사용자는 관리자가 만든 템플릿을 기반으로 개인 체크리스트 인스턴스를 생성
--  - title은 사용자가 붙일 수 있고, template 기반이면 template_reference 컬럼에 값 유지
-- ===========================================
CREATE TABLE user_checklists (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL, -- 예: "2025-10-14 일일 점검"
    template_based BOOLEAN NOT NULL DEFAULT TRUE,
    template_reference BIGINT, -- optional: 어떤 checklist_template 를 기준으로 만들었는지
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_template_reference FOREIGN KEY (template_reference) REFERENCES checklist_templates(id) ON DELETE SET NULL
);

-- ===========================================
-- 10. user_checklist_items (사용자 인스턴스의 항목별 상태)
--  - 각 항목은 checklist_templates 와 연결되어 있어야함(템플릿 기반)
--  - status, note, image(s) 가능 (이미지는 별도 테이블로 관리)
--  - UNIQUE(user_checklist_id, checklist_template_id) 으로 중복 방지
-- ===========================================
CREATE TABLE user_checklist_items (
    id BIGSERIAL PRIMARY KEY,
    user_checklist_id BIGINT NOT NULL REFERENCES user_checklists(id) ON DELETE CASCADE,
    checklist_template_id BIGINT NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
    status checklist_status_t NOT NULL DEFAULT 'unchecked',
    note TEXT,
    checked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT uniq_user_checklist_item UNIQUE (user_checklist_id, checklist_template_id)
);

-- ===========================================
-- 11. user_checklist_item_images (사용자가 저장하는 항목별 이미지)
--  - 이미지 URL 보관(파일은 외부 저장소 추천)
-- ===========================================
CREATE TABLE user_checklist_item_images (
    id BIGSERIAL PRIMARY KEY,
    user_checklist_item_id BIGINT NOT NULL REFERENCES user_checklist_items(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===========================================
-- 12. 인덱스 및 성능 보완
-- ===========================================
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_servicelists_provider ON servicelists(cloud_provider);
CREATE INDEX idx_guides_service ON guides(servicelist_id);
CREATE INDEX idx_checklist_templates_guide ON checklist_templates(guide_id);
CREATE INDEX idx_user_checklists_user ON user_checklists(user_id);
CREATE INDEX idx_user_checklist_items_uc ON user_checklist_items(user_checklist_id);
CREATE INDEX idx_user_checklist_items_template ON user_checklist_items(checklist_template_id);

-- ===========================================
-- 13. 예시 제약/트리거: updated_at 자동 갱신 트리거 (공통)
-- ===========================================
-- function to set updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- attach trigger to tables that have updated_at
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_servicelists_updated_at
BEFORE UPDATE ON servicelists
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_guides_updated_at
BEFORE UPDATE ON guides
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_checklist_templates_updated_at
BEFORE UPDATE ON checklist_templates
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_user_checklists_updated_at
BEFORE UPDATE ON user_checklists
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_user_checklist_items_updated_at
BEFORE UPDATE ON user_checklist_items
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ===========================================
-- End of DDL
-- ===========================================