# Today's Horoscope

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)
[![Cloudflare D1](https://img.shields.io/badge/Cloudflare-D1-orange)](https://developers.cloudflare.com/d1/)
[![Workers AI](https://img.shields.io/badge/Workers-AI-blue)](https://developers.cloudflare.com/workers-ai/)

> 생년월일 기반 운세 분석을 제공하는 서버리스 AI 채팅 애플리케이션

Cloudflare Workers AI와 D1 Database를 기반으로 구축된 풀스택 한국어 운세 챗봇입니다. 실시간 스트리밍 응답과 안전한 사용자 인증을 제공하며, 완전히 서버리스 아키텍처로 설계되었습니다.

**[Live Online Demo](https://kalpha.c01.kr)** | [GitHub](https://github.com/gguatit/Today-s-horoscope)

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Security](#security)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [License](#license)

## Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        Browser[Browser/Mobile]
        UI[Vanilla JS UI]
        LocalStorage[LocalStorage]
    end

    subgraph Edge["Cloudflare Edge"]
        Worker[Workers Runtime]
        Assets[Static Assets]
    end

    subgraph Services["Cloudflare Services"]
        AI[Workers AI<br/>Llama 3.1 8B]
        D1[(D1 Database<br/>SQLite)]
    end

    Browser --> UI
    UI --> LocalStorage
    UI -->|HTTPS/SSE| Worker
    Worker --> Assets
    Worker -->|JWT Auth| D1
    Worker -->|Inference| AI
    Worker -->|SQL Queries| D1

    style Browser fill:#e1f5ff
    style Worker fill:#ff9800
    style AI fill:#2196f3
    style D1 fill:#4caf50
```

### Request Flow

1. **Client Request**: 사용자가 브라우저에서 운세를 요청
2. **Authentication**: JWT 토큰 검증 및 사용자 정보 조회
3. **AI Processing**: Llama 3.1 8B 모델을 사용한 운세 생성
4. **Streaming Response**: SSE(Server-Sent Events)를 통한 실시간 응답 전송
5. **State Persistence**: LocalStorage에 채팅 기록 및 세션 저장

## Features

### AI-Powered Horoscope Analysis

- **Llama 3.1 8B Instruct FP8** 모델 기반 운세 생성
- 생년월일과 목표 날짜를 기반으로 한 맞춤형 분석
- **12별자리(서양 점성술)** 완전 통합
  - 자동 별자리 계산 및 UI 표시
  - 별자리별 세부 특성 (열정, 안정, 소통, 감성, 자신감, 세심함, 균형, 직관, 모험, 목표, 독창성, 상상력) AI 운세에 자연스럽게 통합
  - 12개 별자리(양자리~물고기자리) 각각의 강점과 주의사항 맞춤 반영
  - `ZODIAC_SIGNS` 상수 배열로 관리 (`src/types.ts`)
- 긍정적/부정적 조언의 균형잡힌 제공 (70% 긍정, 30% 주의)
- **간결한 운세 형식**: "오늘 당신의 운세는 '<한 줄 요약>' 입니다." 형식 사용
  - 예: "오늘 당신의 운세는 '새로운 기회가 찾아온다' 입니다."
- 환각(hallucination) 방지를 위한 시스템 프롬프트 최적화
- 한국어 전용 응답 및 문법 교정

### Real-time Interaction

- **Server-Sent Events (SSE)** 기반 스트리밍 응답
- 타이핑 인디케이터로 AI 응답 상태 표시
- 비동기 처리로 부드러운 사용자 경험 제공

### User Management

- JWT 기반 무상태 인증 시스템 (HS256, 만료 12시간)
- 회원가입/로그인 기능
- 사용자별 생년월일 정보 자동 연동
- 세션 유지 및 자동 로그인
- **회원가입 시 개인정보 수집 동의** (5개 항목 + 전체 동의 체크박스, 서버 측 검증)
- **개인정보처리방침** 페이지 (`/privacy.html`)

### Quick Presets (채팅 바로가기)

오른쪽 사이드바에서 클릭 한 번으로 아래 주제를 바로 질문할 수 있습니다.

- 오늘의 운세
- 연애운 질문
- 금전운 상담
- 이번 주 운세
- 건강운 확인
- 학업/시험운 질문
- 직장/취업운 상담
- 인간관계 운세

### User Experience

- 모바일 최적화 UI (숫자 키패드 입력 지원)
- **12별자리 자동 표시** (생년월일 설정 시 사이드바에 실시간 표시)
  - 한국어명 + 영어명 + 날짜 범위 + 별자리 특성 설명
- LocalStorage 기반 채팅 기록 및 설정 유지
- 반응형 디자인 (모바일/태블릿/데스크톱)

## Tech Stack

### 프론트엔드 (Frontend)
- **언어**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **프레임워크**: 없음 (순수 JavaScript)
- **상태 관리**: LocalStorage
- **실시간 통신**: Server-Sent Events (SSE)
- **UI 특징**: 반응형 디자인, 모바일 최적화

### 백엔드 (Backend)
- **언어**: TypeScript 5.8
- **런타임**: Cloudflare Workers (V8 Engine)
- **AI 모델**: Llama 3.1 8B Instruct FP8 (@cf/meta/llama-3.1-8b-instruct-fp8)
- **데이터베이스**: Cloudflare D1 (SQLite 기반)
- **인증**: Custom JWT (HS256, Web Crypto API)
- **비밀번호 암호화**: PBKDF2-HMAC-SHA256 (100,000 iterations)

### 인프라 & 서비스
- **호스팅**: Cloudflare Workers (Edge Computing)
- **데이터베이스**: Cloudflare D1 (Serverless SQLite)
- **AI 추론**: Cloudflare Workers AI
- **정적 자산**: Cloudflare Workers Assets
- **아키텍처**: 완전 서버리스 (Serverless)

## Security

### Authentication & Authorization

**JWT-based Stateless Authentication**
- HS256 알고리즘을 사용한 JWT 서명
- 사용자 ID, 사용자명, 생년월일 페이로드 포함
- 토큰 기반 세션 관리로 확장성 보장

```typescript
// JWT payload structure
{
  sub: number,        // User DB id
  userId: string,     // User ID (TEXT)
  userName: string,   // Display name
  birthdate: string   // YYYY-MM-DD
}
```

**JWT Secret 관리**
- 로컬 개발: `.dev.vars` 파일에 `JWT_SECRET` 설정 (`.gitignore`에 등록되어 git에 커밋되지 않음)
- 프로덕션: Wrangler Secrets에 암호화 저장 (`wrangler.jsonc` 평문 노출 없음)

```bash
# 프로덕션 환경에 JWT_SECRET 등록
npx wrangler secret put JWT_SECRET
```

```ini
# .dev.vars (로컬 전용, git 제외)
JWT_SECRET=your_secret_here
```

### Password Security

**PBKDF2 Key Derivation**
- 알고리즘: PBKDF2 with HMAC-SHA256
- 반복 횟수: 100,000 iterations
- 솔트: 사용자별 고유 UUID
- 키 길이: 256 bits (AES-GCM)

```typescript
// Password hashing implementation
- Salt generation: crypto.randomUUID()
- Key derivation: PBKDF2 + HMAC-SHA256
- Iterations: 100,000
- Output: Base64 encoded hash
```

### SQL Injection Prevention

**Parameterized Queries**
- 모든 데이터베이스 쿼리에 prepared statements 사용
- `prepare().bind()` 패턴으로 입력값 바인딩
- 사용자 입력값 직접 연결 금지

```typescript
// Example: Secure query pattern
await env.DB.prepare("SELECT * FROM users WHERE username = ?")
  .bind(username)
  .first();
```

### XSS Protection

**Input Sanitization**
- HTML 특수문자 이스케이프 처리
- `<`, `>`, `&`, `"`, `'` 문자 변환
- 사용자 입력값 반영 시 sanitize 함수 적용

```typescript
// Sanitization function
function sanitize(str: string): string {
  return str.replace(/[&<>"']/g, (match) => {
    const escape = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;',
      '"': '&quot;', "'": '&#39;'
    };
    return escape[match];
  });
}
```

### Input Validation

| 항목 | 규칙 |
|---|---|
| User ID | 영문/숫자, 4-8자 (`^[a-zA-Z0-9]{4,8}$`) |
| User Name | 2-4자 |
| Password | 8-20자 |
| Birthdate | YYYYMMDD (8자리 숫자) |

## API Reference

### Authentication Endpoints

#### POST `/api/auth/register`

사용자 회원가입

**Request Body**
```json
{
  "userId": "string (4-8 chars, alphanumeric)",
  "userName": "string (2-4 chars)",
  "password": "string (8-20 chars)",
  "birthdate": "string (YYYYMMDD, optional)",
  "consents": {
    "consent_name": true,
    "consent_birthdate": true,
    "consent_ip": true,
    "consent_chat": true,
    "consent_usage": true
  }
}
```

**Response**
```json
{
  "success": true
}
```

**Error Codes**
- `400`: 입력값 형식 오류 또는 동의 미완료
- `409`: 이미 사용 중인 아이디
- `500`: 서버 오류

#### POST `/api/auth/login`

사용자 로그인

**Request Body**
```json
{
  "userId": "string",
  "password": "string"
}
```

**Response**
```json
{
  "token": "string (JWT)",
  "userId": "string",
  "userName": "string",
  "birthdate": "string | null"
}
```

**Error Codes**
- `400`: 필드 누락
- `401`: 아이디 또는 비밀번호 불일치
- `500`: 서버 오류

### Chat Endpoints

#### POST `/api/chat`

AI 운세 채팅 (SSE 스트리밍, 인증 필요)

**Headers**
```
Authorization: Bearer <JWT>
```

**Request Body**
```json
{
  "messages": [
    { "role": "user", "content": "string" }
  ]
}
```

**Response**
- Content-Type: `text/event-stream`
- SSE 포맷: `data: {"response": "..."}` 스트리밍

**Error Codes**
- `401`: 인증 필요 또는 토큰 만료
- `405`: Method not allowed
- `500`: AI 처리 오류

#### POST `/api/chat/save-response`

AI 응답 DB 저장 (인증 필요)

**Headers**
```
Authorization: Bearer <JWT>
```

**Request Body**
```json
{ "aiResponse": "string" }
```

**Response**
```json
{ "success": true }
```

## Database Schema

```sql
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
  total_requests INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS chat_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);
```

## License

MIT License - see [LICENSE](LICENSE) file for details

---

**Built with:**
- [Cloudflare Workers](https://workers.cloudflare.com/) - Edge computing platform
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - Serverless SQLite database
- [Workers AI](https://developers.cloudflare.com/workers-ai/) - Llama 3.1 8B Instruct FP8
- Vanilla JavaScript - No frontend frameworks
- TypeScript 5.8 - Type safety

**프로젝트 현황:**
- [x] 핵심 운세 챗봇 기능 완성
- [x] 12별자리 통합 (계산, UI 표시, AI 특성 반영)
- [x] JWT 인증 및 PBKDF2 보안
- [x] JWT_SECRET Wrangler Secrets 관리 (wrangler.jsonc 평문 노출 제거)
- [x] SSE 실시간 스트리밍
- [x] 모바일 최적화 UI
- [x] 개인정보 수집 동의 (회원가입 시 서버 검증)
- [x] 개인정보처리방침 페이지
- [x] AI 응답 DB 저장
- [x] 채팅 바로가기 프리셋 8종
- [ ] 자동화 테스트 (향후 추가 예정)

**Live Demo**: [https://kalpha.c01.kr](https://kalpha.c01.kr)

(c) 2026 Kalpha-Dev (최재영). All Rights Reserved.
