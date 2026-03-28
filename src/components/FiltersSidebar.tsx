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
    <aside className="flex min-h-full w-[260px] shrink-0 flex-col border-r border-gray-200 bg-slate-100">
      <div className="flex flex-1 flex-col p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">求人カテゴリ</h2>

        <div className="mb-5">
          <div className="max-h-[52vh] space-y-1 overflow-auto pr-1">
            {categories.map((cat) => {
              const checked = selectedCategories.includes(cat)
              const id = `cat-${cat}`
              return (
                <label key={cat} htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm text-gray-800">
                  <input
                    id={id}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-slate-700 focus:ring-slate-500"
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
          <div className="mb-2 text-sm font-semibold text-gray-900">年収</div>
          <select
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
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

