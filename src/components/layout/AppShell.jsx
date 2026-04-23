import Sidebar from "./Sidebar"

export default function AppShell({ page, setPage, setView, children }) {
  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      <Sidebar page={page} setPage={setPage} setView={setView} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-7">{children}</div>
      </main>
    </div>
  )
}
