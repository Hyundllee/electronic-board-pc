import { CSSProperties, MouseEvent, useEffect, useRef, useState } from "react"

import "../../../styles/utility/index.scss"
import "../../../styles/pages/kodex/pension/index.scss"

const IMG_PATH = "/assets/images/kodex/pension"

const SAVINGS_LIMIT = 6000000
const IRP_LIMIT = 9000000
const LOW_SALARY_RATE = 0.165
const HIGH_SALARY_RATE = 0.132

type AccountType = "savings" | "irp"
type SalaryType = "low" | "high"
type SliderStyle = CSSProperties & { "--ratio": number }

const formatNumber = (value: number) => value.toLocaleString("ko-KR")

export default function KodexPension() {
  const [monthly, setMonthly] = useState(30)
  const [account, setAccount] = useState<AccountType>("savings")
  const [salary, setSalary] = useState<SalaryType>("low")
  const [targetStep, setTargetStep] = useState(0)
  const [doneStep, setDoneStep] = useState(0)
  const stepsRef = useRef<HTMLOListElement>(null)

  const limit = account === "savings" ? SAVINGS_LIMIT : IRP_LIMIT
  const rate = salary === "low" ? LOW_SALARY_RATE : HIGH_SALARY_RATE
  const rateLabel = salary === "low" ? "16.5" : "13.2"
  const annual = monthly * 12 * 10000
  const deductible = Math.min(annual, limit)
  const deduction = Math.round(deductible * rate)
  const maxDeduction = Math.round(limit * rate)
  const irpMaxDeduction = Math.round(IRP_LIMIT * rate)

  const moveToSection = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  useEffect(() => {
    const list = stepsRef.current
    if (!list) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const step = Number((entry.target as HTMLElement).dataset.step)
          setTargetStep((prev) => Math.max(prev, step))
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: "0px 0px -25% 0px", threshold: 1 },
    )

    list.querySelectorAll("[data-step]").forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  // 여러 단계가 한 번에 화면에 들어와도 한 단계씩 순서대로 체크되도록 큐처럼 진행
  useEffect(() => {
    if (doneStep >= targetStep) return
    const timer = window.setTimeout(() => setDoneStep((prev) => prev + 1), doneStep === 0 ? 200 : 700)
    return () => window.clearTimeout(timer)
  }, [doneStep, targetStep])

  return (
    <div className="kodex-pension">
      {/* Hero / Magazine Cover */}
      <section className="pension-hero">
        <div className="pension-hero__inner">
          <div className="pension-hero__visual">
            <img
              className="pension-hero__cover"
              src={`${IMG_PATH}/hero-cover.png`}
              alt="KODEX 연금 특집호 표지 - 연금, KODEX 하다. 1위를 담다"
            />
            <img className="pension-hero__badge" src={`${IMG_PATH}/badge-no1.svg`} alt="국내 ETF 순자산 No.1" />
          </div>

          <div className="pension-hero__copy">
            <div className="pension-hero__intro">
              <p className="pension-hero__issue">The Pension Issue, 2026</p>
              <h2 className="pension-hero__title">
                올해의 첫 주인공,
                <br />
                당신의 연금입니다
              </h2>
              <p className="pension-hero__desc">
                국내 ETF 순자산 1위* KODEX가
                <br />
                연금 계좌를 채우는 법을 한 권에 담았어요.
              </p>
            </div>

            <ul className="pension-hero__toc">
              <li>
                <a href="#pension-feature" onClick={(event) => moveToSection(event, "pension-feature")}>
                  <span className="pension-hero__toc-num">01</span>
                  <span className="pension-hero__toc-text">13월의 월급, 세액공제로 돌려받아요</span>
                  <img className="pension-hero__toc-arrow" src={`${IMG_PATH}/icon-arrow-down.svg`} alt="" />
                </a>
              </li>
              <li>
                <a href="#pension-guide" onClick={(event) => moveToSection(event, "pension-guide")}>
                  <span className="pension-hero__toc-num">02</span>
                  <span className="pension-hero__toc-text">어떤 계좌부터 시작할까</span>
                  <img className="pension-hero__toc-arrow" src={`${IMG_PATH}/icon-arrow-down.svg`} alt="" />
                </a>
              </li>
              <li>
                <a href="#pension-story" onClick={(event) => moveToSection(event, "pension-story")}>
                  <span className="pension-hero__toc-num">03</span>
                  <span className="pension-hero__toc-text">1위 브랜드의 연금 라인업</span>
                  <img className="pension-hero__toc-arrow" src={`${IMG_PATH}/icon-arrow-down.svg`} alt="" />
                </a>
              </li>
              <li>
                <a href="#pension-howto" onClick={(event) => moveToSection(event, "pension-howto")}>
                  <span className="pension-hero__toc-num">04</span>
                  <span className="pension-hero__toc-text">3단계로 바로 시작하기</span>
                  <img className="pension-hero__toc-arrow" src={`${IMG_PATH}/icon-arrow-down.svg`} alt="" />
                </a>
              </li>
            </ul>

            <p className="pension-hero__note">
              *국내 자산운용사 ETF 중 순자산총액 1위, 2026년 9월말 기준 KODEX ETF 순자산총액 178조
              <br />
              (출처 : 데이터가이드 2026.09) | 광고 시점 및 향후에는 이와 다를 수 있음
            </p>
          </div>
        </div>
      </section>

      {/* Editor's Letter */}
      <section className="pension-letter">
        <div className="pension-letter__inner">
          <div className="pension-letter__head">
            <h2 className="pension-letter__title">Editor's Letter</h2>
            <p className="pension-letter__sub">여는 글</p>
          </div>

          <div className="pension-letter__body">
            <div className="pension-letter__headline">
              <p className="pension-letter__line">
                연금, <span className="pension-letter__strike">넣어두다.</span>
              </p>
              <p className="pension-letter__line pension-letter__line--answer">
                <span>아니죠. 연금,</span>
                <span className="pension-letter__brand">
                  <em>KODEX</em>
                  <span>하다.</span>
                </span>
              </p>
              <img className="pension-letter__scribble" src={`${IMG_PATH}/letter-strike.svg`} alt="" />
            </div>
            <p className="pension-letter__text">
              연금은 오래 묵혀두는 돈이라고들 해요. 하지만 계좌에 넣기만 하고 그대로 두면,
              <br />
              30년 뒤의 생활비는 지금과 크게 다르지 않을 수 있어요.개인연금, 퇴직연금, ISA. 지금 가진 계좌 안에서
              <br />
              주식처럼 쉽게 사고파는 ETF를 담는 것. 그게 이번 호가 말하는 ‘연금, KODEX 하다’예요.
            </p>
          </div>
        </div>
      </section>

      {/* 01 Feature / Calculator */}
      <section className="pension-feature" id="pension-feature">
        <div className="pension-inner">
          <div className="pension-head">
            <p className="pension-head__kicker">
              <span className="pension-head__num">01</span>
              <span className="pension-head__label">Feature</span>
            </p>
            <h2 className="pension-head__title">13월의 월급, 세액공제로 돌려받아요</h2>
            <p className="pension-head__desc">연금저축에 넣은 돈은 연말정산 때 세액공제로 돌아와요.</p>
          </div>

          <div className="pension-calc">
            <div className="pension-calc__input">
              <div className="pension-calc__amount">
                <p className="pension-calc__label">월 납입액</p>
                <p className="pension-calc__amount-value">
                  <strong>{monthly}</strong>
                  <span>만원</span>
                </p>
              </div>

              <div className="pension-calc__slider">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  value={monthly}
                  onChange={(event) => setMonthly(Number(event.target.value))}
                  style={{ "--ratio": monthly / 100 } as SliderStyle}
                  aria-label="월 납입액"
                />
                <p className="pension-calc__slider-ends">
                  <span>0원</span>
                  <span>100만원</span>
                </p>
              </div>

              <div className="pension-calc__option">
                <p className="pension-calc__option-label">계좌 구성</p>
                <div className="pension-calc__toggle">
                  <button
                    type="button"
                    className={account === "savings" ? "is-active" : ""}
                    aria-pressed={account === "savings"}
                    onClick={() => setAccount("savings")}
                  >
                    연금저축만 (600만원)
                  </button>
                  <button
                    type="button"
                    className={account === "irp" ? "is-active" : ""}
                    aria-pressed={account === "irp"}
                    onClick={() => setAccount("irp")}
                  >
                    +IRP 합산 (900만원)
                  </button>
                </div>
              </div>

              <div className="pension-calc__option">
                <p className="pension-calc__option-label">연 총급여</p>
                <div className="pension-calc__toggle">
                  <button
                    type="button"
                    className={salary === "low" ? "is-active" : ""}
                    aria-pressed={salary === "low"}
                    onClick={() => setSalary("low")}
                  >
                    5,500만원 이하
                  </button>
                  <button
                    type="button"
                    className={salary === "high" ? "is-active" : ""}
                    aria-pressed={salary === "high"}
                    onClick={() => setSalary("high")}
                  >
                    5,500만원 초과
                  </button>
                </div>
              </div>

              <p className="pension-calc__note">
                * 2026년 세법 기준이며 지방소득세를 포함한 공제율입니다. 실제 공제 세액은 개인 상황에 따라 다를 수 있어
                참고용으로만 확인해주세요.
              </p>
            </div>

            <div className="pension-calc__output" aria-live="polite">
              <p className="pension-calc__label">내 13월의 월급은?</p>
              <div className="pension-calc__result">
                <p className="pension-calc__result-value">
                  <strong>{formatNumber(deduction)}</strong>
                  <span>원</span>
                </p>
                <p className="pension-calc__result-desc">
                  연 납입액 {formatNumber(annual / 10000)}만원 기준
                  <br />
                  공제 대상 {formatNumber(deductible / 10000)}만원 × 공제율 {rateLabel}%
                </p>
              </div>

              <div className="pension-calc__message">
                {annual > limit && account === "savings" && (
                  <p>
                    연 납입액이 <strong>600만원</strong>을 넘었어요.
                    <br />
                    IRP를 함께 쓰면 최대 <strong>{formatNumber(irpMaxDeduction)}원까지</strong> 돌려받을 수 있어요.
                  </p>
                )}
                {annual > limit && account === "irp" && (
                  <p>
                    연 납입액이 <strong>900만원</strong>을 넘었어요.
                    <br />
                    초과분 <strong>{formatNumber((annual - limit) / 10000)}만원</strong>은 공제 대상이 아니에요.
                  </p>
                )}
                {annual === limit && (
                  <p>
                    연간 한도를 <strong>꽉 채웠어요!</strong>
                    <br />
                    최대 <strong>{formatNumber(maxDeduction)}원</strong>을 돌려받을 수 있어요.
                  </p>
                )}
                {annual < limit && (
                  <p>
                    한도까지 <strong>{formatNumber((limit - annual) / 10000)}만원</strong> 더 채우면,
                    <br />
                    최대 <strong>{formatNumber(maxDeduction)}원까지</strong> 돌려받을 수 있어요.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02 Guide / Accounts */}
      <section className="pension-guide" id="pension-guide">
        <div className="pension-inner">
          <div className="pension-head">
            <p className="pension-head__kicker">
              <span className="pension-head__num">02</span>
              <span className="pension-head__label">Guide</span>
            </p>
            <h2 className="pension-head__title">어떤 계좌부터 시작할까요?</h2>
            <p className="pension-head__desc">
              처음이라면 연금저축부터, 월급쟁이라면 IRP도 함께 고려해보세요.
              <br />
              지금 가진 연금 계좌에서 바로 시작할 수 있어요.
            </p>
          </div>

          <img className="pension-guide__band" src={`${IMG_PATH}/guide-band.jpg`} alt="연금 계좌 상담을 나누는 사람들" />

          <ul className="pension-guide__cards">
            <li className="pension-guide__card">
              <p className="pension-guide__eyebrow">For beginners</p>
              <h3 className="pension-guide__name">연금저축</h3>
              <p className="pension-guide__desc">
                연령 제한 없이 누구나 가입할 수 있어요.
                <br />
                자유롭게 납입하고 ETF로 굴릴 수 있어요.
              </p>
              <dl className="pension-guide__info">
                <div>
                  <dt>가입조건</dt>
                  <dd>누구나 가능</dd>
                </div>
                <div>
                  <dt>세제혜택</dt>
                  <dd>연 600만원 한도</dd>
                </div>
                <div>
                  <dt>납입방식</dt>
                  <dd>자유 납입</dd>
                </div>
              </dl>
              <a className="pension-guide__more" href="#none">
                Learn more&nbsp;&nbsp;→
              </a>
            </li>
            <li className="pension-guide__card">
              <p className="pension-guide__eyebrow">Extra benefit</p>
              <h3 className="pension-guide__name">IRP</h3>
              <p className="pension-guide__desc">
                소득이 있는 분이 가입할 수 있는 계좌예요.
                <br />
                연금저축과 합산해 세제혜택을 더 받아요.
              </p>
              <dl className="pension-guide__info">
                <div>
                  <dt>가입조건</dt>
                  <dd>소득자 대상</dd>
                </div>
                <div>
                  <dt>세제혜택</dt>
                  <dd>합산 900만원</dd>
                </div>
                <div>
                  <dt>투자한도</dt>
                  <dd>위험자산 최대 70%</dd>
                </div>
              </dl>
              <a className="pension-guide__more" href="#none">
                Learn more&nbsp;&nbsp;→
              </a>
            </li>
            <li className="pension-guide__card">
              <p className="pension-guide__eyebrow">Side account</p>
              <h3 className="pension-guide__name">ISA (중개형)</h3>
              <p className="pension-guide__desc">
                연금 계좌는 아니지만 비과세 혜택이 있고,
                <br />
                만기 전 연금계좌로 옮길 수도 있어요.
              </p>
              <dl className="pension-guide__info">
                <div>
                  <dt>세제혜택</dt>
                  <dd>비과세 한도 적용</dd>
                </div>
                <div>
                  <dt>연계</dt>
                  <dd>연금 전환 가능</dd>
                </div>
                <div>
                  <dt>인출</dt>
                  <dd>중도인출 가능</dd>
                </div>
              </dl>
              <a className="pension-guide__more" href="#none">
                Learn more&nbsp;&nbsp;→
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* 03 Cover Story / Products */}
      <section className="pension-story" id="pension-story">
        <div className="pension-inner">
          <div className="pension-head">
            <p className="pension-head__kicker">
              <span className="pension-head__num">03</span>
              <span className="pension-head__label">Cover Story</span>
            </p>
            <h2 className="pension-head__title">투자 스타일에 따라 조합해보세요</h2>
            <p className="pension-head__desc">연금 계좌에서 바로 담을 수 있는 KODEX 대표 라인업이에요.</p>
          </div>

          <div className="pension-story__list">
            <article className="pension-story__lead">
              <img className="pension-story__lead-img" src={`${IMG_PATH}/story-sp500.jpg`} alt="" />
              <div className="pension-story__lead-text">
                <div>
                  <p className="pension-story__eyebrow">기초 체력, 연금계좌 대표 종목</p>
                  <h3 className="pension-story__lead-title">
                    KODEX
                    <br />
                    미국S&amp;P500 ETF
                  </h3>
                  <p className="pension-story__desc">
                    미국 대표 500개 기업에 한 번에 분산 투자해요. 연금 계좌에서 가장 많이 담는 종목이에요.
                  </p>
                </div>
                <dl className="pension-story__facts">
                  <div>
                    <dt>구성</dt>
                    <dd>500개 기업 분산</dd>
                  </div>
                  <div>
                    <dt>특징</dt>
                    <dd>연금계좌 매수 가능</dd>
                  </div>
                  <div>
                    <dt>방식</dt>
                    <dd>적립식 매매</dd>
                  </div>
                </dl>
              </div>
            </article>

            <div className="pension-story__side">
              <article className="pension-story__card">
                <img className="pension-story__card-img" src={`${IMG_PATH}/story-nasdaq.jpg`} alt="" />
                <div className="pension-story__card-text">
                  <p className="pension-story__eyebrow">미국 기술주</p>
                  <h3 className="pension-story__card-title">
                    KODEX 미국나스닥100
                    <br />
                    ETF
                  </h3>
                  <p className="pension-story__desc">
                    미국 나스닥에 상장된 빅테크·기술주 100개에 한 번에 투자해요. 지수추종형, 환노출형.
                  </p>
                </div>
              </article>
              <article className="pension-story__card">
                <img className="pension-story__card-img" src={`${IMG_PATH}/story-dividend.jpg`} alt="" />
                <div className="pension-story__card-text">
                  <p className="pension-story__eyebrow">월배당 · 안정형</p>
                  <h3 className="pension-story__card-title">
                    KODEX 미국배당다우존스
                    <br />
                    액티브 ETF
                  </h3>
                  <p className="pension-story__desc">
                    매달 분배금을 받는 구조예요. 연금이 지급되는 시점과 현금 흐름을 맞추기 좋아요.
                  </p>
                </div>
              </article>
            </div>
          </div>

          <p className="pension-story__note">
            * 특정 종목의 수익률을 보장하지 않으며, 실제 투자 결과는 시장 상황에 따라 달라질 수 있어요.
          </p>
        </div>
      </section>

      {/* 04 How-to / Steps */}
      <section className="pension-howto" id="pension-howto">
        <div className="pension-howto__inner">
          <div className="pension-howto__portrait">
            <img className="pension-howto__img" src={`${IMG_PATH}/howto-portrait.jpg`} alt="" />
            <blockquote className="pension-howto__quote">
              <p>“오늘 5분이면, </p>
              <span className="pension-howto__quote-line" aria-hidden="true" />
              <p>내일의 생활비 구조가 달라져요.”</p>
            </blockquote>
          </div>

          <div className="pension-howto__content">
            <div className="pension-head">
              <p className="pension-head__kicker">
                <span className="pension-head__num">04</span>
                <span className="pension-head__label">How-to</span>
              </p>
            </div>

            <div className="pension-howto__head">
              <h2 className="pension-howto__title">
                3단계면 바로
                <br />
                시작할 수 있어요
              </h2>
              <p className="pension-howto__desc">복잡해 보여도, 처음 설정만 해두면 그다음부터 자동이에요.</p>
            </div>

            <ol className="pension-howto__steps" ref={stepsRef}>
              <li className={`pension-howto__step${doneStep >= 1 ? " is-done" : ""}`} data-step="1">
                <span className="pension-howto__step-num">01</span>
                <div className="pension-howto__step-text">
                  <p className="pension-howto__step-title">연금계좌 확인 · 개설</p>
                  <p className="pension-howto__step-desc">이미 있다면 패스, 없다면 비대면으로 간단하게 개설할 수 있어요.</p>
                </div>
                <span className="pension-howto__check" aria-hidden="true">
                  <svg viewBox="0 0 28 28">
                    <path className="pension-howto__check-box" d="M27 1H1V27H27V1Z" />
                    <path className="pension-howto__check-mark" d="M8 14L12 18L20 10" />
                  </svg>
                </span>
              </li>
              <li className={`pension-howto__step${doneStep >= 2 ? " is-done" : ""}`} data-step="2">
                <span className="pension-howto__step-num">02</span>
                <div className="pension-howto__step-text">
                  <p className="pension-howto__step-title">KODEX ETF 담기</p>
                  <p className="pension-howto__step-desc">계좌에서 원하는 상품을 검색하거나 담아보세요.</p>
                </div>
                <span className="pension-howto__check" aria-hidden="true">
                  <svg viewBox="0 0 28 28">
                    <path className="pension-howto__check-box" d="M27 1H1V27H27V1Z" />
                    <path className="pension-howto__check-mark" d="M8 14L12 18L20 10" />
                  </svg>
                </span>
              </li>
              <li className={`pension-howto__step${doneStep >= 3 ? " is-done" : ""}`} data-step="3">
                <span className="pension-howto__step-num">03</span>
                <div className="pension-howto__step-text">
                  <p className="pension-howto__step-title">자동이체 설정</p>
                  <p className="pension-howto__step-desc">매달 납입할 금액과 날짜를 정해두면 그 다음부턴 자동이에요.</p>
                </div>
                <span className="pension-howto__check" aria-hidden="true">
                  <svg viewBox="0 0 28 28">
                    <path className="pension-howto__check-box" d="M27 1H1V27H27V1Z" />
                    <path className="pension-howto__check-mark" d="M8 14L12 18L20 10" />
                  </svg>
                </span>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Back Cover / CTA */}
      <section className="pension-cta">
        <div className="pension-inner">
          <div className="pension-cta__row">
            <div className="pension-cta__text">
              <h2 className="pension-cta__title">연금, KODEX하다. 1위를 담다.</h2>
              <p className="pension-cta__desc">국내 ETF 순자산 1위* 삼성자산운용 KODEX</p>
            </div>
            <a className="pension-cta__btn" href="#none">
              KODEX 연금 상품 전체보기&nbsp;&nbsp;→
            </a>
          </div>
          <p className="pension-cta__meta">Samsung Financial Networks&nbsp;&nbsp;|&nbsp;&nbsp;The Pension Issue 2026</p>
        </div>
      </section>
    </div>
  )
}
