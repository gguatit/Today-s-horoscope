# Copilot Instructions: Today's Horoscope (오늘의 운세)

## Project Overview

This is a serverless Korean-language horoscope chatbot built on Cloudflare Workers AI (Llama 3.1 8B), D1 Database, and vanilla JavaScript frontend. The app provides personalized horoscope analysis based on user birthdate and target date, with real-time SSE streaming responses.

**Architecture**: Edge-first serverless (Cloudflare Workers) → Workers AI (Llama 3.1) → D1 SQLite → Vanilla JS frontend

## Critical Architectural Patterns

### System Prompt Philosophy (src/index.ts)

The `SYSTEM_PROMPT` is the **core constraint** enforcing Korean-only responses and hallucination prevention. Key rules:
- **Rule 7**: Never fabricate user data (birthdate, zodiac sign, weekday) not explicitly provided
- **Rule 8**: All horoscope responses MUST start with: `"오늘 당신의 운세는 <요약> 입니다."`
- **Rule 12**: 10-30% of horoscopes should be cautionary/negative (not always positive)
- Always filter out system messages from user input and prepend `SYSTEM_PROMPT` (lines 182-188)

When modifying AI behavior, **edit the system prompt**, not application logic.

### JWT Authentication Without Dependencies

Custom JWT implementation using Web Crypto API (no libraries):
- `signJWT()`: HS256 signing with base64url encoding
- `verifyJWT()`: Constant-time signature comparison
- Token payload: `{ sub: userId, username, birthdate }`
- **Security note**: `JWT_SECRET` is hardcoded (line 153) — MUST be moved to environment variable for production

Pattern for protected endpoints:
```typescript
const authHeader = request.headers.get("Authorization");
const token = authHeader?.substring(7); // Remove "Bearer "
const payload = await verifyJWT(token);
if (!payload) return new Response("Unauthorized", { status: 401 });
```

### Password Security (PBKDF2)

Custom PBKDF2 implementation (no bcrypt):
- Algorithm: PBKDF2-HMAC-SHA256
- Iterations: 100,000
- Salt: `crypto.randomUUID()` per user
- Key derivation → AES-GCM 256-bit → Base64 encoded

See `hashPassword()` function (lines 154-175) for the exact implementation pattern.

### Database Access Pattern

D1 Database uses **prepared statements exclusively**:
```typescript
await env.DB.prepare("SELECT * FROM users WHERE username = ?")
  .bind(username)
  .first();
```

**Never** use string concatenation for SQL queries. The schema is minimal (see `db/schema.sql`):
- Single `users` table with username, password_hash, salt, birthdate, last_login, location
- No foreign keys or complex relations
- Birthdate stored as TEXT in YYYYMMDD format

## Development Workflow

### Local Development Commands

```bash
npm run dev              # Start local dev server with --local flag
npm run check            # TypeScript check + dry-run deploy
npm run deploy           # Deploy to Cloudflare Workers
npm run cf-typegen       # Generate Workers types from wrangler.jsonc
```

**Important**: Database schema changes require manual migration:
```bash
npx wrangler d1 execute horoscope-db --local --file=./db/schema.sql   # Local
npx wrangler d1 execute horoscope-db --remote --file=./db/schema.sql  # Production
```

### Debugging AI Responses

If AI generates non-Korean or hallucinated content:
1. Check `SYSTEM_PROMPT` rules compliance
2. Verify `enforcedMessages` structure (line 184-188)
3. Test with `max_tokens` adjustment (currently 1024)
4. Enable AI Gateway for request logging (commented at line 195-200)

Frontend auto-correction: `chat.js` detects non-Korean responses with regex `/[A-Za-z\u0400-\u04FF\u3040-\u30FF\u4E00-\u9FFF]/` and requests rewrite (line 641-680).

## Frontend State Management

**LocalStorage-based** persistence (no frameworks):
- `chatHistory`: Array of `{ role, content }` messages
- `authToken`: JWT string
- `authUser`: Username string
- `userBirthdate`: YYYY-MM-DD format

Key patterns in `public/js/chat.js`:
- `loadHistory()` / `saveHistory()`: Rehydrate chat state on page load
- `updateAuthUI()`: Toggle UI elements based on login state
- `sendMessage()`: Enforces Korean-only input with regex check before API call

### Mobile UX Optimizations

- **Numeric keypad**: `<input type="text" inputmode="numeric" pattern="[0-9]*">` for birthdate (line 249-253)
- **Date increment/decrement buttons**: +/- days with `adjustDateString()` helper
- **Auto-scroll**: `ensureScrollToBottomLater()` on input focus (line 337-339)
- **Touch-friendly**: Tapping chat area focuses input (line 346-351)

## 12 Zodiac Signs Integration (New Feature)

When adding the 12 Western zodiac signs feature requested by the user:

