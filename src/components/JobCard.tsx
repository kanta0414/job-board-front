import type { Job } from '../api/jobApi'
import { formatSalaryMan } from '../api/jobApi'

export default function JobCard({ job }: { job: Job }) {
  return (
    <article className="rounded border border-gray-200 bg-white px-4 py-4 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900">{job.title}</h3>
      <div className="mt-2 flex flex-col gap-1 text-xs text-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">カテゴリ:</span>
          <span>{job.category}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">年収:</span>
          <span>{typeof job.salary === 'number' ? formatSalaryMan(job.salary) : '—'}</span>
        </div>
      </div>
    </article>
  )
}

