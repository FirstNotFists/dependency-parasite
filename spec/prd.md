# PRD: Dependency Parasite (디펜던시 기생충)

> "당신의 코드는 그저 숙주일 뿐입니다."

## 1. 프로젝트 개요

### 1.1 배경

현대의 소프트웨어는 거대한 오픈소스 생태계 위에 만들어진다. 개발자는 직접 코드를 작성하지만, 실제 실행 가능한 제품의 상당 부분은 프레임워크, 빌드 도구, UI 라이브러리, 데이터 클라이언트, 테스트 도구 같은 외부 의존성으로 구성된다.

`Dependency Parasite`는 이 사실을 과장된 생물학적 은유로 보여주는 웹 실험이다. 사용자가 GitHub 레포지토리를 입력하면 프로젝트의 의존성을 분석하고, 그 의존성들이 작은 숙주 코드를 둘러싸고 기생하는 3D 생명체로 시각화한다.

### 1.2 목표

- GitHub 레포지토리의 `package.json` 의존성을 분석한다.
- 외부 의존성을 3D 기생 생물의 형태, 크기, 색상, 움직임으로 변환한다.
- AI가 의존성 조합을 생물학적 도감처럼 해석하고, 이그노벨상 스타일의 설명을 생성한다.
- 사용자가 결과를 보고 웃으면서도 "내 프로젝트가 무엇에 기대고 있는지" 직관적으로 이해하게 만든다.

### 1.3 슬로건

"창조주인가, 조립공인가? 당신의 프로젝트를 잠식한 기생충의 정체를 확인하세요."

### 1.4 현재 프로젝트 상태

현재 구현은 `GitHub 스캔 전 단계의 3D 시각 콘셉트 프로토타입`이다.

- 샘플 의존성 배열을 기반으로 54개의 기생체를 생성한다.
- 중앙의 금색 구체를 숙주 코드의 핵으로 표현한다.
- 기생체는 `centipede`, `pustule`, `maggot` 3가지 변종으로 렌더링된다.
- `react-three/fiber`, `@react-three/drei`, `three` 기반으로 Canvas, 조명, 안개, 별 배경, OrbitControls를 구성했다.
- 화면에는 실험실 도감 톤의 히어로 패널, 분석 요약 패널, 도감 카드, 의존성 태그 클라우드가 배치되어 있다.
- Vite 최신 기반 프로젝트로 정리되었고, pnpm, Vercel, GitHub Actions 배포 구성이 준비되어 있다.

## 2. 사용자와 사용 시나리오

### 2.1 주요 사용자

- 해커톤 심사위원: 짧은 시간 안에 아이디어, 기술 구현, 시각적 완성도를 확인하고 싶은 사람.
- 프론트엔드/풀스택 개발자: 자신의 프로젝트가 얼마나 많은 의존성 위에 서 있는지 재미있게 확인하고 싶은 사람.
- 오픈소스 관찰자: 프로젝트의 기술 스택과 의존성 구조를 빠르게 파악하고 싶은 사람.

### 2.2 핵심 사용자 여정

1. 사용자는 랜딩 화면에서 기괴한 3D 샘플 생명체를 본다.
2. GitHub 레포지토리 URL 입력창에 `https://github.com/{owner}/{repo}` 형식의 주소를 넣는다.
3. 앱은 레포지토리의 manifest 파일을 가져오고 의존성 목록을 파싱한다.
4. 앱은 의존성 개수, devDependency 비율, 주요 생태계, 위험도를 계산한다.
5. AI는 프로젝트를 하나의 생물종으로 명명하고 도감 설명을 생성한다.
6. 3D 씬은 샘플 데이터에서 실제 레포지토리 분석 결과 기반의 생명체로 변한다.
7. 사용자는 결과 카드를 공유하거나 스크린샷으로 저장한다.

## 3. 범위

### 3.1 MVP 범위

- GitHub URL 입력 및 검증
- public GitHub 레포지토리의 `package.json` 조회
- `dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies` 파싱
- 의존성 수와 카테고리 기반 간단한 위험도 계산
- 현재 구현된 3D 기생체 렌더링을 실제 분석 데이터와 연결
- Gemini API 기반 도감 JSON 생성
- 분석 결과 패널과 도감 카드 갱신
- Vercel 프로덕션 배포

### 3.2 MVP 이후 확장

