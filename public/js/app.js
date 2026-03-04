/**
 * 운세 AI 챗봇 프론트엔드
 * 현재 HTML 구조에 맞춘 재구성 버전
 */

// ========== 상태 변수 ==========
let authToken = localStorage.getItem('authToken');
let authUser = localStorage.getItem('authUser');
let authUserName = localStorage.getItem('authUserName');
let userBirthdate = localStorage.getItem('userBirthdate');
let chatHistory = [];
let isProcessing = false;

// ========== 12별자리 데이터 ==========
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

const zodiacDescriptions = {
  aries: "도전과 열정이 강한 별자리로, 시작을 두려워하지 않는 성향이에요.",
  taurus: "안정과 현실을 중시하며, 한 번 마음먹은 일은 끝까지 해내요.",
  gemini: "호기심이 많고 소통을 즐기는 별자리로, 생각이 빠르게 변해요.",
  cancer: "감정이 풍부하고 배려심이 깊은 별자리예요.",
  leo: "자신감과 리더십이 강하며, 주목받는 것을 좋아해요.",
  virgo: "섬세하고 분석적인 성향으로 완벽을 추구해요.",
  libra: "균형과 조화를 중요하게 생각하는 사교적인 별자리예요.",
  scorpio: "집중력과 직관이 뛰어나며 깊은 관계를 선호해요.",
  sagittarius: "자유와 모험을 사랑하며 긍정적인 에너지가 강해요.",
  capricorn: "책임감이 강하고 현실적인 목표를 중시해요.",
  aquarius: "독창적이고 개방적인 사고를 가진 별자리예요.",
  pisces: "상상력이 풍부하고 감수성이 뛰어난 별자리예요."
};

// ========== 유틸리티 함수 ==========

// JWT 토큰 디코딩 및 만료 체크
function isTokenExpired(token) {
  if (!token) return true;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    // exp 클레임이 있는 경우 만료 시간 체크
    if (payload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      return currentTime > payload.exp;
    }

    return false;
  } catch (e) {
    console.error('Token decode error:', e);
    return true;
  }
}

// 로그아웃 처리
function performLogout(message = '로그아웃되었습니다.') {
  authToken = null;
  authUser = null;
  authUserName = null;
  userBirthdate = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  localStorage.removeItem('authUserName');
  localStorage.removeItem('userBirthdate');
  localStorage.removeItem('chatHistory');

  const birthdateDisplay = document.getElementById('birthdate-display');
  const birthdateSection = document.getElementById('birthdate-section');
  const zodiacInfo = document.getElementById('zodiac-info');
  const zodiacDescEl = document.getElementById('zodiac-desc');
  const chatMessages = document.getElementById('chat-messages');

  if (birthdateDisplay) birthdateDisplay.textContent = '';
  if (birthdateSection) birthdateSection.style.display = 'none';
  if (zodiacInfo) zodiacInfo.style.display = 'none';
  if (zodiacDescEl) zodiacDescEl.style.display = 'none';
  chatHistory = [];
  if (chatMessages) chatMessages.innerHTML = '';

  addMessageToChat('ai', message);
  updateAuthUI();
}

// ========== 유틸리티 함수 ==========

// YYYYMMDD -> YYYY-MM-DD
function formatBirthdate(val) {
  if (!val || val.length !== 8) return null;
  const y = val.substring(0, 4);
  const m = val.substring(4, 6);
  const d = val.substring(6, 8);
  const numM = parseInt(m, 10);
  const numD = parseInt(d, 10);
  if (numM < 1 || numM > 12) return null;
  if (numD < 1 || numD > 31) return null;
  return `${y}-${m}-${d}`;
}

// YYYY-MM-DD -> YYYYMMDD
function unformatBirthdate(val) {
  if (!val) return "";
  return val.replace(/-/g, "");
}

// 별자리 계산
function calculateZodiacSign(birthdate) {
  if (!birthdate || birthdate.length !== 10) return null;
  const mmdd = birthdate.substring(5).replace("-", "");

  for (const sign of ZODIAC_SIGNS) {
    if (sign.start > sign.end) {
      if (mmdd >= sign.start || mmdd <= sign.end) {
        return sign;
      }
    } else {
      if (mmdd >= sign.start && mmdd <= sign.end) {
        return sign;
      }
    }
  }
  return null;
}

