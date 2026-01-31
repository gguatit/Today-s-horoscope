/**
 * 일일 운세 횟수 제한 모듈
 * 각 사용자가 하루에 최대 4회까지만 운세를 조회할 수 있도록 제한
 * 같은 질문은 하루에 한 번만 가능
 */

import { Env } from "./types";

// 하루 최대 운세 조회 횟수
const MAX_DAILY_REQUESTS = 4;

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환 (한국 시간 기준 KST UTC+9)
 */
function getTodayString(): string {
  const now = new Date();
  // 한국 시간 (UTC+9)으로 변환
  const kstOffset = 9 * 60; // 9시간 = 540분
  const kstDate = new Date(now.getTime() + kstOffset * 60 * 1000);
  return kstDate.toISOString().split('T')[0];
}

/**
 * 두 질문이 유사한지 비교 (정규화 후 완전 일치만 체크)
 * @param question1 - 첫 번째 질문
 * @param question2 - 두 번째 질문
 * @returns 유사하면 true
 */
function isSimilarQuestion(question1: string, question2: string): boolean {
  // 공백, 특수문자 제거 후 비교
  const normalize = (str: string) => 
    str.replace(/[\s\.,!?~ㅋㅎㅜㅠ]/g, '').trim();
  
  const norm1 = normalize(question1);
  const norm2 = normalize(question2);
  
  // 완전히 동일한 경우만 중복으로 판단
  return norm1 === norm2;
}

/**
 * 사용자가 오늘 같은 질문을 했는지 체크
 * @param userId - 사용자 ID (TEXT)
 * @param question - 체크할 질문
 * @param env - Cloudflare 환경 변수
 * @returns 중복 질문이면 true
 */
export async function checkDuplicateQuestion(
  userId: string,
  question: string,
  env: Env
): Promise<boolean> {
  const today = getTodayString();
  
  // 오늘 사용자의 모든 질문 가져오기
  const result = await env.DB.prepare(`
    SELECT user_message FROM chat_history 
    WHERE user_id = (SELECT id FROM users WHERE user_id = ?)
    AND DATE(created_at) = ?
    ORDER BY created_at DESC
  `)
    .bind(userId, today)
    .all();
  
  if (!result.results || result.results.length === 0) {
    return false;
  }
  
  // 각 질문과 비교
  for (const row of result.results) {
    const prevQuestion = row.user_message as string;
    if (prevQuestion && isSimilarQuestion(question, prevQuestion)) {
      return true; // 중복 질문 발견
    }
  }
  
  return false;
}

/**
 * 사용자의 오늘 운세 조회 횟수 확인
 * @param userId - 사용자 ID (TEXT)
 * @param env - Cloudflare 환경 변수
 * @returns 오늘 조회한 횟수
 */
export async function getDailyRequestCount(userId: string, env: Env): Promise<number> {
  const today = getTodayString();
  
  const result = await env.DB.prepare(`
    SELECT count FROM daily_fortune_limits 
    WHERE user_id = ? AND date = ?
  `)
    .bind(userId, today)
    .first();
  
  return result ? (result.count as number) : 0;
}

/**
 * 사용자가 오늘 운세를 조회할 수 있는지 확인
 * @param userId - 사용자 ID (TEXT)
 * @param env - Cloudflare 환경 변수
 * @returns { allowed: boolean, remaining: number, message: string }
 */
export async function checkDailyLimit(
  userId: string, 
  env: Env
): Promise<{ allowed: boolean; remaining: number; message: string }> {
  const count = await getDailyRequestCount(userId, env);
  const remaining = Math.max(0, MAX_DAILY_REQUESTS - count);
  
  if (count >= MAX_DAILY_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      message: `오늘의 운세 조회 횟수(${MAX_DAILY_REQUESTS}회)를 모두 사용하셨습니다. 내일 다시 이용해주세요. 🌙`
    };
  }
  
  return {
    allowed: true,
    remaining: remaining - 1, // 이번 요청 후 남은 횟수
    message: `운세 조회 완료! 오늘 ${remaining - 1}회 더 이용 가능합니다. ✨`
  };
}

/**
 * 사용자의 오늘 운세 조회 횟수 증가
 * @param userId - 사용자 ID (TEXT)
 * @param env - Cloudflare 환경 변수
 */
export async function incrementDailyCount(userId: string, env: Env): Promise<void> {
  const today = getTodayString();
  
  // UPSERT: 레코드가 없으면 INSERT, 있으면 UPDATE
  await env.DB.prepare(`
    INSERT INTO daily_fortune_limits (user_id, date, count, updated_at)
    VALUES (?, ?, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, date) DO UPDATE SET
      count = count + 1,
      updated_at = CURRENT_TIMESTAMP
  `)
    .bind(userId, today)
    .run();
}

/**
 * 운세 조회 가능 여부 확인 (중복 질문 + 횟수 제한)
 * @param userId - 사용자 ID (TEXT)
 * @param question - 사용자 질문
 * @param env - Cloudflare 환경 변수
 * @returns 조회 가능 여부와 메시지
 */
export async function validateAndIncrement(
  userId: string,
  question: string,
  env: Env
): Promise<{ success: boolean; remaining: number; message: string }> {
  // 1. 중복 질문 체크
  const isDuplicate = await checkDuplicateQuestion(userId, question, env);
  if (isDuplicate) {
    const count = await getDailyRequestCount(userId, env);
    const remaining = Math.max(0, MAX_DAILY_REQUESTS - count);
    return {
      success: false,
      remaining,
      message: '같은 질문은 하루에 한 번만 가능합니다. 다른 질문을 해주세요! 🔄'
    };
  }
  
  // 2. 일일 횟수 제한 체크
  const check = await checkDailyLimit(userId, env);
  
  if (!check.allowed) {
    return {
      success: false,
      remaining: 0,
      message: check.message
    };
  }
  
  // 3. 횟수 증가
  await incrementDailyCount(userId, env);
  
  return {
    success: true,
    remaining: check.remaining,
    message: check.message
  };
}

/**
 * 사용자의 오늘 운세 조회 기록 초기화 (관리자 기능)
 * @param userId - 사용자 ID
 * @param env - Cloudflare 환경 변수
 */
export async function resetDailyCount(userId: string, env: Env): Promise<void> {
  const today = getTodayString();
  
  await env.DB.prepare(`
    DELETE FROM daily_fortune_limits 
    WHERE user_id = ? AND date = ?
  `)
    .bind(userId, today)
    .run();
}

/**
 * 오래된 제한 기록 정리 (7일 이상 된 기록 삭제)
 * 정기적으로 실행하여 데이터베이스 크기 관리
 * @param env - Cloudflare 환경 변수
 */
export async function cleanupOldRecords(env: Env): Promise<number> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoffDate = sevenDaysAgo.toISOString().split('T')[0];
  
  const result = await env.DB.prepare(`
    DELETE FROM daily_fortune_limits 
    WHERE date < ?
  `)
    .bind(cutoffDate)
    .run();
  
  return result.meta?.changes || 0;
}
