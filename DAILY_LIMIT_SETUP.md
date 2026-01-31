# 일일 운세 횟수 제한 기능 적용 가이드

## 구현된 기능
✅ 계정별 하루 4회 운세 조회 제한
✅ 서버 사이드 검증으로 클라이언트 우회 불가능
✅ 별도 파일로 모듈화 (src/rateLimit.ts)
✅ 데이터베이스 기반 제한 (D1)

## 적용 방법

### 1. 데이터베이스 마이그레이션 (필수)

#### 로컬 개발 환경
```bash
npx wrangler d1 execute horoscope-db --local --file=./db/schema.sql
```

#### 프로덕션 환경
```bash
npx wrangler d1 execute horoscope-db --remote --file=./db/schema.sql
```

### 2. 배포
```bash
npm run deploy
```

## 기능 설명

### 작동 방식
1. 사용자가 운세를 요청할 때마다 `daily_fortune_limits` 테이블 확인
2. 해당 사용자의 오늘 날짜 조회 횟수가 4회 미만이면 허용
3. 4회 이상이면 429 에러 반환 및 안내 메시지 표시
4. 매일 자정 이후 자동으로 리셋 (날짜가 바뀌면 새로운 레코드)

### 새로운 파일들

#### `src/rateLimit.ts`
- `checkDailyLimit()`: 현재 사용 가능 여부 확인
- `incrementDailyCount()`: 횟수 증가
- `validateAndIncrement()`: 확인 + 증가를 한 번에 처리
- `cleanupOldRecords()`: 7일 이상 된 기록 정리

#### `db/schema.sql` (업데이트)
```sql
CREATE TABLE IF NOT EXISTS daily_fortune_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);
```

### 서버 로직 변경 (src/index.ts)
- `validateAndIncrement()` 호출하여 매 요청마다 횟수 체크
- 4회 초과 시 429 상태 코드 반환
- 클라이언트에서 우회 불가능 (서버에서만 검증)

### 클라이언트 처리 (public/js/app.js)
- 429 에러 감지 시 사용자에게 친절한 메시지 표시
- "오늘의 운세 조회 횟수(4회)를 모두 사용하셨습니다. 내일 다시 이용해주세요. 🌙"

## 보안 특징

✅ **서버 사이드 검증**: 모든 체크가 Cloudflare Workers에서 실행
✅ **데이터베이스 저장**: D1에 저장되어 클라이언트에서 조작 불가
✅ **JWT 인증**: 로그인한 사용자만 접근 가능
✅ **UNIQUE 제약**: user_id + date 조합으로 중복 방지
✅ **타임스탬프**: updated_at으로 마지막 사용 시간 추적

## 테스트 방법

1. 로그인 후 운세를 4번 연속 요청
2. 5번째 요청 시 제한 메시지 확인
3. 내일 다시 테스트하여 리셋 확인

## 관리자 기능

필요 시 특정 사용자의 횟수 초기화:
```typescript
import { resetDailyCount } from './rateLimit';
await resetDailyCount('user_id', env);
```

오래된 기록 정리 (7일 이상):
```typescript
import { cleanupOldRecords } from './rateLimit';
const deletedCount = await cleanupOldRecords(env);
```

## 제한 횟수 변경

`src/rateLimit.ts` 파일의 상수 수정:
```typescript
const MAX_DAILY_REQUESTS = 4; // 원하는 횟수로 변경
```
