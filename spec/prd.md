# PRD: Dependency Parasite (디펜던시 기생충)

> "당신의 코드는 그저 숙주일 뿐입니다."

## 1. 프로젝트 개요

### 1.1 배경

현대의 소프트웨어는 거대한 오픈소스 생태계 위에 만들어진다. 개발자는 직접 코드를 작성하지만, 실제 실행 가능한 제품의 상당 부분은 프레임워크, 빌드 도구, UI 라이브러리, 데이터 클라이언트, 테스트 도구 같은 외부 의존성으로 구성된다.

하지만 단순히 `package.json`에 패키지가 많다고 종속성이 높은 것은 아니다. 진짜 문제는 **깊이**다. 직접 선언한 12개의 의존성이 실제로는 847개의 전이 의존성을 끌고 오고, 내가 작성한 57KB의 코드가 847MB의 외부 코드 위에 서 있다면 — 우리는 과연 코드를 "창조"하고 있는가, 아니면 남이 만든 거대한 레고 블록들을 아슬아슬하게 조립만 하고 있는가?

`Dependency Parasite`는 이 질문을 과장된 생물학적 은유로 보여주는 웹 실험이다. 사용자가 GitHub 레포지토리를 입력하면 의존성의 **실제 깊이와 무게**를 분석하고, 작고 초라한 숙주 코드를 거대한 기생체들이 파먹듯 감싸는 3D 생명체로 시각화한다. 그리고 사용자가 직접 해부하고, 적출하고, 숙주를 벌거벗겨 보면서 자신의 프로젝트가 실제로 무엇 위에 서 있는지 체감하게 만든다.

### 1.2 목표

- GitHub 레포지토리의 의존성을 **양(수)이 아닌 질(깊이, 무게, 비율)**로 분석한다.
- 내가 작성한 코드 vs 외부 의존성 코드의 실제 비율을 산출하고 시각적으로 대비한다.
- 직접 의존성 뒤에 숨은 전이 의존성의 규모를 드러낸다.
- 사용자가 의존성을 해부하고, 적출하고, 숙주만 남겨보는 인터랙션을 통해 종속성의 무게를 체감하게 한다.
- AI가 이 분석 결과를 생물학적 도감처럼 해석하고, 이그노벨상 스타일의 설명을 생성한다.

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
3. 앱은 레포지토리의 `package.json`, 언어 통계, 의존성 트리를 수집한다.
4. 앱은 **내 코드 vs 외부 코드 비율**, 직접 vs 전이 의존성 격차, 기생 심각도를 산출한다.
5. AI는 분석 결과를 기반으로 생물종을 명명하고 도감 설명을 생성한다.
6. 3D 씬이 실제 분석 결과 기반의 생명체로 변환된다. 숙주 크기는 실제 코드 비율을 반영한다.
7. 사용자는 기생체를 **클릭(해부)**, **드래그 제거(적출)**, **"숙주만 보기" 버튼(나체 리빌)**으로 인터랙션한다.
8. 사용자는 결과 카드를 공유하거나 스크린샷으로 저장한다.

## 3. 범위

### 3.1 MVP 범위

- GitHub URL 입력 및 검증
- public GitHub 레포지토리의 `package.json` 조회
- `dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies` 파싱
- GitHub Languages API로 레포지토리의 직접 작성 코드량(bytes) 조회
- npm registry API로 각 직접 의존성의 전이 의존성 수 조회
- **내 코드 vs 외부 의존성 코드 비율** 산출
- **직접 의존성 vs 전이 의존성 격차** 시각화
- 비율 기반 기생 심각도 계산 (단순 갯수 기반이 아닌)
- 현재 구현된 3D 기생체 렌더링을 실제 분석 데이터와 연결
- **나체 숙주 리빌(Naked Host Reveal)**: 모든 기생체를 제거하고 숙주만 보여주는 인터랙션
- Gemini API 기반 도감 JSON 생성
- 분석 결과 패널과 도감 카드 갱신
- Vercel 프로덕션 배포

### 3.2 MVP 이후 확장