- `requirements.txt`, `pyproject.toml`, `go.mod`, `Cargo.toml` 지원
- GitHub 커밋/언어 통계 기반 직접 작성 코드 비율 추정
- 결과 이미지 캡처 및 공유 링크 생성
- GitHub API rate limit 대응을 위한 토큰 옵션
- 의존성 보안 취약점 또는 라이선스 위험도 시각화
- 프로젝트별 결과 캐싱

### 3.3 명시적으로 제외하는 범위

- private repository 분석
- 실제 `node_modules` 용량 원격 계산
- 모든 언어의 lockfile 완전 분석
- 사용자 계정/로그인 시스템
- 장기 저장되는 분석 히스토리

## 4. 핵심 기능 명세

### 4.1 랜딩 및 샘플 렌더링

현재 구현된 샘플 생명체는 제품의 첫인상을 담당한다.

- 앱 진입 즉시 3D 생명체가 렌더링되어야 한다.
- 사용자가 URL을 입력하지 않아도 프로젝트의 콘셉트를 이해할 수 있어야 한다.
- 중앙의 숙주 핵은 작고 밝아야 하며, 외부 의존성 기생체는 수적으로 압도적이어야 한다.
- 카메라는 자동 회전하되 사용자가 OrbitControls로 장면을 둘러볼 수 있어야 한다.
- 모바일에서는 패널이 겹치지 않고 세로 흐름으로 읽혀야 한다.

### 4.2 GitHub URL 입력

사용자는 GitHub 레포지토리 URL을 입력해 분석을 시작한다.

지원 입력 예시:

```text
https://github.com/facebook/react
github.com/vercel/next.js
vercel/next.js
```

검증 규칙:

- owner와 repo를 추출할 수 없으면 오류 메시지를 보여준다.
- GitHub 외 URL은 MVP에서 지원하지 않는다.
- 분석 중에는 버튼을 비활성화하고 로딩 상태를 보여준다.
- 같은 URL을 다시 분석할 수 있어야 한다.

### 4.3 GitHub 데이터 수집

MVP는 GitHub REST API의 contents endpoint를 사용한다.

```text
GET https://api.github.com/repos/{owner}/{repo}/contents/package.json
```

성공 시:

- base64 encoded content를 decode한다.
- JSON parse 후 dependency group을 추출한다.
- package name, version range, group 정보를 표준 구조로 변환한다.

실패 시:

- `404`: 레포지토리 또는 `package.json`이 없다는 메시지를 보여준다.
- `403`: GitHub rate limit 가능성을 안내한다.
- JSON parse 실패: manifest 파일 형식이 올바르지 않다고 안내한다.
- 네트워크 오류: 재시도 가능한 오류로 표시한다.

### 4.4 의존성 분석

분석 레이어는 UI와 AI가 함께 사용할 정규화된 결과를 만든다.

계산 항목:

- 전체 의존성 수
- runtime dependency 수
- development dependency 수
- devDependency 비율
- 의존성 이름 길이, 생태계 키워드, 알려진 무거운 도구 여부
- 시각화에 사용할 색상, 크기, 변종, seed

위험도 산정 예시:

- 0-10개: `Contained`
- 11-30개: `Mutating`
- 31-60개: `Invasive`
- 61개 이상: `Extremely High`

숙주 보존율(`host_integrity`)은 의존성 수와 devDependency 비율을 기반으로 계산한다. MVP에서는 재미를 위한 추정값으로 표시하고, 실제 코드량의 정확한 측정값처럼 표현하지 않는다.

### 4.5 AI 생물학적 도감

Gemini는 정규화된 의존성 분석 결과를 받아 도감 문구와 시각 파라미터를 생성한다.

API key는 클라이언트에 노출하지 않는다. Vercel Serverless Function 또는 별도 API route를 통해 호출한다.

입력 데이터 예시:

```json
{
  "repo": "owner/repo",
  "package_name": "sample-app",
  "dependency_count": 54,
  "dependency_groups": {
    "dependencies": ["react", "vite", "three"],
    "devDependencies": ["typescript", "eslint"]
  },
  "risk_level": "Invasive"
}
```

출력 데이터 구조:

```json
{
  "species_name": "Node-Centipede Reactus",
  "danger_level": "Extremely High",
  "host_integrity": "3% / Barely alive",
  "bio_report": "이 생명체는 외부 단백질의 관성으로 움직입니다. 숙주는 중앙에서 희미하게 빛나지만, 지휘권은 이미 node_modules에게 넘어갔습니다.",
  "visual_params": {
    "primary_color": "#4dff00",
    "secondary_color": "#ff4df3",
    "pulse_speed": 2.5,
    "chaos_factor": 0.8
  }
}
```

AI 실패 시 fallback:

- 로컬 규칙 기반 종 이름을 생성한다.
- 위험도와 의존성 수 기반의 기본 도감 문구를 보여준다.
- 3D 시각화는 중단하지 않는다.

### 4.6 3D 시각화

현재 구현은 커스텀 Three.js 오브젝트를 직접 구성하는 방식이다.

구성 요소:

- `HostNucleus`: 숙주 코드. 작은 금색 발광 구체.
- `DependencySwarm`: 전체 기생체 군집. 천천히 회전하며 살아 있는 느낌을 준다.
- `WrithingTether`: 숙주와 기생체를 잇는 흐릿한 선.
- `WriggleShell`: 의존성 하나를 표현하는 기생체.
- `ParasiteScene`: 배경, 안개, 조명, 카메라 컨트롤을 포함한 3D 씬.

기생체 변종:

- `centipede`: 여러 구체 segment와 다리를 가진 다지류형.
- `pustule`: 중심 포자와 작은 돌기들이 붙은 농포형.
- `maggot`: 여러 타원형 segment가 이어진 유충형.

데이터 매핑:

- 의존성 이름: key, label, seed 생성에 사용
- dependency group: 변종 선택에 사용
- dependency count: 전체 swarm 밀도에 사용
- risk level: 색상 대비, pulse speed, chaos factor에 사용
- version range: 향후 불안정성 표현에 사용

성능 기준:

- 일반 노트북에서 초기 렌더링 2초 이내
- 60개 내외 의존성까지 상호작용 가능해야 함
- 모바일에서는 `dpr`과 렌더링 개수를 낮추는 옵션 고려

### 4.7 결과 UI

현재 화면 구성은 다음 제품 UI의 기반이다.

- Hero panel: 프로젝트 콘셉트와 입력 폼 영역
- Scan panel: 종명, 숙주 보존율, 침투 벡터 요약
- Codex card: AI 도감 설명과 의존성 태그 클라우드
- Viewer overlay: 렌더링 상태 표시

추가되어야 할 상태:

- idle: 샘플 생명체와 입력 폼 표시
- loading: GitHub/AI 분석 중 상태
- success: 실제 분석 결과 반영
- error: 원인별 오류 메시지와 재시도 버튼

## 5. 데이터 모델

### 5.1 Dependency

```ts
type DependencyGroup =
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'optionalDependencies'

type Dependency = {
  name: string
  versionRange: string
  group: DependencyGroup
}
```

### 5.2 Parasite

```ts
type ParasiteVariant = 'centipede' | 'pustule' | 'maggot'

type Parasite = {
  name: string
  color: string
  variant: ParasiteVariant
  seed: number
  size: number
  position: [number, number, number]
}
```

### 5.3 AnalysisResult

```ts
type AnalysisResult = {
  repository: string
  packageName: string
  dependencies: Dependency[]
  dependencyCount: number
  riskLevel: 'Contained' | 'Mutating' | 'Invasive' | 'Extremely High'
  hostIntegrity: number
  aiReport: {
    speciesName: string
    dangerLevel: string
    bioReport: string
    visualParams: {
      primaryColor: string
      secondaryColor: string
      pulseSpeed: number
      chaosFactor: number
    }
  }
}
```

## 6. 기술 아키텍처

### 6.1 현재 스택

- Package Manager: pnpm 10
- Frontend: React 19, TypeScript, Vite 8
- 3D: Three.js, `@react-three/fiber`, `@react-three/drei`
- Styling: CSS modules 없이 전역 CSS 기반
- Lint: ESLint 10, typescript-eslint
- Deployment: Vercel
- CI/CD: GitHub Actions에서 main push 시 Vercel CLI 배포

### 6.2 예정 스택

- Data Fetching: GitHub REST API
- AI Engine: Gemini Flash 계열 모델
- API Boundary: Vercel Serverless Function
- Capture: `html-to-image` 또는 Canvas screenshot 기반 검토

