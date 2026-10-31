
export function CardInfo({ headingText, numberInfo }: { headingText: string; numberInfo: number }) {
  return (
    <div className="w-36 rounded-xl border border-gray bg-white px-3.5 py-3">
        <p className="text-[9px] text-gray-400">{headingText}</p>
        
        <p className="mt-1 text-base font-semibold text-gray-900">{numberInfo}</p>
    </div>
  )
}