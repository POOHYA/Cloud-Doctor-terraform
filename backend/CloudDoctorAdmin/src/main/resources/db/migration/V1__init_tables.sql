CREATE TABLE "ansible" (
	"Ansible_id"	bigint		NOT NULL,
	"customers_id"	bigint		NOT NULL,
	"reset"	boolean		NOT NULL,
	"created_at"	timestamp		NOT NULL,
	"expired_at"	timestamp		NOT NULL
);

CREATE TABLE "users" (
	"users_id"	bigint		NOT NULL,
	"role"	boolean		NOT NULL,
	"users_name"	varchar(200)		NOT NULL,
	"users_email"	varchar(1000)		NOT NULL,
	"users_password"	varchar(500)		NOT NULL,
	"MFA"	int		NOT NULL,
	"created_at"	timestamp		NOT NULL,
	"expired_at"	timestamp		NOT NULL
);

CREATE TABLE "customers" (
	"customers_id"	bigint		NOT NULL,
	"users_id"	bigint		NOT NULL,
	"users_email"	varchar(100)		NOT NULL,
	"company_name"	varchar(100)		NOT NULL,
	"modified_at"	timestamp		NOT NULL
);

CREATE TABLE "terraform" (
	"terraform_id"	bigint		NOT NULL,
	"customers_id"	bigint		NOT NULL,
	"reset"	boolean		NOT NULL,
	"created_at"	timestamp		NOT NULL,
	"expired_at"	timestamp		NOT NULL
);

CREATE TABLE "reports" (
	"reports_id"	bigint		NOT NULL,
	"customers_id"	bigint		NOT NULL,
	"admins_id"	bigint		NOT NULL,
	"terraform_id"	bigint		NOT NULL,
	"Ansible_id"	bigint		NOT NULL,
	"reports_name"	varchar(100)		NOT NULL,
	"reports_type"	boolean		NOT NULL
);

CREATE TABLE "reports_detail" (
	"reports_detail_id"	bigint		NOT NULL,
	"reports_id"	bigint		NOT NULL,
	"security_log_name"	varchar(200)		NOT NULL,
	"security_log_level"	varchar(10)		NOT NULL,
	"security_log_comment"	varchar(2000)		NOT NULL
);

CREATE TABLE "admins" (
	"admins_id"	bigint		NOT NULL,
	"users_id"	bigint		NOT NULL,
	"users_email"	varchar(100)		NOT NULL
);

ALTER TABLE "ansible" ADD CONSTRAINT "PK_ANSIBLE" PRIMARY KEY (
	"Ansible_id"
);

ALTER TABLE "users" ADD CONSTRAINT "PK_USERS" PRIMARY KEY (
	"users_id"
);

ALTER TABLE "customers" ADD CONSTRAINT "PK_CUSTOMERS" PRIMARY KEY (
	"customers_id"
);

ALTER TABLE "terraform" ADD CONSTRAINT "PK_TERRAFORM" PRIMARY KEY (
	"terraform_id"
);

ALTER TABLE "reports" ADD CONSTRAINT "PK_REPORTS" PRIMARY KEY (
	"reports_id"
);

ALTER TABLE "reports_detail" ADD CONSTRAINT "PK_REPORTS_DETAIL" PRIMARY KEY (
	"reports_detail_id"
);

ALTER TABLE "admins" ADD CONSTRAINT "PK_ADMINS" PRIMARY KEY (
	"admins_id"
);

