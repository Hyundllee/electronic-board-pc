import { CSSProperties, useEffect, useRef, useState } from "react"

import "../../styles/utility/index.scss"
import "../../styles/pages/kodex/index.scss"

/** 메인 전광판 API */
const LED_PRODUCT_API = "/api/v1/kodex/main/led-product.do"

/** 거래중일 때 시세 갱신 주기 */
const POLL_INTERVAL = 3500

/** 전광판 흐름 속도 (px / sec) */
const FLOW_SPEED = 60

/** 숫자 롤링 시 자릿수 간 시차 */
const ROLL_STEP = 35

type LedProduct = {
  /** 상품코드 */
  fld: string
  /** 상품명 */
  fNm: string
  /** 현재가 */
  curp: number
  /** 현재가 증감액 */
  risep: number
  /** 현재가 등락률 */
  risepRt: number
}

type LedProductResponse = {
  /** 거래여부. false = 거래마감 */
  isTrading: boolean
  /** 상품리스트정보. 전광판 미노출시 빈 배열 */
  list: LedProduct[]
}

type Direction = "up" | "down" | "flat"

type BoardState = {
  items: LedProduct[]
  prevItems: Record<string, LedProduct>
  generation: number
  loaded: boolean
}

type FlowStyle = CSSProperties & { "--led-flow-duration": string }
type RollStyle = CSSProperties & { "--led-roll-delay": string }

const numberFormat = new Intl.NumberFormat("ko-KR")

const decodeEntity = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))

const toItemMap = (items: LedProduct[]) =>
  items.reduce<Record<string, LedProduct>>((map, item) => {
    map[item.fld] = item
    return map
  }, {})

/** 증감액이 절대값으로 내려오는 경우가 있어 등락률을 우선 사용 */
const directionOf = (item: LedProduct): Direction => {
  const base = item.risepRt !== 0 ? item.risepRt : item.risep
  if (base > 0) return "up"
  if (base < 0) return "down"
  return "flat"
}

const formatPrice = (value: number) => numberFormat.format(Math.round(value))

const formatChange = (item: LedProduct) =>
  `${numberFormat.format(Math.abs(Math.round(item.risep)))}(${Math.abs(item.risepRt).toFixed(2)}%)`

/* ------------------------------------------------------------------ *
 * 로컬 확인용 목 데이터 — API 연동 후 이 블록과 load() 의 fallback 삭제
 * ------------------------------------------------------------------ */
const IS_LOCAL =
  typeof window !== "undefined" &&
  /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname)

const MOCK_SEED = [
  { fld: "2ETF04", fNm: "KODEX 미국나스닥100 ETF", curp: 27610, base: 27510 },
  { fld: "2ETFE4", fNm: "KODEX 미국S&amp;P500 ETF", curp: 23545, base: 23655 },
  { fld: "2ETF01", fNm: "KODEX 200커버드콜액티브 ETF", curp: 8195, base: 8150 },
  { fld: "2ETF02", fNm: "KODEX 200타겟위클리커버드콜 ETF", curp: 20170, base: 20055 },
  { fld: "2ETF03", fNm: "KODEX 미국배당다우존스 ETF", curp: 10935, base: 10900 },
].map((item) => ({ ...item }))

const readMock = (): LedProductResponse => ({
  isTrading: true,
  list: MOCK_SEED.map((seed) => {
    if (Math.random() >= 0.3) {
      const step = Math.ceil(Math.random() * 4) * 5
      seed.curp = Math.max(step, seed.curp + (Math.random() < 0.5 ? -step : step))
    }

    const diff = seed.curp - seed.base
    return {
      fld: seed.fld,
      fNm: seed.fNm,
      curp: seed.curp,
      risep: Math.abs(diff),
      risepRt: Number(((diff / seed.base) * 100).toFixed(2)),
    }
  }),
})
/* ------------------------------------------------------------------ */

const load = async (signal: AbortSignal): Promise<LedProductResponse> => {
  try {
    const response = await fetch(LED_PRODUCT_API, {
      signal,
      headers: { Accept: "application/json" },
    })

    if (!response.ok) throw new Error(`메인 전광판 API 오류 (${response.status})`)

    return (await response.json()) as LedProductResponse
  } catch (error) {
    if (signal.aborted || !IS_LOCAL) throw error
    return readMock()
  }
}

function useLedProducts() {
  const [state, setState] = useState<BoardState>({
    items: [],
    prevItems: {},
    generation: 0,
    loaded: false,
  })
  const liveRef = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    let stopped = false
    let timer = 0

    const read = async () => {
      let keepPolling = false

      try {
        const data = await load(controller.signal)
        if (stopped) return

        const list = Array.isArray(data.list) ? data.list : []
        const isTrading = Boolean(data.isTrading)

        setState((prev) => ({
          items: list,
          prevItems: toItemMap(prev.items),
          generation: prev.generation + 1,
          loaded: true,
        }))

        // 전광판 off (list 미수신) 이면 isTrading 과 무관하게 호출 중단
        // 거래마감 (isTrading false) 이어도 호출 중단
        keepPolling = list.length > 0 && isTrading
        liveRef.current = keepPolling
      } catch (error) {
        if (stopped || controller.signal.aborted) return
        console.warn("[kodex-led] 메인 전광판 시세 조회 실패", error)
        // 거래중이던 전광판은 일시적인 오류로 멈추지 않도록 재시도
        keepPolling = liveRef.current
      }

      if (!stopped && keepPolling) {
        timer = window.setTimeout(read, POLL_INTERVAL)
      }
    }

    read()

    return () => {
      stopped = true
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [])

  return state
}

type DigitsProps = {
  value: string
  prevValue?: string
  roll: Direction
  generation: number
}

/** 바뀐 자릿수만 위·아래로 굴러가며 교체 */
function Digits({ value, prevValue, roll, generation }: DigitsProps) {
  const chars = value.split("")
  const prevChars = prevValue?.split("")
  const canRoll = roll !== "flat" && !!prevChars && prevChars.length === chars.length

  return (
    <span className="kodex-led__digits">
      {chars.map((char, index) => {
        const old = canRoll ? prevChars[index] : char
        const changed = canRoll && old !== char
        const style = changed
          ? ({ "--led-roll-delay": `${(chars.length - 1 - index) * ROLL_STEP}ms` } as RollStyle)
          : undefined

        return (
          <span
            key={changed ? `${index}-${generation}` : index}
            className={changed ? `kodex-led__cell is-roll-${roll}` : "kodex-led__cell"}
            style={style}
          >
            <span className="kodex-led__cell-new">{char}</span>
            {changed ? (
              <span className="kodex-led__cell-old" aria-hidden="true">
                {old}
              </span>
            ) : null}
          </span>
        )
      })}
    </span>
  )
}

type TickerItemProps = {
  item: LedProduct
  prev?: LedProduct
  generation: number
}

function TickerItem({ item, prev, generation }: TickerItemProps) {
  const direction = directionOf(item)
  const tick: Direction =
    !prev || prev.curp === item.curp ? "flat" : item.curp > prev.curp ? "up" : "down"

  const className = ["kodex-led__item", `is-${direction}`]
  if (tick !== "flat") className.push(`is-flash-${tick}`)

  return (
    <div className={className.join(" ")}>
      <span className="kodex-led__name">{decodeEntity(item.fNm)}</span>

      <span className="kodex-led__price">
        <Digits
          value={formatPrice(item.curp)}
          prevValue={prev ? formatPrice(prev.curp) : undefined}
          roll={tick}
          generation={generation}
        />
        <span className="kodex-led__unit">원</span>
      </span>

      <span className="kodex-led__change">
        {direction === "flat" ? null : (
          <svg
            className={direction === "up" ? "kodex-led__arrow is-up" : "kodex-led__arrow"}
            viewBox="0 0 12 9"
            aria-hidden="true"
          >
            <path d="M6 9 0 0h12z" />
          </svg>
        )}
        <Digits
          value={formatChange(item)}
          prevValue={prev ? formatChange(prev) : undefined}
          roll={tick}
          generation={generation}
        />
      </span>
    </div>
  )
}

export default function KodexLedBoard() {
  const { items, prevItems, generation, loaded } = useLedProducts()
  const seqRef = useRef<HTMLDivElement>(null)
  const [duration, setDuration] = useState(0)

  // 트랙 폭에 맞춰 일정한 px/s 를 유지 (갱신마다 다시 재지 않아야 흐름이 끊기지 않음)
  useEffect(() => {
    if (!loaded) return

    const measure = () => {
      const seq = seqRef.current
      if (!seq || seq.scrollWidth <= 0) return
      setDuration(Math.round((seq.scrollWidth / FLOW_SPEED) * 10) / 10)
    }

    measure()
    window.addEventListener("resize", measure)
    document.fonts.ready.then(measure).catch(() => {})

    return () => window.removeEventListener("resize", measure)
  }, [loaded])

  // 전광판 off (list 미수신) 이면 노출하지 않음
  if (!loaded || items.length === 0) return null

  const style = duration > 0 ? ({ "--led-flow-duration": `${duration}s` } as FlowStyle) : undefined

  const renderSeq = (ref?: React.Ref<HTMLDivElement>, hidden = false) => (
    <div className="kodex-led__seq" ref={ref} aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <TickerItem key={item.fld} item={item} prev={prevItems[item.fld]} generation={generation} />
      ))}
    </div>
  )

  return (
    <div className="kodex-led" aria-label="KODEX ETF 실시간 시세">
      <div className="kodex-led__screen">
        <div className="kodex-led__viewport">
          <div className="kodex-led__track" style={style}>
            {renderSeq(seqRef)}
            {renderSeq(undefined, true)}
          </div>
        </div>
        <span className="kodex-led__sheen" />
      </div>
    </div>
  )
}
