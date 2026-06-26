# NEXTORY Homepage

Vite로 빌드하는 정적 GitHub Pages 사이트입니다. 소스는 HTML, CSS, JavaScript만 사용합니다.

## 개발

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

빌드 결과는 `dist`에 생성됩니다.

## GitHub Pages 배포

1. GitHub 저장소에 이 프로젝트를 push합니다.
2. Repository Settings > Pages로 이동합니다.
3. Build and deployment Source를 GitHub Actions로 설정합니다.
4. `main` 브랜치에 push하면 `.github/workflows/deploy-pages.yml`이 `dist`를 빌드하고 배포합니다.

`vite.config.js`의 `base`는 `./`로 설정되어 있어 프로젝트 페이지 경로에서도 상대 경로로 동작합니다.