- **해부(Dissect) 모드**: 기생체 클릭 시 해당 패키지의 하위 의존성을 펼쳐 보여주는 인터랙션
- **적출(Extract) 시뮬레이션**: 의존성을 드래그 제거하면 연쇄적으로 의존하던 패키지들이 함께 떨어지는 연출
- **감염 타임라인**: git commit history에서 `package.json` 변경 이력을 추적해 의존성이 시간순으로 붙어가는 애니메이션
- `requirements.txt`, `pyproject.toml`, `go.mod`, `Cargo.toml` 지원
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
- 전이 의존성의 전이 의존성까지 재귀적 완전 탐색 (MVP에서는 1단계 깊이까지만)

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

MVP는 두 가지 GitHub REST API endpoint를 사용한다.

**4.3.1 package.json 조회**

```text
GET https://api.github.com/repos/{owner}/{repo}/contents/package.json
```

성공 시:

- base64 encoded content를 decode한다.
- JSON parse 후 dependency group을 추출한다.
- package name, version range, group 정보를 표준 구조로 변환한다.

**4.3.2 언어 통계 조회**

```text
GET https://api.github.com/repos/{owner}/{repo}/languages
```

성공 시:

- 언어별 바이트 수를 받는다. (예: `{ "TypeScript": 45000, "CSS": 12000 }`)
- 전체 합산하여 "사용자가 직접 작성한 코드의 총량"으로 사용한다.
- 이 값은 추정치임을 명시한다 (자동 생성 파일, 벤더 파일 포함 가능성).

실패 시:

- `404`: 레포지토리 또는 `package.json`이 없다는 메시지를 보여준다.
- `403`: GitHub rate limit 가능성을 안내한다.
- JSON parse 실패: manifest 파일 형식이 올바르지 않다고 안내한다.
- 네트워크 오류: 재시도 가능한 오류로 표시한다.
- Languages API 실패 시: 코드 비율 분석 없이 의존성 분석만 진행한다.

### 4.4 전이 의존성 수집

직접 의존성만으로는 실제 기생 규모를 알 수 없다. npm registry를 통해 전이 의존성을 조회한다.

```text
GET https://registry.npmjs.org/{package-name}/latest
```

각 직접 의존성에 대해:

- `dependencies` 필드에서 1단계 하위 의존성 목록을 추출한다.
- 전체 직접 의존성의 하위 의존성을 합산하여 "전이 의존성 총 수"를 산출한다.
- MVP에서는 1단계 깊이까지만 조회한다 (재귀적 완전 탐색은 MVP 이후).

성능 고려:

- 직접 의존성이 많을 경우 병렬 요청으로 처리한다.
- 요청 실패한 패키지는 건너뛰고, 성공한 패키지만으로 결과를 산출한다.
- 결과는 세션 내 캐싱하여 동일 레포 재분석 시 재사용한다.

### 4.5 의존성 분석

분석 레이어는 UI와 AI가 함께 사용할 정규화된 결과를 만든다. 핵심 관점은 **"내 코드가 전체에서 얼마나 작은가"**이다.

**4.5.1 코드 비율 분석**

핵심 산출값:

- `hostCodeBytes`: GitHub Languages API에서 가져온 직접 작성 코드 총 바이트
- `directDependencyCount`: `package.json`에 선언된 직접 의존성 수
- `transitiveDependencyCount`: npm registry에서 조회한 1단계 전이 의존성 총 수
- `totalParasiteCount`: 직접 + 전이 의존성의 합계
- `dependencyAmplification`: `전이 의존성 총 수 / 직접 의존성 수` (증폭 배율)
- `hostRatio`: 직접 작성 코드가 전체에서 차지하는 추정 비율

`hostRatio` 산출 방식:

```
hostRatio = hostCodeBytes / (hostCodeBytes + estimatedExternalBytes)
```

`estimatedExternalBytes`는 npm registry의 각 패키지 `dist.unpackedSize` 합산으로 추정한다. 정확한 값이 아닌 체감을 위한 과장된 추정치임을 UI에서 명시한다.

**4.5.2 기생 심각도 (Infestation Severity)**

단순 갯수가 아닌 복합 지표로 산정한다:

