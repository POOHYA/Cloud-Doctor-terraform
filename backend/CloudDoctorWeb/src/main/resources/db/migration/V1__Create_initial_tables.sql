-- Users table (회원가입)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    company VARCHAR(150),
    role VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    external_id VARCHAR(100) UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP
);

-- Refresh tokens table (JWT 리프레시 토큰 저장) / Access token은 stateless하므로 DB에 저장하지 않음 - Redis 사용
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, token)
);

-- Cloud providers table (AWS, GCP, Azure)
CREATE TABLE cloud_providers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service lists table (관리자가 프론트에서 생성: EC2, RDS 등)
CREATE TABLE service_lists (
    id BIGSERIAL PRIMARY KEY,
    cloud_provider_id BIGINT NOT NULL REFERENCES cloud_providers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL REFERENCES users(id),
    UNIQUE(cloud_provider_id, name)
);

-- Guidelines table (관리자가 생성)
CREATE TABLE guidelines (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    cloud_provider_id BIGINT NOT NULL REFERENCES cloud_providers(id),
    service_list_id BIGINT NOT NULL REFERENCES service_lists(id),
    importance_level VARCHAR(20) NOT NULL CHECK (importance_level IN ('확인요망', '중요', '긴급')),
    why_dangerous TEXT NOT NULL,
    what_happens TEXT NOT NULL,
    check_standard TEXT, -- 점검 기준
    solution_text TEXT, -- 조치 방안 텍스트(이미지는 guide_images에 저장)
    side_effects TEXT, -- 부작용
    note TEXT, -- 비고
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL REFERENCES users(id)
);

-- Guideline solution images table (조치방안 여러 이미지)
CREATE TABLE guideline_solution_images (
    id BIGSERIAL PRIMARY KEY,
    guideline_id BIGINT NOT NULL REFERENCES guidelines(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Guideline links table (가이드라인별 여러 링크)
CREATE TABLE guideline_links (
    id BIGSERIAL PRIMARY KEY,
    guideline_id BIGINT NOT NULL REFERENCES guidelines(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title VARCHAR(200),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Checklists table (관리자가 가이드라인 하위에 생성, 제목만)
CREATE TABLE checklists (
    id BIGSERIAL PRIMARY KEY,
    guideline_id BIGINT NOT NULL REFERENCES guidelines(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL REFERENCES users(id)
);

-- User checklist results table (사용자가 저장하는 점검 결과지)
CREATE TABLE user_checklist_results (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    result_name VARCHAR(200) NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completion_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User checklist items results table (점검 결과지의 개별 체크리스트 항목)
CREATE TABLE user_checklist_item_results (
    id BIGSERIAL PRIMARY KEY,
    user_checklist_result_id BIGINT NOT NULL REFERENCES user_checklist_results(id) ON DELETE CASCADE,
    checklist_id BIGINT NOT NULL REFERENCES checklists(id),
    is_checked BOOLEAN DEFAULT false,
    notes TEXT,
    checked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial cloud providers
INSERT INTO cloud_providers (name, display_name) VALUES
('AWS', 'Amazon Web Services'),
('GCP', 'Google Cloud Platform'),
('Azure', 'Microsoft Azure');

-- Create indexes
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
CREATE INDEX idx_service_lists_cloud_provider ON service_lists(cloud_provider_id);
CREATE INDEX idx_service_lists_created_by ON service_lists(created_by);
CREATE INDEX idx_guidelines_cloud_provider ON guidelines(cloud_provider_id);
CREATE INDEX idx_guidelines_service_list ON guidelines(service_list_id);
CREATE INDEX idx_guidelines_created_by ON guidelines(created_by);
CREATE INDEX idx_guideline_solution_images_guideline ON guideline_solution_images(guideline_id);
CREATE INDEX idx_guideline_links_guideline ON guideline_links(guideline_id);
CREATE INDEX idx_checklists_guideline ON checklists(guideline_id);
CREATE INDEX idx_checklists_created_by ON checklists(created_by);
CREATE INDEX idx_user_checklist_results_user ON user_checklist_results(user_id);
CREATE INDEX idx_user_checklist_item_results_result ON user_checklist_item_results(user_checklist_result_id);
CREATE INDEX idx_user_checklist_item_results_checklist ON user_checklist_item_results(checklist_id);
CREATE INDEX idx_users_external_id ON users(external_id);