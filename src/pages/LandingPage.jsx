import { ShoppingBag } from "lucide-react"
import { PrimaryBtn } from "../components/ui/Buttons"

const CATEGORIES = ["📷 Electronics", "🔧 Tools", "⛺ Outdoor", "🏸 Sports", "🎹 Music", "💡 Event Gear"]

const HOW_IT_WORKS = [
  { n: 1, icon: "🔍", title: "Browse & Search",   desc: "Explore hundreds of items listed by owners across Malaysia." },
  { n: 2, icon: "📋", title: "Submit a Request",   desc: "Select your dates, submit a rental or borrow request — no payment needed upfront." },
  { n: 3, icon: "✅", title: "Owner Approves",     desc: "Owner confirms availability and accepts your request within 24 hours." },
  { n: 4, icon: "🤝", title: "Pick Up & Enjoy",    desc: "Collect the item, use it, and return it by the agreed date." },
]

export default function LandingPage({ setView }) {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur border-b border-stone-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-stone-900">RenBoNow</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setView("login")} className="text-stone-600 hover:text-stone-900 text-sm font-medium px-4 py-2 transition-colors">Log in</button>
            <PrimaryBtn onClick={() => setView("register")} small>Sign up free</PrimaryBtn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white pt-24 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #f97316 0%, transparent 50%), radial-gradient(circle at 80% 20%, #f59e0b 0%, transparent 50%)" }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
            Malaysia's #1 Peer-to-Peer Rental Platform
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-4 tracking-tight">
            Rent anything.<br />
            <span className="text-orange-400">Earn from everything.</span>
          </h1>
          <p className="text-stone-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Borrow what you need, rent out what you own. RenBoNow connects owners and renters across Malaysia.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <PrimaryBtn onClick={() => setView("register")} className="text-base px-8 py-3">Start Browsing Items</PrimaryBtn>
            <button onClick={() => setView("register")} className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3 rounded-xl text-base transition-all">List Your Items →</button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-3 divide-x divide-stone-100">
          {[["500+", "Active Listings"], ["1,200+", "Happy Renters"], ["RM 80K+", "Earned by Owners"]].map(([n, l]) => (
            <div key={l} className="text-center px-8">
              <p className="text-2xl font-extrabold text-stone-900">{n}</p>
              <p className="text-stone-500 text-sm">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Browse by Category</h2>
        <p className="text-stone-500 mb-7">From cameras to camping gear — find what you need nearby.</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setView("register")} className="bg-white border border-stone-100 hover:border-orange-300 hover:shadow-sm rounded-2xl p-4 text-center transition-all group">
              <span className="text-2xl block mb-1.5">{c.split(" ")[0]}</span>
              <span className="text-xs font-medium text-stone-600 group-hover:text-orange-600">{c.split(" ").slice(1).join(" ")}</span>
            </button>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-stone-900 mb-2 text-center">How It Works</h2>
        <p className="text-stone-500 text-center mb-10">Renting has never been simpler.</p>
        <div className="grid sm:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map(s => (
            <div key={s.n} className="text-center">
              <div className="w-14 h-14 bg-orange-50 border-2 border-orange-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">{s.icon}</div>
              <p className="font-semibold text-stone-800 mb-1.5">{s.title}</p>
              <p className="text-stone-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-orange-600 py-14">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">Own items you barely use?</h2>
          <p className="text-orange-100 mb-7">List them on RenBoNow and start earning passive income today. It's free to join.</p>
          <PrimaryBtn onClick={() => setView("register")} className="bg-white !text-orange-600 hover:!bg-orange-50 text-base px-8 py-3">Start Listing Now →</PrimaryBtn>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-500 py-10 text-center text-sm">
        <p className="font-semibold text-stone-300 mb-1">RenBoNow</p>
        <p>© 2026 RenBoNow Malaysia. Built with Spring Boot + React.</p>
      </footer>
    </div>
  )
}
