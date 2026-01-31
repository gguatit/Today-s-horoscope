-- DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  user_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  birthdate TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  location TEXT,
  total_requests INTEGER DEFAULT 0 -- 총 운세 조회 횟수
);

-- 사용자의 질문/명령 히스토리 테이블
CREATE TABLE IF NOT EXISTS chat_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  user_message TEXT NOT NULL,     -- 사용자 질문
  ai_response TEXT,                -- AI 응답
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 인덱스 추가 (빠른 조회를 위해)
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);

-- 일일 운세 조회 횟수 제한 테이블
CREATE TABLE IF NOT EXISTS daily_fortune_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,           -- 사용자 ID (users.user_id 참조)
  date TEXT NOT NULL,               -- 날짜 (YYYY-MM-DD 형식)
  count INTEGER DEFAULT 0,          -- 해당 날짜의 조회 횟수
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)             -- 사용자당 날짜별로 하나의 레코드만 존재
);

-- 일일 제한 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_daily_limits_user_date ON daily_fortune_limits(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_limits_date ON daily_fortune_limits(date);
