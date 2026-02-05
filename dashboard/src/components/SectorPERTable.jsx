export default function SectorPERTable({ sectorAverages }) {
  if (!sectorAverages || Object.keys(sectorAverages).length === 0) {
    return null;
  }

  const sorted = Object.entries(sectorAverages).sort((a, b) => a[1] - b[1]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-4">
        Sector Average Forward PER
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sorted.map(([sector, per]) => (
          <div
            key={sector}
            className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2"
          >
            <span className="text-sm text-gray-700 truncate mr-2">
              {sector}
            </span>
            <span className="text-sm font-mono font-semibold text-gray-900 shrink-0">
              {per.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
