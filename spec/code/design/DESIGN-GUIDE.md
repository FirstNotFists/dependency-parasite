## Frontend Design Guide

When doing frontend design tasks, avoid generic, overbuilt layouts. The product should feel like a calm flat-design specimen viewer in a dark laboratory, not a dense SaaS dashboard.

## Benchmarks

- **Git City**: 코드를 도시로 시각화하는 프로젝트에서 영감. 데이터를 하나의 살아있는 3D 공간으로 변환하는 접근, 그리고 "보는 것만으로 직관적으로 이해되는" 정보 전달 방식을 참고한다.
- **Abyssrium (어비스리움)**: 전체적인 무드와 톤의 벤치마크. 편안하고 명상적인 분위기, 느릿한 부유감, 부드러운 그라디언트, 그리고 생물을 수집/관찰하는 도감적 즐거움을 참고한다. 단, 어비스리움의 "무드와 감성"을 가져오는 것이지, 수중/수조 세팅 자체를 재현하는 것이 아니다. 우리의 공간은 추상적인 어둠 속 실험실/배양 공간이다.
- **Dependency Parasite만의 트위스트**: 어비스리움의 차분한 관조 무드 위에 기생 생물이 존재하는 느낌. "아름다운 표본 관찰 공간 속의 기생 생명체" 톤이지, 호러 고어가 아니다. 기괴함은 형태와 움직임에서 오고, 색감과 분위기는 차분하게 유지한다.

## Visual Direction

- **Flat design first**: 깨끗한 실루엣, 선명한 도형, 최소한의 테두리, 단순한 아이콘, 절제된 그림자. 깊이감은 glossy realism이나 skeuomorphism이 아닌, 스케일 차이·색상 레이어링·모션·투명도로 만든다.
- **기생체도 플랫**: 기생체는 사실적인 3D 렌더링이 아닌 **플랫한 실루엣과 단순한 도형의 조합**으로 표현한다. 구, 원뿔, 타원, 고리 같은 기본 도형을 조합하되, 각 개체의 형태·색상·움직임 패턴이 고유해야 한다. 텍스처 맵이나 법선 맵 같은 사실적 디테일보다는 형태의 독특함과 색상의 대비로 개성을 만든다.
- **Color & look**: CSS 변수로 팔레트를 정의한다. 깊은 다크 그린, 생물발광 라임, 뮤트 시안, 소프트 골드, 절제된 경고 액센트를 선호한다. 보라-흰 기본값이나 의도하지 않은 다크모드 보일러플레이트를 피한다.
- **Background**: 단색 배경 금지. 어두운 그라디언트, 부유하는 미립자 패턴, 깊이감을 주는 추상적 레이어로 분위기를 만든다.
- **Typography**: 표현력 있고 목적이 분명한 폰트를 사용한다. Inter, Roboto, Arial, system 같은 기본 스택을 메인 비주얼 보이스로 쓰지 않는다.

## Creature Design (기생체 디자인 원칙)

기생체는 이 프로젝트의 핵심 비주얼이다. 모든 의존성이 같은 모양이면 의미가 없다.

- **의존성별 고유한 형태**: Gemini AI가 각 의존성의 특성(이름, 역할, 생태계, 전이 의존성 수)을 분석해 고유한 생물 형태 파라미터를 생성한다. 같은 "구체+다리" 변종이라도 segment 수, 비율, 돌기 위치, 색상 조합이 달라야 한다.
- **플랫 실루엣 안에서의 다양성**: 기본 도형(구, 타원, 원뿔, 토러스, 고리)의 조합으로 형태를 만들되, 조합 방식·비율·배치가 모두 다르게. 마치 어비스리움에서 물고기마다 실루엣이 다른 것처럼.
- **크기는 데이터 기반**: 기생체의 크기는 해당 패키지의 전이 의존성 수에 비례한다. 많이 끌고 올수록 거대하고, 독립적인 패키지는 작다.
- **색상은 생태계 구분**: dependency group(runtime, dev, peer, optional)별로 색상 계열을 나누되, 같은 그룹 안에서도 미묘한 색조 변화를 준다.
- **절대 사실적이지 않게**: 혈관, 내장, 살갗 텍스처 같은 사실적 공포 요소를 넣지 않는다. 불쾌함은 "단순한 형태가 이상하게 움직이는" 데서 오는 uncanny valley로 표현한다.

## Motion

모션은 이 프로젝트에서 생명감의 핵심이다. 기생체가 살아있다고 느껴져야 한다.

### 전체 분위기 모션
- **느릿한 부유감**: 어비스리움 무드처럼 느릿한 drift, pulse, orbit, breathing, gentle bloom, suspended particles. 급격하거나 떨리는 대시보드식 마이크로 애니메이션 금지.
- **배경 입자**: 미세한 포자, 미립자, 빛 알갱이가 천천히 떠다니며 공간의 깊이감을 만든다.

### 기생체 개별 모션
- **각 기생체마다 고유한 움직임 패턴**: Gemini가 생성한 seed와 variant에 따라 움직임이 달라야 한다. 어떤 것은 천천히 맥동하고, 어떤 것은 촉수를 흔들고, 어떤 것은 제자리에서 회전하고, 어떤 것은 느릿하게 궤도를 바꾼다.
- **다채로운 효과 종류**:
  - `pulse`: 규칙적 팽창/수축 (심장 박동처럼)
  - `drift`: 느린 위치 이동 (부유하듯)
  - `writhe`: 세그먼트별 시차를 둔 꿈틀거림
  - `bloom`: 주기적으로 돌기/촉수가 펼쳐졌다 오므라드는 동작
  - `orbit`: 자체 축 중심 느린 회전
  - `breathe`: 전체 스케일의 미세한 확대/축소 (호흡감)
  - `flicker`: 색상 또는 발광의 미세한 깜빡임
- **효과 조합**: 각 기생체는 위 효과 중 2-3개를 조합하여 고유한 움직임 시그니처를 가진다. Gemini가 의존성 특성에 맞는 조합을 제안한다.
- **속도는 데이터 기반**: `dependencyAmplification`이 높을수록 전체 씬의 혼돈도가 올라가고, 개별 기생체의 움직임 속도와 진폭이 미세하게 커진다.

### 상태 전환 모션
- 중요한 상태 변경(스캔, 결과 리빌, 나체 숙주)은 연극적이되 깔끔하게. idle 앰비언스보다 강한 모션이 허용된다.
- **나체 숙주 리빌**: 기생체가 바깥으로 천천히 흩어지며 사라지고 → 숙주만 남는 정적 → 기생체가 다시 스며들듯 몰려드는 3단계 시퀀스. 어비스리움에서 새 물고기가 등장할 때의 부드러운 등장감을 참고하되, 여기서는 "침입"의 느낌으로.
- **로딩 중**: 배양액 속에서 무언가 형성되는 느낌의 앰비언스. 완성된 기생체가 아닌 불완전한 실루엣이 떠다니다가 분석 완료 시 형태를 갖추는 연출.

## Composition Rules

- One composition: the first viewport must read as one composed scene, not a dashboard, unless the feature truly is a dashboard.
- Brand first: on branded pages, the brand or product name must be a hero-level signal, not just nav text or an eyebrow. No headline should overpower the brand.
- Brand test: if the first viewport could belong to another brand after removing the nav, the branding is too weak.
- Full-bleed hero: on landing pages and promotional surfaces, the hero visual should be a dominant edge-to-edge plane or background by default. Do not use inset hero images, side-panel hero images, rounded media cards, tiled collages, or floating image blocks unless the existing design system clearly requires it.
- Hero budget: the first viewport should usually contain only the brand, one headline, one short supporting sentence, one CTA group, and one dominant visual. Do not place stats, schedules, event listings, address blocks, promos, metadata rows, or secondary marketing content in the first viewport.
- No hero overlays: do not place detached labels, floating badges, promo stickers, info chips, or callout boxes on top of hero media.

## UI Components

- Cards: default to no cards. Never use cards in the hero. Cards are allowed only when they are the container for a real user interaction. If removing a border, shadow, background, or radius does not hurt interaction or understanding, it should not be a card.
- One job per section: each section should have one purpose, one headline, and usually one short supporting sentence.
- Real visual anchor: imagery should show the product, creature, environment, atmosphere, or interaction. Decorative gradients alone do not count as the main visual idea.
- Reduce clutter: avoid pill clusters, stat strips, icon rows, boxed promos, schedule snippets, and multiple competing text blocks.
- Flat interactions: buttons, inputs, and controls should be simple, legible, and tactile through color/shape states rather than heavy shadows or chrome.

## Responsiveness & React

- Ensure the page loads properly on both desktop and mobile.
- On mobile, preserve the single-scene feeling: reduce rendered detail before adding stacked UI clutter.
- For React code, prefer modern patterns including useEffectEvent, startTransition, and useDeferredValue when appropriate if used by the team. Do not add useMemo/useCallback by default unless already used; follow the repo's React Compiler guidance.

Exception: If working within an existing website or design system, preserve the established patterns, structure, and visual language.