| 등급 | 조건 | 설명 |
|------|------|------|
| `Symbiotic` | hostRatio > 30% AND amplification < 3x | 아직 숙주가 주도권을 가지고 있다 |
| `Colonized` | hostRatio 10-30% OR amplification 3-10x | 기생체가 숙주보다 크다 |
| `Consumed` | hostRatio 1-10% OR amplification 10-30x | 숙주는 껍데기만 남았다 |
| `Hollow Shell` | hostRatio < 1% OR amplification > 30x | 숙주는 이름뿐이다. 실체는 기생체의 집합체다 |

**4.5.3 시각화 매핑**

- 숙주 구체의 크기: `hostRatio`에 비례. 비율이 낮을수록 물리적으로 작아진다.
- 기생체의 크기: 해당 패키지의 전이 의존성 수에 비례. 많이 끌고 올수록 거대하다.
- 기생체의 색상: dependency group별 구분
- 기생체의 변종: dependency group별 매핑
- swarm 밀도: `totalParasiteCount` 기반
- 애니메이션 속도/혼돈도: `dependencyAmplification`에 비례

### 4.6 사용자 인터랙션

분석 결과를 보여주는 것에 그치지 않고, 사용자가 직접 의존성의 무게를 체감하는 인터랙션을 제공한다.

**4.6.1 나체 숙주 리빌 (Naked Host Reveal) — MVP**

가장 강력한 감정적 펀치라인. MVP에 포함한다.

- 화면에 **"숙주만 보기"** 버튼을 배치한다.
- 버튼을 누르면 모든 기생체가 연출과 함께 사라진다 (바깥으로 흩어지거나 녹아내리는 애니메이션).
- 중앙에 `hostRatio`에 비례하는 아주 작고 초라한 빛 하나만 남는다.
- 텍스트가 나타난다: *"이것이 당신이 직접 작성한 코드의 전부입니다. (전체의 X%)"*
- 3초 후 기생체가 다시 사방에서 몰려들며 숙주를 감싸는 연출.
- 이 시퀀스가 프로젝트의 핵심 메시지를 전달하는 클라이맥스다.

**4.6.2 해부 모드 (Dissect Mode) — MVP 이후**

- 기생체 하나를 클릭하면 해당 패키지의 정보 패널이 뜬다.
- 패널에는 패키지명, 버전, 이 패키지가 끌고 오는 하위 의존성 목록이 표시된다.
- 3D 씬에서는 클릭한 기생체가 확대되며, 내부에서 더 작은 기생체들이 우글거리며 나타난다.
- "기생충의 기생충" — 의존성의 재귀적 본질을 체감하게 한다.

**4.6.3 적출 시뮬레이션 (Extract Simulation) — MVP 이후**

- 사용자가 기생체를 드래그하여 씬 바깥으로 던진다.
- 해당 패키지에 의존하던 다른 패키지들이 연쇄적으로 떨어져 나간다.
- 반대로, 아무것도 연쇄 반응이 없으면 → "이건 독립적인 기생충이었네" 피드백.
- 모든 기생체를 제거한 뒤 남는 숙주의 크기를 보여준다.

**4.6.4 감염 타임라인 (Infection Timeline) — MVP 이후**

- GitHub API로 `package.json` 파일의 commit history를 조회한다.
- 시간순으로 의존성이 하나씩 붙어가는 애니메이션을 재생한다.
- "2023-01: react 감염 → 2023-03: tailwind 기생 시작 → 2024-01: 37개 종이 군락 형성"
- 프로젝트가 서서히 잠식되는 과정을 영상처럼 보여준다.

### 4.7 AI 생물학적 도감 및 기생체 디자인 생성

Gemini는 두 가지 역할을 수행한다:
1. **도감 문구 생성**: 프로젝트 전체에 대한 생물학적 해석과 종 명명
2. **기생체별 고유 디자인 생성**: 각 의존성의 특성에 맞는 고유한 형태·색상·움직임 파라미터

API key는 클라이언트에 노출하지 않는다. Vercel Serverless Function 또는 별도 API route를 통해 호출한다.

**4.7.1 프로젝트 도감 생성**

입력 데이터 예시:

```json
{
  "repo": "owner/repo",
  "package_name": "sample-app",
  "host_code_bytes": 57000,
  "host_ratio": 0.006,
  "direct_dependency_count": 12,
  "transitive_dependency_count": 847,
  "dependency_amplification": 70.6,
  "infestation_severity": "Hollow Shell",
  "dependency_groups": {
    "dependencies": ["react", "vite", "three"],
    "devDependencies": ["typescript", "eslint"]
  },
  "top_heaviest_packages": [
    { "name": "three", "transitive_count": 0 },
    { "name": "react", "transitive_count": 5 }
  ]
}
```

출력 데이터 구조:

```json
{
  "species_name": "Node-Centipede Reactus",
  "danger_level": "Hollow Shell",
  "host_integrity": "0.6% / 숙주는 이름뿐이다",
  "bio_report": "이 생명체는 외부 단백질의 관성으로 움직입니다. 숙주는 중앙에서 희미하게 빛나지만, 지휘권은 이미 node_modules에게 넘어갔습니다. 직접 의존성 12개가 끌고 온 847개의 전이 종은 숙주의 70배에 달하는 바이오매스를 형성했습니다.",
  "naked_host_comment": "이것이 57KB의 전부입니다. 나머지 847MB는 당신의 것이 아닙니다."
}
```

**4.7.2 기생체별 고유 디자인 생성**

Gemini는 각 의존성에 대해 고유한 생물 형태 파라미터를 생성한다. 이것이 이 프로젝트의 핵심 차별점이다 — 모든 의존성이 같은 모양이면 의미가 없다.

디자인 원칙:
- **플랫 디자인**: 기본 도형(구, 타원, 원뿔, 토러스, 고리)의 조합으로 형태를 만든다. 사실적 텍스처, 혈관, 살갗 등 호러 고어 요소는 금지한다.
- **어비스리움 톤**: 어비스리움의 차분한 관조 무드를 가져온다. 각 기생체는 수집/관찰 가능한 표본처럼 존재하되, 아름답지만 약간 불안한 느낌.
- **의존성 특성 반영**: 패키지의 이름, 역할, 생태계, 전이 의존성 수가 형태에 반영되어야 한다.

각 의존성에 대한 Gemini 출력 예시:

```json
{
  "name": "react",
  "creature_name": "Fibrous Reactum",
  "shape": {
    "body": "sphere",
    "segments": 5,
    "appendages": [
      { "type": "ring", "count": 3, "size_ratio": 0.4, "offset": [0, 0.3, 0] },
      { "type": "cone", "count": 8, "size_ratio": 0.15, "spread": "radial" }
    ],
    "symmetry": "radial",
    "aspect_ratio": [1.0, 1.2, 1.0]
  },
  "color": {
    "primary": "#61dafb",
    "secondary": "#20232a",
    "emissive": "#61dafb",
    "emissive_intensity": 0.3
  },
  "motion": {
    "primary": "breathe",
    "secondary": "orbit",
    "tertiary": "flicker",
    "speed_multiplier": 0.8,
    "amplitude": 0.6
  },
  "bio_label": "섬유형 반응체. 가상 DOM의 재조합 에너지로 숙주 세포를 끊임없이 재배열한다."
}
```

기생체 디자인 파라미터 상세:

| 필드 | 설명 |
|------|------|
| `shape.body` | 몸체 기본 도형: `sphere`, `ellipsoid`, `torus`, `capsule` |
| `shape.segments` | 세그먼트(마디) 수. 1이면 단일체, 5 이상이면 다절형 |
| `shape.appendages` | 부속 도형 목록. type(cone, ring, sphere, torus), 개수, 크기 비율, 배치 방식 |
| `shape.symmetry` | `radial`(방사형), `bilateral`(좌우 대칭), `asymmetric`(비대칭) |
| `shape.aspect_ratio` | [x, y, z] 비율로 체형 결정. [1,3,1]이면 길쭉, [2,1,2]이면 납작 |
| `color.primary` | 몸체 주색상 |
| `color.secondary` | 부속 부위 색상 |
| `color.emissive` | 발광 색상. 플랫 디자인에서 깊이감을 주는 핵심 요소 |
| `color.emissive_intensity` | 발광 강도 (0.0 ~ 1.0) |
| `motion.primary/secondary/tertiary` | 움직임 조합. `pulse`, `drift`, `writhe`, `bloom`, `orbit`, `breathe`, `flicker` 중 2-3개 |
| `motion.speed_multiplier` | 기본 속도 대비 배율 |
| `motion.amplitude` | 움직임 진폭 (0.0 ~ 1.0) |
| `bio_label` | 이 기생체에 대한 한 줄 도감 설명 |