// 별자리 UI 업데이트
function updateZodiacUI(birthdate) {

  const zodiacInfo = document.getElementById('zodiac-info');
  const zodiacName = document.getElementById('zodiac-name');
  const zodiacDates = document.getElementById('zodiac-dates');
  const zodiacDescEl = document.getElementById('zodiac-desc');
  const zodiacDescText = zodiacDescEl ? zodiacDescEl.querySelector('p') : null;

  if (!birthdate) {
    if (zodiacInfo) zodiacInfo.style.display = 'none';
    if (zodiacDescEl) zodiacDescEl.style.display = 'none';
    return;
  }

  const zodiac = calculateZodiacSign(birthdate);


  if (!zodiac) {
    if (zodiacInfo) zodiacInfo.style.display = 'none';
    if (zodiacDescEl) zodiacDescEl.style.display = 'none';
    return;
  }

  // 별자리 정보 표시
  if (zodiacInfo) {
    zodiacInfo.style.display = 'block';
    if (zodiacName) zodiacName.textContent = `${zodiac.name} (${zodiac.nameEn})`;
    if (zodiacDates) {
      const startMonth = zodiac.start.substring(0, 2);
      const startDay = zodiac.start.substring(2);
      const endMonth = zodiac.end.substring(0, 2);
      const endDay = zodiac.end.substring(2);
      zodiacDates.textContent = `${startMonth}.${startDay} ~ ${endMonth}.${endDay}`;
    }

  }

  // 별자리 설명 표시
  if (zodiacDescEl && zodiacDescText) {
    zodiacDescEl.style.display = 'block';
    const descKey = zodiac.nameEn.toLowerCase();
    zodiacDescText.textContent = zodiacDescriptions[descKey] || '';

  }
}

