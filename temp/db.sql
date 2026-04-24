-- COMPANIES
CREATE TABLE companies (
  id CHAR(26) NOT NULL,
  name VARCHAR(150) NOT NULL,
  cnpj VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY companies_cnpj_unique (cnpj)
);

-- USERS
CREATE TABLE users (
  id CHAR(26) NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_verified TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email)
);

-- SESSIONS
CREATE TABLE sessions (
  id CHAR(26) NOT NULL,
  user_id CHAR(26) NOT NULL,
  revoked_at TIMESTAMP NULL,
  last_activity_at TIMESTAMP NOT NULL,
  expires_at DATETIME NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  CONSTRAINT sessions_user_id_fk FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE NO ACTION
);

-- ACCOUNTS
CREATE TABLE accounts (
  id CHAR(26) NOT NULL,
  company_id CHAR(26) NOT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('asset','expense','revenue') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_accounts_id_company (id, company_id),
  UNIQUE KEY uq_accounts_company_name (company_id, name),
  CONSTRAINT accounts_company_fk FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE RESTRICT ON UPDATE NO ACTION
);

-- TRANSACTIONS
CREATE TABLE transactions (
  id CHAR(26) NOT NULL,
  company_id CHAR(26) NOT NULL,
  project_id CHAR(26),
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_transactions_id_company (id, company_id),
  CONSTRAINT transactions_company_fk FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE RESTRICT ON UPDATE NO ACTION
);

-- INSTALLMENTS
CREATE TABLE installments (
  id CHAR(26) NOT NULL,
  transaction_id CHAR(26) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('planned','paid','cancelled'),
  paid_at DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  CONSTRAINT installments_transaction_fk FOREIGN KEY (transaction_id)
    REFERENCES transactions(id)
    ON DELETE RESTRICT ON UPDATE NO ACTION
);

-- LEDGER ENTRIES
CREATE TABLE ledger_entries (
  id CHAR(26) NOT NULL,
  company_id CHAR(26) NOT NULL,
  transaction_id CHAR(26) NOT NULL,
  account_id CHAR(26) NOT NULL,
  entry_type ENUM('debit','credit') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  CONSTRAINT ledger_company_fk FOREIGN KEY (company_id)
    REFERENCES companies(id),
  CONSTRAINT ledger_transaction_fk FOREIGN KEY (transaction_id)
    REFERENCES transactions(id),
  CONSTRAINT ledger_account_fk FOREIGN KEY (account_id)
    REFERENCES accounts(id)
);

-- REFRESH TOKENS
CREATE TABLE refresh_tokens (
  id CHAR(26) NOT NULL,
  user_id CHAR(26) NOT NULL,
  session_id CHAR(26) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at TIMESTAMP NULL,
  replaced_by CHAR(26),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_refresh_token_hash (token_hash),
  CONSTRAINT refresh_user_fk FOREIGN KEY (user_id)
    REFERENCES users(id),
  CONSTRAINT refresh_session_fk FOREIGN KEY (session_id)
    REFERENCES sessions(id),
  CONSTRAINT refresh_self_fk FOREIGN KEY (replaced_by)
    REFERENCES refresh_tokens(id)
);

-- JWT KEYS
CREATE TABLE jwt_keys (
  id CHAR(26) NOT NULL,
  kid CHAR(26) NOT NULL,
  public_key TEXT NOT NULL,
  private_key TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  revoke_at TIMESTAMP NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_jwt_keys_kid (kid)
);

-- COMPANY USERS
CREATE TABLE company_users (
  id CHAR(26) NOT NULL,
  company_id CHAR(26) NOT NULL,
  user_id CHAR(26) NOT NULL,
  role ENUM('owner','admin','viewer') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_company_users_membership (company_id, user_id),
  CONSTRAINT company_users_company_fk FOREIGN KEY (company_id)
    REFERENCES companies(id),
  CONSTRAINT company_users_user_fk FOREIGN KEY (user_id)
    REFERENCES users(id)
);

-- INVITES
CREATE TABLE invites (
  id CHAR(26) NOT NULL,
  company_id CHAR(26) NOT NULL,
  email VARCHAR(150) NOT NULL,
  role ENUM('admin','viewer') NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  accepted_at DATETIME,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_token_invites (token),
  CONSTRAINT invites_company_fk FOREIGN KEY (company_id)
    REFERENCES companies(id)
);

-- PROJECTS
CREATE TABLE projects (
  id CHAR(26) NOT NULL,
  company_id CHAR(26) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_projects_company_name (company_id, name),
  CONSTRAINT projects_company_fk FOREIGN KEY (company_id)
    REFERENCES companies(id)
);