AI 실패 시 fallback:

- 로컬 규칙 기반 종 이름을 생성한다.
- 의존성 이름의 해시값을 seed로 사용해 shape, color, motion을 절차적으로 생성한다.
- 위험도와 의존성 비율 기반의 기본 도감 문구를 보여준다.
- 3D 시각화는 중단하지 않는다.

### 4.8 3D 시각화

#### 디자인 철학

Git City가 코드를 도시로 보여주듯, Dependency Parasite는 의존성을 **플랫 디자인 배양 공간 속의 기생 표본**으로 보여준다.

- **플랫 디자인 3D**: 기본 도형(구, 타원, 원뿔, 토러스, 고리)의 조합으로 모든 생물을 표현한다. 사실적 텍스처, PBR 머티리얼, 법선 맵은 사용하지 않는다. 깊이감은 발광(emissive), 투명도, 스케일 차이로 만든다.
- **어비스리움 무드**: 어비스리움의 차분하고 명상적인 분위기를 참고하되, 공간 자체는 추상적인 어둠 속 실험실/배양 공간이다. 느린 부유감, 미세한 입자, 부드러운 안개, 생물발광. 기생체들이 공간 속에서 떠다니듯 움직인다.
- **각 기생체가 고유한 존재**: Gemini가 생성한 `shape`, `color`, `motion` 파라미터에 따라 각 의존성이 완전히 다른 형태와 움직임으로 렌더링된다. 어비스리움에서 물고기마다 실루엣이 다르듯, 여기서도 모든 기생체가 개별 표본이다.

#### 구성 요소

- `HostNucleus`: 숙주 코드. 작은 금색 발광 구체. **크기가 `hostRatio`에 비례하여 동적으로 결정된다.** 비율이 낮을수록 물리적으로 작고 초라하게.
- `DependencySwarm`: 전체 기생체 군집. 천천히 회전하며 살아 있는 느낌을 준다.
- `WrithingTether`: 숙주와 기생체를 잇는 흐릿한 선.
- `CreatureRenderer`: Gemini가 생성한 `shape` 파라미터를 해석하여 기본 도형을 조합해 기생체를 렌더링하는 범용 컴포넌트. 기존의 3종 고정 변종(`centipede`, `pustule`, `maggot`) 대신, AI가 생성한 파라미터로 무한한 변종을 만든다.
- `ParasiteScene`: 배경, 안개, 조명, 카메라 컨트롤, 부유 입자를 포함한 3D 씬.

#### 기생체 렌더링 방식

기존의 하드코딩된 3종 변종을 Gemini가 생성한 파라미터 기반 절차적 렌더링으로 전환한다:

1. **몸체 생성**: `shape.body`와 `shape.aspect_ratio`로 기본 몸체 도형 생성
2. **세그먼트 분할**: `shape.segments` > 1이면 몸체를 마디로 분할하여 다절형 생물 구성
3. **부속 부위 배치**: `shape.appendages`의 각 항목에 따라 촉수, 고리, 돌기 등을 배치
4. **색상 적용**: `color` 파라미터로 MeshStandardMaterial 또는 MeshBasicMaterial 설정. `emissive`로 플랫 디자인 안에서의 발광 깊이감 표현
5. **모션 적용**: `motion.primary/secondary/tertiary` 조합으로 useFrame 안에서 고유한 움직임 시그니처 생성

#### 모션 타입 구현

| 모션 | 적용 대상 | 설명 |
|------|-----------|------|
| `pulse` | scale | 규칙적 팽창/수축. sin 함수 기반 |
| `drift` | position | 느린 위치 이동. noise 기반 부유감 |
| `writhe` | segment rotation | 세그먼트별 시차를 둔 꿈틀거림 |
| `bloom` | appendage scale | 부속 부위가 주기적으로 펼쳐졌다 오므라듬 |
| `orbit` | rotation | 자체 축 중심 느린 자전 |
| `breathe` | scale (전체) | 미세한 확대/축소. pulse보다 느리고 부드럽게 |
| `flicker` | emissive intensity | 발광의 미세한 깜빡임 |

각 기생체는 2-3개의 모션을 조합하여 독자적인 움직임을 가진다. `speed_multiplier`와 `amplitude`로 개체 간 변화를 준다.

#### 데이터 매핑

- 숙주 구체 크기: `hostRatio`에 비례 (비율이 낮을수록 작고 초라하게)
- 기생체 크기: 해당 패키지의 `transitiveCount`에 비례하여 기본 스케일 결정
- 기생체 형태/색상/모션: Gemini가 생성한 `shape`, `color`, `motion` 파라미터로 결정
- `dependencyAmplification`: 전체 swarm의 혼돈도, 배경 입자 밀도에 사용
- `infestationSeverity`: 씬 전체의 분위기 (안개 밀도, 조명 색온도, 배경 어둡기)


#### Fallback 렌더링

Gemini가 기생체 디자인을 생성하지 못한 경우, 의존성 이름의 해시값을 seed로 사용하여 절차적으로 형태를 생성한다. 기존의 3종 변종(`centipede`, `pustule`, `maggot`)을 fallback 풀로 유지하되, seed에 따라 segment 수, 색상, 모션 조합을 랜덤하게 변형한다.

#### 성능 기준

- 일반 노트북에서 초기 렌더링 2초 이내
- 60개 내외 의존성까지 상호작용 가능해야 함
- 기생체의 geometry는 가능한 한 단순한 기본 도형을 재사용 (instanced mesh 고려)
- 모바일에서는 `dpr`과 렌더링 개수를 낮추고, 모션 효과를 1-2개로 축소하는 옵션 고려

### 4.9 결과 UI

현재 화면 구성은 다음 제품 UI의 기반이다.

- Hero panel: 프로젝트 콘셉트와 입력 폼 영역
- Scan panel: 종명, 숙주 보존율, 침투 벡터 요약. **코드 비율과 증폭 배율 표시 추가.**
- Codex card: AI 도감 설명과 의존성 태그 클라우드
- Viewer overlay: 렌더링 상태 표시
- **Naked Host 버튼**: 숙주만 보기 인터랙션 트리거

추가되어야 할 상태:

- idle: 샘플 생명체와 입력 폼 표시
- loading: GitHub/npm registry/AI 분석 중 상태
- success: 실제 분석 결과 반영
- naked: 나체 숙주 리빌 상태
- error: 원인별 오류 메시지와 재시도 버튼

**Scan panel 핵심 수치 표시:**

```
숙주 코드:       57 KB
외부 의존성:      847 MB
당신의 비율:      0.006%
직접 의존성:      12개
실제 설치 패키지:  847개 (70.6x 증폭)
기생 심각도:      Hollow Shell
```

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
  transitiveDeps: string[]       // 1단계 하위 의존성 이름 목록
  transitiveCount: number        // 전이 의존성 수
  unpackedSize: number | null    // npm registry의 unpacked size (bytes)
}
```

### 5.2 Parasite

```ts
// Gemini가 생성하는 기생체 형태 파라미터
type ParasiteShape = {
  body: 'sphere' | 'ellipsoid' | 'torus' | 'capsule'
  segments: number
  appendages: {
    type: 'cone' | 'ring' | 'sphere' | 'torus'
    count: number
    sizeRatio: number
    spread: 'radial' | 'linear' | 'random'
    offset?: [number, number, number]
  }[]
  symmetry: 'radial' | 'bilateral' | 'asymmetric'
  aspectRatio: [number, number, number]
}

type ParasiteColor = {
  primary: string
  secondary: string
  emissive: string
  emissiveIntensity: number
}

type MotionType = 'pulse' | 'drift' | 'writhe' | 'bloom' | 'orbit' | 'breathe' | 'flicker'

type ParasiteMotion = {
  primary: MotionType
  secondary: MotionType
  tertiary?: MotionType
  speedMultiplier: number
  amplitude: number
}

// fallback용 기존 변종 (Gemini 실패 시 사용)
type FallbackVariant = 'centipede' | 'pustule' | 'maggot'

type Parasite = {
  name: string
  creatureName: string           // Gemini가 명명한 생물 이름
  seed: number
  size: number                   // transitiveCount에 비례하여 산출
  position: [number, number, number]
  transitiveCount: number        // 이 기생체가 끌고 온 하위 종 수
  shape: ParasiteShape           // AI가 생성한 형태 파라미터
  color: ParasiteColor           // AI가 생성한 색상 파라미터
  motion: ParasiteMotion         // AI가 생성한 움직임 파라미터
  bioLabel: string               // 한 줄 도감 설명
  fallbackVariant?: FallbackVariant  // AI 실패 시 사용할 기존 변종
}
```

### 5.3 HostProfile

```ts
type HostProfile = {
  languages: Record<string, number>  // GitHub Languages API 결과
  totalCodeBytes: number             // 직접 작성 코드 총 바이트
  estimatedExternalBytes: number     // 외부 의존성 추정 바이트
  hostRatio: number                  // 0.0 ~ 1.0
}
```

### 5.4 AnalysisResult

```ts
type InfestationSeverity = 'Symbiotic' | 'Colonized' | 'Consumed' | 'Hollow Shell'

type AnalysisResult = {
  repository: string
  packageName: string
  dependencies: Dependency[]
  directDependencyCount: number
  transitiveDependencyCount: number
  totalParasiteCount: number
  dependencyAmplification: number    // 전이/직접 비율
  hostProfile: HostProfile
  infestationSeverity: InfestationSeverity
  aiReport: {
    speciesName: string
    dangerLevel: string
    hostIntegrity: string
    bioReport: string
    nakedHostComment: string         // 나체 숙주 리빌 시 표시할 문구
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

- Data Fetching: GitHub REST API + npm registry API
- AI Engine: Gemini Flash 계열 모델
- API Boundary: Vercel Serverless Function
- Capture: `html-to-image` 또는 Canvas screenshot 기반 검토

### 6.3 데이터 수집 파이프라인

```
사용자 URL 입력
  ├─ GitHub Contents API → package.json 파싱 → 직접 의존성 목록
  ├─ GitHub Languages API → 언어별 바이트 → hostCodeBytes
  └─ npm registry API (병렬) → 각 패키지의 dependencies + unpackedSize
      → transitiveDependencyCount, estimatedExternalBytes 산출
  → AnalysisResult 조립
  → Gemini API (Vercel Serverless) → AI 도감 생성
  → 3D 렌더링 + UI 갱신
```

### 6.4 배포 구조

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
- **핵심 체감 순간은 "나체 숙주 리빌"이다.** 이 순간이 프로젝트의 메시지를 전달하는 클라이맥스로 설계한다.
- 기괴하지만 읽기 어려우면 안 된다. 패널 텍스트는 실험실 보고서처럼 차분하게 유지한다.
- 수치는 정확한 측정값이 아닌 "체감을 위한 과장된 추정"임을 UI 톤으로 자연스럽게 전달한다.
- 입력, 로딩, 실패, 성공, 나체 숙주 상태가 명확해야 한다.
- AI 응답이 실패해도 제품의 핵심 경험인 3D 렌더링과 나체 숙주 리빌은 유지되어야 한다.

## 8. 수용 기준

### 8.1 기능 수용 기준

- 사용자가 GitHub URL을 입력하고 분석 버튼을 누를 수 있다.
- public npm 프로젝트의 `package.json`을 파싱할 수 있다.
- GitHub Languages API로 직접 작성 코드량을 조회할 수 있다.
- npm registry에서 전이 의존성 수를 조회할 수 있다.
- 내 코드 vs 외부 코드 비율이 Scan panel에 표시된다.
- 직접 의존성 vs 전이 의존성 격차(증폭 배율)가 표시된다.
- 의존성 목록이 3D 기생체 목록으로 변환된다. 기생체 크기는 전이 의존성 수에 비례한다.
- 숙주 구체 크기가 `hostRatio`에 비례한다.
- **"숙주만 보기" 버튼이 동작하고, 나체 숙주 리빌 시퀀스가 재생된다.**
- 결과 패널의 종명, 기생 심각도, 도감 설명이 분석 결과에 따라 바뀐다.
- GitHub API 실패, npm registry 실패, AI API 실패가 각각 다른 메시지로 표시된다.
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

### Phase 1: 데이터 수집 및 깊이 분석

- URL parser 구현
- GitHub Contents API 호출 → `package.json` 파싱
- GitHub Languages API 호출 → 직접 작성 코드량 조회
- npm registry API 병렬 호출 → 전이 의존성 수 + unpacked size 조회
- 코드 비율(`hostRatio`), 증폭 배율(`dependencyAmplification`), 기생 심각도 산출
- 분석 상태 관리 (idle → loading → success/error)

### Phase 2: 시각화 연결 및 나체 숙주

- 실제 분석 데이터 기반으로 기생체 생성 (크기 = 전이 의존성 수 비례)
- 숙주 구체 크기를 `hostRatio`에 비례하여 동적 조절
- Scan panel에 코드 비율, 증폭 배율, 기생 심각도 표시
- **나체 숙주 리빌(Naked Host Reveal) 구현**
  - "숙주만 보기" 버튼
  - 기생체 퇴장 애니메이션
  - 초라한 숙주 + 텍스트 연출
  - 기생체 재등장 애니메이션

### Phase 3: AI 도감 연결

- Vercel Serverless Function 추가
- Gemini prompt와 JSON schema 정의 (코드 비율, 증폭 배율 포함)
- `nakedHostComment` 생성 포함
- AI 응답 validation
- fallback report 생성기 구현

### Phase 4: 시연 완성

- 결과 공유/캡처
- 예시 레포지토리 quick scan 버튼
- 문구 다듬기
- 모바일 QA
- Vercel production 최종 확인

### Phase 5 (MVP 이후): 인터랙션 고도화

- 해부(Dissect) 모드: 기생체 클릭 → 하위 의존성 펼침
- 적출(Extract) 시뮬레이션: 드래그 제거 → 연쇄 반응
- 감염 타임라인: commit history 기반 시간순 감염 애니메이션
- dependency group별 변종 매핑 고도화
- 로딩 중 배양액/스캔 애니메이션

## 10. 심사위원 어필 포인트

- **질적 분석**: 단순 패키지 수 세기가 아닌, 코드 비율과 전이 의존성 깊이로 실제 종속성을 보여준다.
- **체감 인터랙션**: "숙주만 보기" 한 번으로 자신의 코드가 전체에서 얼마나 작은지 즉각 체감한다.
- **AI 생성 개별 생물체**: 모든 의존성이 같은 모양이 아닌, Gemini가 각 패키지의 특성을 분석해 고유한 형태·색상·움직임을 가진 생물을 만든다. 어비스리움의 수집형 도감 즐거움과 Git City의 데이터 시각화 깊이를 결합한다.
- **플랫 디자인 미학**: 사실적 공포가 아닌, 깨끗한 도형 조합과 생물발광으로 "아름답지만 불안한" 공간을 만든다. 기술 데모가 아닌 하나의 작품으로 보인다.
- 기술적 완주: GitHub API + npm registry + AI 분석 + 절차적 3D 생물 렌더링 + 배포까지 하나의 파이프라인.
- 유머와 통찰: "내가 코드를 짠다"는 감각을 뒤집고, 오픈소스 생태계의 거대함을 웃기지만 정확하게 보여준다.
- 확장성: npm 프로젝트에서 시작하지만 Python, Go, Rust 등 다른 생태계로 확장 가능한 구조다.

## 11. 오픈 이슈

- Gemini API를 어떤 서버리스 라우트 구조로 감쌀지 결정해야 한다.
- GitHub rate limit을 토큰 없이 감당할지, 선택적 토큰 입력을 둘지 결정해야 한다.
- npm registry 병렬 요청 시 rate limit 전략을 정해야 한다.
- `hostRatio`와 `estimatedExternalBytes`가 과장된 추정치임을 UI에서 어떤 톤으로 전달할지 정해야 한다.
- 60개 이상 의존성에서 모바일 성능을 어떻게 낮출지 결정해야 한다.
- 나체 숙주 리빌의 애니메이션 길이와 연출 디테일을 확정해야 한다.
- 현재 Vercel 프로젝트의 GitHub App 연결 권한은 별도 확인이 필요하다.
