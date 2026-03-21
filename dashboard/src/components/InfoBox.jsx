import { useI18n } from "../i18n/I18nContext";

function GuideItem({ labelKey, descKey }) {
  const { t } = useI18n();
  return (
    <li>
      <strong>{t(labelKey)}</strong>: {t(descKey)}
    </li>
  );
}

export default function InfoBox() {
  const { t } = useI18n();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-3">{t("guide.title")}</h3>
      <div className="space-y-3 text-sm text-gray-600">
        <div>
          <h4 className="font-medium text-gray-700 mb-1">{t("guide.filters.title")}</h4>
          <ul className="list-disc list-inside space-y-0.5">
            <GuideItem labelKey="guide.filters.rsi.label" descKey="guide.filters.rsi.desc" />
            <GuideItem labelKey="guide.filters.marketCap.label" descKey="guide.filters.marketCap.desc" />
            <GuideItem labelKey="guide.filters.52wHigh.label" descKey="guide.filters.52wHigh.desc" />
            <GuideItem labelKey="guide.filters.epsGrowth.label" descKey="guide.filters.epsGrowth.desc" />
            <GuideItem labelKey="guide.filters.buyOnly.label" descKey="guide.filters.buyOnly.desc" />
            <GuideItem labelKey="guide.filters.perSector.label" descKey="guide.filters.perSector.desc" />
            <GuideItem labelKey="guide.filters.revGrowth.label" descKey="guide.filters.revGrowth.desc" />
            <GuideItem labelKey="guide.filters.200dma.label" descKey="guide.filters.200dma.desc" />
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-gray-700 mb-1">{t("guide.market.title")}</h4>
          <ul className="list-disc list-inside space-y-0.5">
            <GuideItem labelKey="guide.market.sp500.label" descKey="guide.market.sp500.desc" />
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-gray-700 mb-1">{t("guide.usage.title")}</h4>
          <ul className="list-disc list-inside space-y-0.5">
            <li>{t("guide.usage.slider")}</li>
            <li>{t("guide.usage.sort")}</li>
            <li>{t("guide.usage.expand")}</li>
          </ul>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-700">
          <strong>{t("guide.disclaimer.label")}</strong> {t("guide.disclaimer.desc")}
        </div>
      </div>
    </div>
  );
}