// 채팅 메시지 추가
function addMessageToChat(role, content) {
  const chatMessages = document.getElementById('chat-messages');
  const messageEl = document.createElement('div');
  messageEl.className = `message ${role === 'user' ? 'user' : 'ai'}`;

  const bubbleEl = document.createElement('div');
  bubbleEl.className = 'bubble';
  bubbleEl.textContent = content;

  messageEl.appendChild(bubbleEl);

  chatMessages.appendChild(messageEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 채팅 히스토리 저장/로드
function saveHistory() {
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  if (userBirthdate) localStorage.setItem('userBirthdate', userBirthdate);
}

function loadHistory() {
  const saved = localStorage.getItem('chatHistory');
  if (saved) {
    try {
      chatHistory = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load history', e);
      chatHistory = [];
    }
  }
}

// 오늘 날짜 업데이트
function updateTodayDate() {
  const todayDateEl = document.getElementById('today-date');
  if (!todayDateEl) return;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekday = weekdays[now.getDay()];

  todayDateEl.querySelector('p').textContent = `${year}.${month}.${day}`;
  todayDateEl.querySelector('span').textContent = weekday;
}

// ========== 인증 UI ==========
function updateAuthUI() {
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const userInfo = document.getElementById('user-info');
  if (authToken && authUserName) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (signupBtn) signupBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    if (userInfo) {
      userInfo.style.display = 'inline-block';
      userInfo.textContent = `${authUserName}님`;
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (signupBtn) signupBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (userInfo) userInfo.style.display = 'none';
  }
}

// ========== 인증 폼 제출 핸들러 ==========
async function handleAuthSubmit(e) {
  e.preventDefault();

  const authForm = document.getElementById('auth-form');
  const authUserIdInput = document.getElementById('auth-userid');
  const authUserNameInput = document.getElementById('auth-username');
  const authPasswordInput = document.getElementById('auth-password');
  const authBirthdateInput = document.getElementById('auth-birthdate');
  const authMessage = document.getElementById('auth-message');
  const authModal = document.getElementById('auth-modal');
  const authTitle = document.getElementById('auth-title');

  const mode = authForm.dataset.mode;
  const userId = authUserIdInput.value;
  const userName = authUserNameInput.value;
  const password = authPasswordInput.value;
  const birthdateRaw = authBirthdateInput.value;

  let birthdate = null;
  if (birthdateRaw && birthdateRaw.length === 8) {
    birthdate = formatBirthdate(birthdateRaw);
  }

  // 회원가입일 경우 동의 체크 확인
  if (mode === 'signup') {
    const consentItems = document.querySelectorAll('.consent-item');
    const allChecked = Array.from(consentItems).every(cb => cb.checked);
    if (!allChecked) {
      authMessage.style.color = 'red';
      authMessage.textContent = '모든 개인정보 수집 항목에 동의해야 합니다.';
      return;
    }
  }

  const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';

  try {
    const body = mode === 'login'
      ? { userId, password }
      : {
        userId, userName, password, birthdate, consents: {
          consent_name: document.getElementById('consent-name').checked,
          consent_birthdate: document.getElementById('consent-birthdate').checked,
          consent_ip: document.getElementById('consent-ip').checked,
          consent_chat: document.getElementById('consent-chat').checked,
          consent_usage: document.getElementById('consent-usage').checked
        }
      };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      const data = await res.json();
      if (mode === 'login') {
        authToken = data.token;
        authUser = data.userId;
        authUserName = data.userName;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('authUser', authUser);
        localStorage.setItem('authUserName', authUserName);

        if (data.birthdate) {
          userBirthdate = data.birthdate;
          localStorage.setItem('userBirthdate', userBirthdate);

          const birthdateDisplay = document.getElementById('birthdate-display');
          const birthdateSection = document.getElementById('birthdate-section');
          const zodiac = calculateZodiacSign(userBirthdate);

          if (birthdateDisplay) {
            birthdateDisplay.textContent = zodiac
              ? `생년월일: ${userBirthdate} (${zodiac.name})`
              : `생년월일: ${userBirthdate}`;
          }
          if (birthdateSection) birthdateSection.style.display = 'block';

          // 별자리 UI 업데이트
          updateZodiacUI(userBirthdate);
        }

        const chatMessages = document.getElementById('chat-messages');
        chatHistory = [];
        chatMessages.innerHTML = '';

        updateAuthUI();
        authModal.style.display = 'none';

        if (userBirthdate) {
          addMessageToChat('ai', `${authUserName}님, 환영합니다! 운세를 물어보세요.`);
        } else {
          addMessageToChat('ai', `${authUserName}님, 환영합니다! 회원가입 시 생년월일을 입력하시면 더 정확한 운세를 받을 수 있습니다.`);
        }
      } else {
        authMessage.style.color = 'green';
        authMessage.textContent = '회원가입 성공! 로그인해주세요.';
        setTimeout(() => {
          authTitle.textContent = '로그인';
          authUserNameInput.style.display = 'none';
          authUserNameInput.required = false;
          authBirthdateInput.style.display = 'none';
          const consentSec = document.getElementById('consent-section');
          if (consentSec) consentSec.style.display = 'none';
          authForm.dataset.mode = 'login';
          authMessage.textContent = '';
          authPasswordInput.value = '';
        }, 1500);
      }
    } else {
      const errText = await res.text();
      authMessage.style.color = 'red';
      authMessage.textContent = `오류: ${errText}`;
    }
  } catch (err) {
    authMessage.style.color = 'red';
    authMessage.textContent = '서버 통신 오류';
  }
}

// ========== 메시지 전송 ==========
async function sendMessage(message) {
  const chatMessages = document.getElementById('chat-messages');
  const typingIndicator = document.getElementById('typing-indicator');

  if (!authToken) {
    addMessageToChat('ai', '로그인이 필요합니다.');
    return;
  }

  // 토큰 만료 체크
  if (isTokenExpired(authToken)) {
    performLogout('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
    return;
  }

  message = (message || '').trim();
  if (message === '' || isProcessing) return;

  isProcessing = true;
  addMessageToChat('user', message);

  typingIndicator.style.display = 'block';

  chatHistory.push({ role: 'user', content: message });

  // 생년월일 추가
  if (userBirthdate) {
    const existingDob = chatHistory.some((m) => m.role === 'user' && m.content && m.content.startsWith('[생년월일]'));
    if (!existingDob) {
      chatHistory.unshift({ role: 'user', content: `[생년월일] ${userBirthdate}` });
    }
  }

  // 최근 20개 메시지만 전송 (서버 부하 및 AI 토큰 초과 방지)
  const recentHistory = chatHistory.slice(-20);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ messages: recentHistory }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        performLogout('세션이 만료되었습니다. 다시 로그인해주세요.');
        typingIndicator.style.display = 'none';
        isProcessing = false;
        return;
      }

      throw new Error('Failed to get response');
    }

    const assistantMessageEl = document.createElement('div');
    assistantMessageEl.className = 'message ai';
    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'bubble';
    assistantMessageEl.appendChild(bubbleEl);
    chatMessages.appendChild(assistantMessageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let responseText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.trim()) continue;
        let jsonStr = line;
        if (line.startsWith('data: ')) {
          jsonStr = line.slice(6);
        }
        if (jsonStr.trim() === '[DONE]') continue;

        try {
          const jsonData = JSON.parse(jsonStr);
          if (jsonData.response) {
            responseText += jsonData.response;
            bubbleEl.textContent = responseText;
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        } catch (e) {
          // 파싱 오류 무시
        }
      }
    }

    chatHistory.push({ role: 'assistant', content: responseText });
    // 로컬 히스토리 100개 초과 시 오래된 것 제거 (localStorage 용량 보호)
    if (chatHistory.length > 100) chatHistory = chatHistory.slice(-100);
    saveHistory();

    // AI 응답을 서버 DB에 저장
    if (responseText) {
      fetch('/api/chat/save-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ aiResponse: responseText })
      }).catch(err => console.error('AI 응답 저장 실패:', err));
    }

  } catch (error) {
    console.error('Error:', error);
    addMessageToChat('ai', '오류가 발생했습니다. 다시 시도해주세요.');
  } finally {
    typingIndicator.style.display = 'none';
    isProcessing = false;
  }
}

