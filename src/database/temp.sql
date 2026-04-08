-- =========================
-- COMPANIES
-- =========================
CREATE TABLE companies (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  cnpj VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- =========================
-- COMPANY_USERS
-- =========================
CREATE TABLE company_users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  role ENUM('owner','admin','viewer') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  UNIQUE (company_id, user_id),

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_company_users_company ON company_users(company_id);
CREATE INDEX idx_company_users_user ON company_users(user_id);

-- =========================
-- ACCOUNTS
-- =========================
CREATE TABLE accounts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('asset','expense','revenue') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  UNIQUE (id, company_id),
  UNIQUE (company_id, name),

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_accounts_company ON accounts(company_id);

-- =========================
-- PROJECTS
-- =========================
CREATE TABLE projects (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  UNIQUE (company_id, name),

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_projects_company ON projects(company_id);

-- =========================
-- TRANSACTIONS
-- =========================
CREATE TABLE transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED NULL,

  description TEXT,

  created_by BIGINT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  UNIQUE (id, company_id),

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE,

  FOREIGN KEY (project_id)
    REFERENCES projects(id)
    ON DELETE SET NULL,

  FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE INDEX idx_transactions_company ON transactions(company_id);

-- =========================
-- LEDGER_ENTRIES
-- =========================
CREATE TABLE ledger_entries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  transaction_id BIGINT UNSIGNED NOT NULL,
  account_id BIGINT UNSIGNED NOT NULL,

  entry_type ENUM('debit','credit') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE,

  FOREIGN KEY (transaction_id, company_id)
    REFERENCES transactions(id, company_id)
    ON DELETE RESTRICT,

  FOREIGN KEY (account_id, company_id)
    REFERENCES accounts(id, company_id)
    ON DELETE RESTRICT
);

CREATE INDEX idx_ledger_company ON ledger_entries(company_id);
CREATE INDEX idx_ledger_transaction ON ledger_entries(transaction_id);
CREATE INDEX idx_ledger_account ON ledger_entries(account_id);
CREATE INDEX idx_ledger_tx_company ON ledger_entries(transaction_id, company_id);
CREATE INDEX idx_ledger_company_account ON ledger_entries(company_id, account_id);

-- =========================
-- INSTALLMENTS
-- =========================
CREATE TABLE installments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transaction_id BIGINT UNSIGNED NOT NULL,

  amount DECIMAL(15,2) NOT NULL,
  due_date DATE NOT NULL,

  status ENUM('planned','paid','cancelled') DEFAULT 'planned',
  paid_at DATE NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  FOREIGN KEY (transaction_id)
    REFERENCES transactions(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_installments_transaction ON installments(transaction_id);

-- =========================
-- RECURRING_TRANSACTIONS
-- =========================
CREATE TABLE recurring_transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED NULL,

  description TEXT,
  amount DECIMAL(15,2) NOT NULL,

  source_account_id BIGINT UNSIGNED NOT NULL,
  category_account_id BIGINT UNSIGNED NOT NULL,

  frequency ENUM('weekly','monthly','yearly') NOT NULL,
  interval_value INT DEFAULT 1,

  start_date DATE NOT NULL,
  end_date DATE,
  next_run_date DATE NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE,

  FOREIGN KEY (project_id)
    REFERENCES projects(id)
    ON DELETE SET NULL,

  FOREIGN KEY (source_account_id, company_id)
    REFERENCES accounts(id, company_id)
    ON DELETE RESTRICT,

  FOREIGN KEY (category_account_id, company_id)
    REFERENCES accounts(id, company_id)
    ON DELETE RESTRICT
);

CREATE INDEX idx_recurring_company ON recurring_transactions(company_id);

-- =========================
-- SESSIONS
-- =========================
CREATE TABLE sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP NULL,
  expires_at DATETIME NOT NULL,

  ip_address VARCHAR(45),
  user_agent TEXT,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- =========================
-- REFRESH TOKENS
-- =========================
CREATE TABLE refresh_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id BIGINT UNSIGNED NOT NULL,

  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP NULL,

  replaced_by_token_id BIGINT UNSIGNED NULL,

  UNIQUE (token_hash),

  FOREIGN KEY (session_id)
    REFERENCES sessions(id)
    ON DELETE CASCADE,

  FOREIGN KEY (replaced_by_token_id)
    REFERENCES refresh_tokens(id)
    ON DELETE SET NULL
);

CREATE INDEX idx_refresh_session ON refresh_tokens(session_id);

-- =========================
-- INVITES
-- =========================
CREATE TABLE invites (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,

  email VARCHAR(150) NOT NULL,
  role ENUM('admin','viewer') NOT NULL,

  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  accepted_at DATETIME,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  UNIQUE (token),
  UNIQUE (company_id, email),

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_invites_company ON invites(company_id);
CREATE INDEX idx_invites_email ON invites(email);