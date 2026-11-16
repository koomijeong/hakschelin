# 학슐랭 · GitHub Pages 시연 버전

실행 주소: https://koomijeong.github.io/hakschelin/

`index.html`은 GitHub Pages에서 서버 없이 실행하도록 묶은 시연 앱입니다. `assets/app-icon.png`, `assets/chacha.png`와 함께 배포합니다.

## Pages 켜기

GitHub 저장소 Settings → Pages → Build and deployment:
- Source: Deploy from a branch
- Branch: main
- Folder: /(root)
- Save

설정: https://github.com/koomijeong/hakschelin/settings/pages

## 시연 기능

직접 설정하는 프로필, 예산·목표 추천, 찜, 평론·답글·좋아요, 메뉴 선택·취소, 리포트와 배지를 체험할 수 있습니다. 내 활동은 현재 브라우저에만 저장됩니다. 다른 기기와 공유되지 않으며 브라우저 데이터를 삭제하면 지워질 수 있습니다.

다른 미식가의 평론과 라운지 대화는 가상 데이터입니다. 대화 작성은 현재 브라우저에서만 체험할 수 있으며 실제 다른 이용자에게 전송되지 않습니다. GPT·계정 로그인·공용 실시간 채팅 서버·실제 학식 공급 API는 이 Pages 시연 버전에 연결되어 있지 않습니다.

기존 server.mjs·app.js·style.css 등은 원래 서버 버전의 소스이며, Pages 실행용 index.html은 필요한 화면과 로직을 내부에 포함합니다.