// ========== 이벤트 리스너 초기화 ==========
function initEventListeners() {
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const authModal = document.getElementById('auth-modal');
  const authTitle = document.getElementById('auth-title');
  const authForm = document.getElementById('auth-form');
  const authUserNameInput = document.getElementById('auth-username');
  const authBirthdateInput = document.getElementById('auth-birthdate');
  const authCancelBtn = document.getElementById('auth-cancel');
  const authMessage = document.getElementById('auth-message');
  const chatHistoryItems = document.querySelectorAll('.chat-history li');

  const consentSection = document.getElementById('consent-section');

  // 로그인 버튼
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      authModal.style.display = 'flex';
      authTitle.textContent = '로그인';
      authUserNameInput.style.display = 'none';
      authUserNameInput.required = false;
      authBirthdateInput.style.display = 'none';
      authBirthdateInput.required = false;
      if (consentSection) consentSection.style.display = 'none';
      authForm.dataset.mode = 'login';
      authMessage.textContent = '';
    });
  }

  // 회원가입 버튼
  if (signupBtn) {
    signupBtn.addEventListener('click', (e) => {
      e.preventDefault();
      authModal.style.display = 'flex';
      authTitle.textContent = '회원가입';
      authUserNameInput.style.display = 'block';
      authUserNameInput.required = true;
      authBirthdateInput.style.display = 'block';
      authBirthdateInput.required = false;
      if (consentSection) {
        consentSection.style.display = 'block';
        // 체크박스 초기화
        const allCb = document.getElementById('consent-all');
        const items = document.querySelectorAll('.consent-item');
        if (allCb) allCb.checked = false;
        items.forEach(cb => cb.checked = false);
      }
      authForm.dataset.mode = 'signup';
      authMessage.textContent = '';
    });
  }

  // 취소 버튼
  if (authCancelBtn) {
    authCancelBtn.addEventListener('click', () => {
      authModal.style.display = 'none';
    });
  }

  // 로그아웃 버튼
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      performLogout('로그아웃되었습니다.');
    });
  }

  // 인증 폼 제출
  if (authForm) {
    authForm.addEventListener('submit', handleAuthSubmit);
  }

  // 채팅 기록 클릭
  chatHistoryItems.forEach(item => {
    item.addEventListener('click', () => {
      if (!authToken) {
        addMessageToChat('ai', '로그인 후 이용하실 수 있습니다.');
        return;
      }
      sendMessage(item.textContent.trim());
    });
  });

  // 개인정보 동의 체크박스 로직
  initConsentListeners();
}

// ========== 개인정보 동의 체크박스 ==========
function initConsentListeners() {
  const consentAll = document.getElementById('consent-all');
  const consentItems = document.querySelectorAll('.consent-item');

  if (!consentAll || consentItems.length === 0) return;

  // 전체 동의 → 개별 체크박스 일괄 변경
  consentAll.addEventListener('change', () => {
    consentItems.forEach(cb => cb.checked = consentAll.checked);
  });

  // 개별 체크박스 변경 → 전체 동의 상태 동기화
  consentItems.forEach(cb => {
    cb.addEventListener('change', () => {
      consentAll.checked = Array.from(consentItems).every(item => item.checked);
    });
  });
}

// ========== 초기화 ==========
document.addEventListener('DOMContentLoaded', () => {
  // 토큰 만료 체크
  if (authToken && isTokenExpired(authToken)) {
    performLogout('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
  }

  // 이벤트 리스너 등록
  initEventListeners();

  // 초기화
  loadHistory();

  // localStorage에서 생년월일 다시 로드 (새로고침 대비)
  const savedBirthdate = localStorage.getItem('userBirthdate');
  if (savedBirthdate) {
    userBirthdate = savedBirthdate;

    // 생년월일이 저장되어 있으면 표시
    const birthdateDisplay = document.getElementById('birthdate-display');
    const birthdateSection = document.getElementById('birthdate-section');
    const zodiac = calculateZodiacSign(userBirthdate);



    if (birthdateDisplay) {
      birthdateDisplay.textContent = zodiac
        ? `생년월일: ${userBirthdate} (${zodiac.name})`
        : `생년월일: ${userBirthdate}`;
    }
    if (birthdateSection) {
      birthdateSection.style.display = 'block';
    }

    // 별자리 UI 업데이트
    updateZodiacUI(userBirthdate);
  }

  updateAuthUI();
  updateTodayDate();
});