### 6.3 배포 구조

`main` 브랜치에 push 또는 merge가 발생하면 GitHub Actions가 실행된다.

1. `pnpm install --frozen-lockfile`
2. `pnpm run lint`
3. `pnpm run build`
4. `vercel pull --environment=production`
5. `vercel build --prod`
6. `vercel deploy --prebuilt --prod`

필요한 GitHub Actions secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## 7. UX 원칙

- 첫 화면은 설명보다 시각적 충격이 먼저 와야 한다.
- 농담은 과장되게 하되, 데이터는 사용자가 납득 가능한 방식으로 보여준다.
- 기괴하지만 읽기 어려우면 안 된다. 패널 텍스트는 실험실 보고서처럼 차분하게 유지한다.
- 입력, 로딩, 실패, 성공 상태가 명확해야 한다.
- AI 응답이 실패해도 제품의 핵심 경험인 3D 렌더링은 유지되어야 한다.

## 8. 수용 기준

### 8.1 기능 수용 기준

- 사용자가 GitHub URL을 입력하고 분석 버튼을 누를 수 있다.
- public npm 프로젝트의 `package.json`을 파싱할 수 있다.
- 의존성 목록이 3D 기생체 목록으로 변환된다.
- 결과 패널의 종명, 위험도, 숙주 보존율, 도감 설명이 분석 결과에 따라 바뀐다.
- GitHub API 실패와 AI API 실패가 서로 다른 메시지로 표시된다.
- 샘플 데이터 fallback으로 언제나 데모가 가능하다.

### 8.2 품질 수용 기준

- `pnpm run lint`가 통과한다.
- `pnpm run build`가 통과한다.
- Vercel production 배포가 성공한다.
- API key가 클라이언트 번들에 포함되지 않는다.
- 모바일 폭에서도 주요 패널과 3D 씬이 사용 가능하다.

## 9. 해커톤 로드맵

### Phase 0: 완료된 기반 작업

- Vite + React + TypeScript 프로젝트 구성
- pnpm lockfile 구성
- 3D 샘플 생명체 렌더링
- 실험실 도감 톤 UI 구성
- Vercel 배포 및 GitHub Actions 배포 워크플로 준비

### Phase 1: GitHub 분석 연결

- URL parser 구현
- GitHub contents API 호출
- `package.json` parser 구현
- 분석 상태 관리 추가
- 샘플 의존성 대신 실제 의존성으로 swarm 생성

### Phase 2: AI 도감 연결

- Vercel Serverless Function 추가
- Gemini prompt와 JSON schema 정의
- AI 응답 validation
- fallback report 생성기 구현

### Phase 3: 시각화 고도화

- dependency group별 변종 매핑
- risk level별 색상/속도/밀도 조절
- 로딩 중 배양액 또는 스캔 애니메이션 추가
- 결과 전환 시 생명체가 변이하는 연출 추가

### Phase 4: 시연 완성

- 결과 공유/캡처
- 예시 레포지토리 quick scan 버튼
- 문구 다듬기
- 모바일 QA
- Vercel production 최종 확인

## 10. 심사위원 어필 포인트

- 기술적 완주: 데이터 수집, AI 분석, 3D 렌더링, 배포까지 하나의 파이프라인으로 연결한다.
- 시각적 기억점: 단순 차트 대신 의존성을 생명체로 의인화해 강한 첫인상을 만든다.
- 유머와 통찰: "내가 코드를 짠다"는 감각을 뒤집고, 오픈소스 생태계의 거대함을 웃기지만 정확하게 보여준다.
- 확장성: npm 프로젝트에서 시작하지만 Python, Go, Rust 등 다른 생태계로 확장 가능한 구조다.

## 11. 오픈 이슈

- Gemini API를 어떤 서버리스 라우트 구조로 감쌀지 결정해야 한다.
- GitHub rate limit을 토큰 없이 감당할지, 선택적 토큰 입력을 둘지 결정해야 한다.
- `host_integrity`가 재미용 추정값임을 UI에서 얼마나 명확히 표현할지 정해야 한다.
- 60개 이상 의존성에서 모바일 성능을 어떻게 낮출지 결정해야 한다.
- 현재 Vercel 프로젝트의 GitHub App 연결 권한은 별도 확인이 필요하다.