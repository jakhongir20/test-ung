import type { FC } from 'react';
import { useMemo, useState } from 'react';

type Employee = {
  id: number;
  name: string;
  branch: string;
  position: string;
  lastScore: number;
  attempts: number;
  status: 'Refunded' | 'Passed' | 'Failed';
};

const employeesSeed: Employee[] = [
  { id: 1, name: 'Azizbek Karimov', branch: 'Toshkent', position: 'Ishchi va texnik xodimlar', lastScore: 27, attempts: 1, status: 'Refunded' },
  { id: 2, name: 'Dilshod Rasulov', branch: 'Surxondaryo', position: 'Muhandis-texnik xodim', lastScore: 16, attempts: 2, status: 'Refunded' },
  { id: 3, name: 'Diyorbek Tursunov', branch: 'Qarshi', position: 'Boshqaruv va iqtisodiy boʼlimlar', lastScore: 3, attempts: 1, status: 'Refunded' },
  { id: 4, name: 'Umidjon Toʼxtayev', branch: 'Namangan', position: 'Ilmiy va huquqiy xodimlar', lastScore: 30, attempts: 3, status: 'Refunded' },
  { id: 5, name: 'Zokirjon Alimov', branch: 'Toshkent', position: 'Rahbariyat va menejment', lastScore: 2, attempts: 1, status: 'Refunded' },
];

const statusBadge: Record<Employee['status'], string> = {
  Refunded: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Passed: 'bg-blue-50 text-blue-700 ring-blue-200',
  Failed: 'bg-rose-50 text-rose-700 ring-rose-200',
};

const AdminEmployeesPage: FC = () => {
  const [branch, setBranch] = useState<string>('');
  const [position, setPosition] = useState<string>('');
  const [testStatus, setTestStatus] = useState<string>('');
  const [page, setPage] = useState(5);
  const [selected, setSelected] = useState<Employee | null>(null);

  const branches = useMemo(() => Array.from(new Set(employeesSeed.map((e) => e.branch))), []);
  const positions = useMemo(() => Array.from(new Set(employeesSeed.map((e) => e.position))), []);

  const filtered = employeesSeed.filter((e) =>
    (branch ? e.branch === branch : true) &&
    (position ? e.position === position : true) &&
    (testStatus ? e.status === testStatus : true),
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-cyan-600/90 text-white p-6 md:p-10 relative overflow-hidden">
        <h2 className="text-xl md:text-2xl font-semibold tracking-wide">MY PROFILE</h2>
        <p className="mt-2 max-w-2xl text-white/90 text-sm md:text-base">
          Review your practice test scores, dig deeper into your performance, and learn your strengths before test day.
        </p>
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl" />
      </section>

      <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold">All employees</h3>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select value={branch} onChange={(e) => setBranch(e.target.value)} className="rounded-lg border-gray-300 focus:ring-cyan-500 focus:border-cyan-500">
              <option value="">Branches</option>
              {branches.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={position} onChange={(e) => setPosition(e.target.value)} className="rounded-lg border-gray-300 focus:ring-cyan-500 focus:border-cyan-500">
              <option value="">Positions</option>
              {positions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={testStatus} onChange={(e) => setTestStatus(e.target.value)} className="rounded-lg border-gray-300 focus:ring-cyan-500 focus:border-cyan-500">
              <option value="">Test status</option>
              {(['Refunded', 'Passed', 'Failed'] as const).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-3 pr-4">Ф.И.О.</th>
                  <th className="py-3 pr-4">Филиал</th>
                  <th className="py-3 pr-4">Должность</th>
                  <th className="py-3 pr-4">Последний балл</th>
                  <th className="py-3 pr-4">Количество попыток</th>
                  <th className="py-3 pr-4">Статус</th>
                  <th className="py-3 pr-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">{e.name}</td>
                    <td className="py-3 pr-4">{e.branch}</td>
                    <td className="py-3 pr-4">{e.position}</td>
                    <td className="py-3 pr-4">{e.lastScore}</td>
                    <td className="py-3 pr-4">{e.attempts}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadge[e.status]}`}>{e.status}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <button onClick={() => setSelected(e)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-gray-200 hover:bg-gray-50" aria-label="View">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-3 text-sm text-gray-600">
            <button className="rounded-lg ring-1 ring-gray-200 px-2.5 py-1 hover:bg-gray-50">Previous</button>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setPage(n)} className={`h-8 w-8 rounded-lg ring-1 ${page === n ? 'bg-cyan-600 text-white ring-cyan-600' : 'ring-gray-200 hover:bg-gray-50'}`}>{n}</button>
            ))}
            <span className="mx-2">…</span>
            <button className="rounded-lg ring-1 ring-gray-200 px-2.5 py-1 hover:bg-gray-50">Next</button>
            <div className="ml-auto">Showing 100 of 1,000 results</div>
          </div>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
          <div className="absolute right-4 top-4 bottom-4 w-[min(760px,95vw)] overflow-auto rounded-2xl bg-white ring-1 ring-gray-200 shadow-xl p-6">
            <div className="flex items-start justify-between">
              <h4 className="text-lg font-semibold">About employee</h4>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadge[selected.status]}`}>{selected.status}</span>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl ring-1 ring-gray-200 p-3">
                <div className="text-xs text-gray-500">Ф.И.О.</div>
                <div className="font-medium">{selected.name}</div>
              </div>
              <div className="rounded-xl ring-1 ring-gray-200 p-3">
                <div className="text-xs text-gray-500">Филиал</div>
                <div className="font-medium">{selected.branch}</div>
              </div>
              <div className="rounded-xl ring-1 ring-gray-200 p-3">
                <div className="text-xs text-gray-500">Должность</div>
                <div className="font-medium">{selected.position}</div>
              </div>
              <div className="rounded-xl ring-1 ring-gray-200 p-3">
                <div className="text-xs text-gray-500">Последний балл</div>
                <div className="font-medium">{selected.lastScore}</div>
              </div>
              <div className="rounded-xl ring-1 ring-gray-200 p-3 md:col-span-2">
                <div className="text-xs text-gray-500">Количество попыток</div>
                <div className="font-medium">{selected.attempts}</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[24, 16, 4].map((v, i) => (
                <article key={i} className="rounded-xl overflow-hidden ring-1 ring-gray-200 bg-white">
                  <div className="p-4 bg-[url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center/30 rounded-b-none">
                    <div className="text-sm font-semibold">Test #{i + 1}</div>
                    <div className="text-xs text-gray-700/80">March 19, 2025</div>
                  </div>
                  <div className="p-6 grid place-items-center">
                    <div className="text-xs text-gray-500">Umumiy to'liq javoblar</div>
                    <div className="text-5xl font-bold text-cyan-700">{v}</div>
                    <div className="text-xs text-gray-500">1-30</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployeesPage


