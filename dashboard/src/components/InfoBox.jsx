export default function InfoBox() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-3">Guide</h3>
      <div className="space-y-3 text-sm text-gray-600">
        <div>
          <h4 className="font-medium text-gray-700 mb-1">Filters</h4>
          <ul className="list-disc list-inside space-y-0.5">
            <li>
              <strong>RSI &lt; 40</strong>: 상대강도지수가 낮은 과매도 종목
            </li>
            <li>
              <strong>Market Cap</strong>: 대형주 필터 (기본 100B 이상)
            </li>
            <li>
              <strong>52W High %</strong>: 52주 고점 대비 현재가 위치
            </li>
            <li>
              <strong>EPS Growth</strong>: 이익 성장률 양수 종목
            </li>
            <li>
              <strong>Buy/Strong Buy</strong>: 애널리스트 추천 점수 2.5 이하
            </li>
            <li>
              <strong>PER &lt; Sector Avg</strong>: 섹터 평균보다 저평가
            </li>
            <li>
              <strong>Revenue Growth</strong>: 매출 성장률 (YoY) 양수 종목
            </li>
            <li>
              <strong>Price &gt; 80% of 200DMA</strong>: 200일 이동평균 대비
              가격이 80% 이상인 종목 (장기 추세 지지)
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-gray-700 mb-1">Market State</h4>
          <ul className="list-disc list-inside space-y-0.5">
            <li>
              <strong>S&P500 200DMA</strong>: S&P500 지수가 200일 이동평균
              위/아래인지 표시하여 전체 시장 추세를 판단합니다
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-gray-700 mb-1">Usage</h4>
          <ul className="list-disc list-inside space-y-0.5">
            <li>슬라이더를 조절하여 조건을 변경합니다</li>
            <li>컬럼 헤더를 클릭하면 정렬됩니다</li>
            <li>행을 클릭하면 상세 정보가 표시됩니다</li>
          </ul>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-700">
          <strong>Disclaimer:</strong> 이 스크리너는 참고용이며 투자 조언이
          아닙니다. 투자 결정은 본인의 판단과 책임 하에 이루어져야 합니다.
        </div>
      </div>
    </div>
  );
}
