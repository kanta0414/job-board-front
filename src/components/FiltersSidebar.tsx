import type { JobCategory } from '../api/jobApi'

type SalaryOption = { value: number | null; label: string }

export default function FiltersSidebar(props: {
  categories: JobCategory[]
  selectedCategories: JobCategory[]
  onToggleCategory: (category: JobCategory) => void
  minSalaryOption: number | null
  salaryOptions: SalaryOption[]
  onMinSalaryChange: (value: number | null) => void
}) {
  const {
    categories,
    selectedCategories,
    onToggleCategory,
    minSalaryOption,
    salaryOptions,
    onMinSalaryChange,
  } = props

  return (
    <aside className="w-[300px] shrink-0 border-r border-gray-200 bg-white">
      <div className="p-4">
        <h2 className="mb-4 text-base font-semibold text-gray-900">フィルター</h2>

        <div className="mb-6">
          <div className="mb-2 text-sm font-medium text-gray-800">求人カテゴリ</div>
          <div className="max-h-[45vh] space-y-2 overflow-auto pr-1">
            {categories.map((cat) => {
              const checked = selectedCategories.includes(cat)
              const id = `cat-${cat}`
              return (
                <label key={cat} htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm text-gray-800">
                  <input
                    id={id}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={checked}
                    onChange={() => onToggleCategory(cat)}
                  />
                  <span className="truncate">{cat}</span>
                </label>
              )
            })}
            {categories.length === 0 && (
              <div className="text-xs text-gray-500">カテゴリを取得中...</div>
            )}
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm font-medium text-gray-800">年収（万円）</div>
          <select
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={minSalaryOption === null ? '' : String(minSalaryOption)}
            onChange={(e) => {
              const raw = e.target.value
              onMinSalaryChange(raw === '' ? null : Number(raw))
            }}
          >
            {salaryOptions.map((opt) => (
              <option key={opt.label} value={opt.value === null ? '' : String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </aside>
  )
}