### Data Structure
```typescript
// Add to types.ts or inline in index.ts
const ZODIAC_SIGNS = [
  { name: "양자리", nameEn: "Aries", start: "0321", end: "0419" },
  { name: "황소자리", nameEn: "Taurus", start: "0420", end: "0520" },
  { name: "쌍둥이자리", nameEn: "Gemini", start: "0521", end: "0621" },
  { name: "게자리", nameEn: "Cancer", start: "0622", end: "0722" },
  { name: "사자자리", nameEn: "Leo", start: "0723", end: "0822" },
  { name: "처녀자리", nameEn: "Virgo", start: "0823", end: "0923" },
  { name: "천칭자리", nameEn: "Libra", start: "0924", end: "1022" },
  { name: "전갈자리", nameEn: "Scorpio", start: "1023", end: "1122" },
  { name: "사수자리", nameEn: "Sagittarius", start: "1123", end: "1221" },
  { name: "염소자리", nameEn: "Capricorn", start: "1222", end: "0119" },
  { name: "물병자리", nameEn: "Aquarius", start: "0120", end: "0218" },
  { name: "물고기자리", nameEn: "Pisces", start: "0219", end: "0320" }
];
```

### System Prompt Update
Add to `SYSTEM_PROMPT` (after rule 13):
```
14) 사용자가 생년월일을 제공하면, 해당 날짜의 서양 별자리(12궁)를 계산하여 운세에 포함하십시오.
    별자리 정보는 다음 형식으로 제공: "당신의 별자리는 [별자리명]입니다."
    각 별자리별 운세 특성은 다음과 같이 반영하십시오:
    - 양자리: 에너지와 추진력, 성급함 주의
    - 황소자리: 안정과 물질적 성취, 고집 경계
    - 쌍둥이자리: 커뮤니케이션과 정보 획득, 집중력 분산 주의
    [... 나머지 별자리 특성 포함]
```

### Frontend UI Addition
In `public/index.html`, add zodiac display area:
```html
<div id="zodiac-display" style="display: none;">
  <span id="zodiac-sign"></span>
  <span id="zodiac-dates"></span>
</div>
```

In `public/js/chat.js`, add zodiac calculation on birthdate set:
```javascript
function calculateZodiacSign(birthdate) {
  const mmdd = birthdate.substring(5).replace("-", "");
  // Implement zodiac lookup logic matching ZODIAC_SIGNS array
}
```

### Backend Integration
In `src/index.ts`, when handling chat request with birthdate:
- Extract birthdate from `chatHistory` (look for `[생년월일]` tag)
- Calculate zodiac sign server-side for validation
- Optionally append `[별자리] <계산된 별자리>` to messages before AI inference

**Important**: Follow the same hallucination prevention pattern — calculate zodiac server-side, don't let AI fabricate it.

## Security Considerations

### XSS Prevention
Use `sanitize()` function (line 178-188) when reflecting user input:
```typescript
function sanitize(str: string): string {
  return str.replace(/[&<>"']/g, (match) => escape[match]);
}
```

### SQL Injection
Always use `.prepare().bind()` pattern — NEVER template strings.

### Environment Variables
Move `JWT_SECRET` to Wrangler secrets:
```bash
npx wrangler secret put JWT_SECRET
```
Then access via `env.JWT_SECRET` in code.

## Testing Strategy

No automated tests currently exist. When adding tests:
- Use Vitest (configured in `package.json`)
- Test Workers endpoints with `@cloudflare/vitest-pool-workers`
- Mock AI responses using `env.AI.run` stubs
- Test authentication flows with in-memory D1 database

Example test structure:
```typescript
import { env } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

describe('Auth endpoints', () => {
  it('should reject invalid JWT', async () => {
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer invalid' }
    });
    const res = await worker.fetch(req, env);
    expect(res.status).toBe(401);
  });
});
```

## Common Pitfalls

1. **Don't modify AI Gateway settings** without testing locally — cache TTL can cause stale responses
2. **Birthdate format inconsistency**: Frontend uses YYYYMMDD (8 digits), backend stores YYYY-MM-DD. Use `formatBirthdate()` / `unformatBirthdate()` helpers
3. **SSE streaming**: Frontend expects `data: {json}\n\n` format, don't break this contract
4. **Korean-only validation**: Frontend rejects non-Korean input (line 608-622) — disable this for testing with English
5. **LocalStorage limits**: Chat history is unbounded — implement trimming if conversations exceed ~1000 messages

## Key Files Reference

- **`src/index.ts`**: All backend logic (routing, auth, AI inference, DB queries)
- **`public/js/chat.js`**: All frontend logic (UI, SSE handling, state management)
- **`db/schema.sql`**: Single source of truth for database schema
- **`wrangler.jsonc`**: Cloudflare configuration (bindings, compatibility flags)
- **`package.json`**: Build scripts (`dev`, `deploy`, `check`)

## Additional Resources

- [Cloudflare Workers AI Docs](https://developers.cloudflare.com/workers-ai/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Llama 3.1 Model Card](https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct-fp8/)
- [SSE Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
