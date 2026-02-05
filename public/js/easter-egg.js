/**
 * 🎨 개발자 콘솔 이스터에그
 * F12를 눌러 개발자 도구를 열면 표시됩니다
 */

(function() {
  'use strict';
  
  // 콘솔 스타일 정의
  const styles = {
    title: 'color: #9DB2F5; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);',
    subtitle: 'color: #C7D7F9; font-size: 14px; font-weight: normal;',
    fortune: 'color: #FAE8D3; font-size: 16px; font-weight: bold; background: #2B2F6F; padding: 10px; border-radius: 5px;',
    info: 'color: #B3C5F9; font-size: 12px;',
    link: 'color: #6E7DD8; font-size: 12px; text-decoration: underline;',
    emoji: 'font-size: 32px;'
  };

  // ASCII 아트 (운세 테마)
  const asciiArt = `
    ╔═══════════════════════════════════════╗
    ║                                       ║
    ║        ✨ 운세 AI 챗봇 ✨             ║
    ║                                       ║
    ║         오늘의 개발자 운세              ║
    ║                                       ║
    ╚═══════════════════════════════════════╝
  `;

  // 랜덤 개발자 운세 메시지
  const devFortunes = [
    '오늘은 버그 없이 코드가 한 번에 실행되는 행운의 날입니다! 🍀',
    '오늘 당신의 코드는 완벽하게 컴파일될 것입니다. 테스트도 통과! ✨',
    '오늘은 Stack Overflow를 찾지 않아도 해결되는 날입니다! 🎯',
    '주석 없는 코드도 이해되는 신비로운 하루가 될 것입니다. 📖',
    '오늘은 merge conflict 없이 PR이 승인되는 날입니다! 🎉',
    '카페인 없이도 생산성이 높은 하루가 될 것입니다! ☕',
    '오늘 작성한 코드는 레거시가 되지 않을 것입니다. 🏆',
    '오늘은 "왜 이게 되지?"보다 "왜 이게 안 되지?"가 많을 것입니다. 🤔',
    '오늘 당신의 코드 리뷰는 칭찬만 가득할 것입니다! 👍',
    '오늘은 배포가 롤백 없이 성공하는 날입니다! 🚀'
  ];

  // 랜덤 운세 선택
  const randomFortune = devFortunes[Math.floor(Math.random() * devFortunes.length)];

  // 현재 날짜
  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  // 콘솔 메시지 출력
  console.clear();
  console.log('%c' + asciiArt, 'color: #9DB2F5; font-family: monospace;');
  console.log('%c🔮 ' + dateStr + ' 개발자 운세', styles.title);
  console.log('%c' + randomFortune, styles.fortune);
  console.log('');
  console.log('%c💡 오늘도 즐거운 코딩 되세요!', styles.subtitle);
  console.log('');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #C7D7F9;');
  console.log('');
  console.log('%c📌 프로젝트 정보', 'color: #9DB2F5; font-weight: bold;');
  console.log('%c├─ 이름: 운세 AI 챗봇', styles.info);
  console.log('%c├─ 기술: Cloudflare Workers AI (Llama 3.1)', styles.info);
  console.log('%c├─ 데이터베이스: D1 Database', styles.info);
  console.log('%c└─ 프레임워크: Vanilla JavaScript', styles.info);
  console.log('');
  console.log('%c🌟 재미있게 사용하고 계신가요?', styles.subtitle);
  console.log('%cGitHub: https://github.com/gguatit/Today-s-horoscope', styles.link);
  console.log('');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #C7D7F9;');
  console.log('');
  console.log('%c🎮 숨겨진 기능을 찾고 싶으시다면?', styles.subtitle);
  console.log('%clocalStorage를 확인해보세요! 또는 window.easterEgg()를 실행해보세요 😉', styles.info);
  console.log('');

  // 전역 함수로 추가 이스터에그 제공
  window.easterEgg = function() {
    console.clear();
    console.log('%c🎉 축하합니다! 숨겨진 개발자 메뉴를 찾으셨습니다!', 'color: #FAE8D3; font-size: 18px; font-weight: bold;');
    console.log('');
    console.log('%c사용 가능한 명령어:', 'color: #9DB2F5; font-weight: bold;');
    console.log('%c• showFortune() - 새로운 개발자 운세 보기', styles.info);
    console.log('%c• showZodiac() - 12별자리 정보 보기', styles.info);
    console.log('%c• showStats() - 현재 세션 통계 보기', styles.info);
    console.log('%c• clearAll() - 모든 데이터 초기화', styles.info);
    console.log('%c• showAsciiArt() - ASCII 아트 보기', styles.info);
    console.log('%c• rainbowMode() - 🌈 무지개 모드 활성화', styles.info);
    console.log('%c• bugHunter() - 🐛 버그 헌터 게임 시작', styles.info);
    console.log('');
  };

  // 새로운 운세 보기
  window.showFortune = function() {
    const newFortune = devFortunes[Math.floor(Math.random() * devFortunes.length)];
    console.log('%c🔮 새로운 운세:', 'color: #9DB2F5; font-weight: bold;');
    console.log('%c' + newFortune, styles.fortune);
  };

  // 12별자리 정보 보기
  window.showZodiac = function() {
    const zodiacList = [
      '♈ 양자리 (3.21-4.19): 열정과 추진력',
      '♉ 황소자리 (4.20-5.20): 안정과 물질적 성취',
      '♊ 쌍둥이자리 (5.21-6.21): 소통과 정보 교환',
      '♋ 게자리 (6.22-7.22): 감성과 가족애',
      '♌ 사자자리 (7.23-8.22): 자신감과 창의력',
      '♍ 처녀자리 (8.23-9.23): 세심함과 분석력',
      '♎ 천칭자리 (9.24-10.22): 균형과 조화',
      '♏ 전갈자리 (10.23-11.22): 직관력과 통찰력',
      '♐ 사수자리 (11.23-12.21): 모험과 자유',
      '♑ 염소자리 (12.22-1.19): 목표 달성과 성취',
      '♒ 물병자리 (1.20-2.18): 독창성과 개방성',
      '♓ 물고기자리 (2.19-3.20): 상상력과 공감능력'
    ];
    console.log('%c✨ 12별자리 정보', 'color: #9DB2F5; font-size: 16px; font-weight: bold;');
    zodiacList.forEach(zodiac => {
      console.log('%c' + zodiac, styles.info);
    });
  };

  // 통계 보기
  window.showStats = function() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('authUserName');
    const birthdate = localStorage.getItem('userBirthdate');
    const history = localStorage.getItem('chatHistory');
    const historyCount = history ? JSON.parse(history).length : 0;
    const bugStats = JSON.parse(localStorage.getItem('bugHunterStats') || '{"found": 0, "attempts": 0}');

    console.log('%c📊 현재 세션 통계', 'color: #9DB2F5; font-size: 16px; font-weight: bold;');
    console.log('%c로그인 상태: ' + (token ? '✅ 로그인됨' : '❌ 로그아웃'), styles.info);
    if (user) console.log('%c사용자 이름: ' + user, styles.info);
    if (birthdate) console.log('%c생년월일: ' + birthdate, styles.info);
    console.log('%c대화 기록: ' + historyCount + '개', styles.info);
    console.log('');
    console.log('%c🐛 버그 헌터 통계', 'color: #9DB2F5; font-weight: bold;');
    console.log(`%c버그 발견: ${bugStats.found}개 / 시도: ${bugStats.attempts}회`, styles.info);
    if (bugStats.attempts > 0) {
      const successRate = ((bugStats.found / bugStats.attempts) * 100).toFixed(1);
      console.log(`%c성공률: ${successRate}%`, styles.info);
    }
  };

  // 모든 데이터 초기화
  window.clearAll = function() {
    if (confirm('⚠️ 모든 로컬 데이터를 삭제하시겠습니까?\n(로그인 정보와 대화 기록이 모두 삭제됩니다)')) {
      localStorage.clear();
      console.log('%c✅ 모든 데이터가 초기화되었습니다. 페이지를 새로고침하세요.', 'color: #FAE8D3; font-weight: bold;');
    }
  };

  // ASCII 아트 갤러리
  window.showAsciiArt = function() {
    const arts = [
      `
    　　　　★
    　　　★　★
    　　★　　　★
    　★　　　　　★
    　　★　　　★
    　　　★　★
    　　　　★
      `,
      `
    　　　🌙
    　　✨　　✨
    　✨　　　　✨
    　✨　　　　✨
    　　✨　　✨
    　　　✨✨
      `,
      `
    ╔═══════╗
    ║ 🔮 운세 ║
    ╚═══════╝
      `
    ];
    
    const randomArt = arts[Math.floor(Math.random() * arts.length)];
    console.log('%c' + randomArt, 'color: #9DB2F5; font-size: 14px;');
  };

  // 무지개 모드 🌈
  let rainbowActive = false;
  window.rainbowMode = function() {
    rainbowActive = !rainbowActive;
    
    if (rainbowActive) {
      console.log('%c🌈 무지개 모드 활성화! 콘솔이 화려해집니다!', 'color: #FF6B6B; font-size: 16px; font-weight: bold;');
      
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
      const messages = [
        '✨ 반짝반짝 빛나는 코드',
        '🎨 아름다운 알고리즘',
        '🌟 완벽한 리팩토링',
        '💎 보석같은 로직',
        '🎪 신나는 디버깅',
        '🎭 우아한 디자인 패턴',
        '🎨 컬러풀한 콘솔',
        '🌈 무지개 운세'
      ];
      
      let count = 0;
      const interval = setInterval(() => {
        if (!rainbowActive || count >= 20) {
          clearInterval(interval);
          if (rainbowActive) {
            console.log('%c🌈 무지개 모드가 종료되었습니다!', 'color: #9DB2F5; font-weight: bold;');
            rainbowActive = false;
          }
          return;
        }
        
        const color = colors[count % colors.length];
        const message = messages[Math.floor(Math.random() * messages.length)];
        console.log('%c' + message, `color: ${color}; font-size: 14px; font-weight: bold;`);
        count++;
      }, 200);
      
      console.log('%crainbowMode()를 다시 입력하면 중지됩니다', 'color: #B3C5F9; font-size: 11px;');
    } else {
      console.log('%c🌈 무지개 모드가 비활성화되었습니다', 'color: #9DB2F5; font-weight: bold;');
    }
  };

  // 버그 헌터 게임 🐛
  window.bugHunter = function() {
    console.clear();
    console.log('%c🐛 버그 헌터 게임에 오신 것을 환영합니다!', 'color: #FAE8D3; font-size: 20px; font-weight: bold;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #C7D7F9;');
    console.log('');
    console.log('%c🎯 목표: 코드에서 숨어있는 버그를 찾으세요!', 'color: #9DB2F5; font-weight: bold;');
    console.log('%c💡 힌트: findBug(번호)를 입력하여 버그를 찾으세요 (1-5)', 'color: #B3C5F9;');
    console.log('');
    
    const bugs = [
      { code: 'if (user = null)', issue: '비교 연산자 == 대신 할당 연산자 = 사용', line: '🐛' },
      { code: 'array.legnth', issue: 'length 철자 오류 (legnth)', line: '🐛' },
      { code: 'for(let i=0; i<10; i--)', issue: '무한 루프 (i++ 대신 i--)', line: '🐛' },
      { code: 'JSON.parse(undefined)', issue: 'undefined를 parse할 수 없음', line: '🐛' },
      { code: 'const result = await promise;', issue: 'async 함수 내부가 아닌데 await 사용', line: '🐛' }
    ];
    
    const bugIndex = Math.floor(Math.random() * bugs.length);
    const selectedBug = bugs[bugIndex];
    
    console.log('%c📝 의심스러운 코드들:', 'color: #9DB2F5; font-weight: bold; font-size: 14px;');
    bugs.forEach((bug, index) => {
      console.log(`%c${index + 1}. ${bug.code}`, 'color: #C7D7F9; font-family: monospace; font-size: 13px;');
    });
    console.log('');
    
    window.findBug = function(num) {
      if (num < 1 || num > 5) {
        console.log('%c❌ 1-5 사이의 숫자를 입력하세요!', 'color: #FF6B6B; font-weight: bold;');
        return;
      }
      
      if (num - 1 === bugIndex) {
        console.log('%c🎉 정답입니다! 버그를 찾았습니다!', 'color: #4ECDC4; font-size: 16px; font-weight: bold;');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #C7D7F9;');
        console.log('%c🐛 발견한 버그:', 'color: #9DB2F5; font-weight: bold;');
        console.log(`%c코드: ${selectedBug.code}`, 'color: #C7D7F9; font-family: monospace;');
        console.log(`%c문제: ${selectedBug.issue}`, 'color: #FAE8D3;');
        console.log('');
        console.log('%c🏆 당신은 진정한 버그 헌터입니다!', 'color: #F7DC6F; font-weight: bold;');
        console.log('%cbugHunter()를 다시 실행하면 새로운 게임을 시작할 수 있습니다', 'color: #B3C5F9; font-size: 11px;');
        
        // 통계 저장
        const stats = JSON.parse(localStorage.getItem('bugHunterStats') || '{"found": 0, "attempts": 0}');
        stats.found++;
        stats.attempts++;
        localStorage.setItem('bugHunterStats', JSON.stringify(stats));
        
      } else {
        console.log('%c❌ 틀렸습니다! 다시 시도해보세요', 'color: #FF6B6B; font-weight: bold;');
        console.log('%c💡 힌트: 문법 오류나 논리 오류를 찾아보세요', 'color: #B3C5F9;');
        
        // 통계 업데이트
        const stats = JSON.parse(localStorage.getItem('bugHunterStats') || '{"found": 0, "attempts": 0}');
        stats.attempts++;
        localStorage.setItem('bugHunterStats', JSON.stringify(stats));
      }
    };
    
    console.log('%c예시: findBug(3) - 3번 코드를 선택', 'color: #6E7DD8; font-size: 11px; font-style: italic;');
    console.log('');
  };

  // 환영 메시지
  console.log('%c환영합니다, 개발자님! 👨‍💻', 'color: #FAE8D3; font-size: 14px;');
  console.log('%cwindow.easterEgg()를 입력하면 더 많은 기능을 사용할 수 있습니다!', 'color: #B3C5F9; font-size: 12px;');
  
})();
