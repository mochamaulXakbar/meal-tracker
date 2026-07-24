import { Link } from 'react-router-dom';
import { Scale, Search, Sparkles, MessageCircle, History, UserPlus, ClipboardList, Utensils } from 'lucide-react';
import Button from '../components/ui/Button';
import salad from '../assets/salad.jpg';
import logoIcon from '../assets/logo-icon.png';

const fitur = [
  { icon: Scale, judul: 'Kalkulator BMI/TDEE', desc: 'Hitung kebutuhan kalori harianmu secara akurat.' },
  { icon: Search, judul: 'Pencarian Makanan', desc: 'Info gizi lengkap dari database makanan.' },
  { icon: Sparkles, judul: 'AI Meal Planner', desc: 'Rekomendasi menu harian otomatis dari AI.' },
  { icon: MessageCircle, judul: 'AI Diet Buddy', desc: 'Tanya jawab seputar nutrisi & diet sehat.' },
  { icon: History, judul: 'Riwayat Makanan & Berat', desc: 'Pantau progres harianmu dari waktu ke waktu.' },
];

const langkah = [
  { icon: UserPlus, judul: 'Daftar Akun', desc: 'Buat akun gratis dalam hitungan detik.' },
  { icon: ClipboardList, judul: 'Lengkapi Profil', desc: 'Isi data tinggi, berat, usia, dan aktivitas.' },
  { icon: Utensils, judul: 'Dapatkan Rekomendasi', desc: 'AI menyusun menu sesuai kebutuhanmu.' },
];

export default function LandingPage() {
  const navLinkClass =
    'relative font-medium text-gray-600 transition-colors duration-300 hover:text-primary after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-primary after:transition-all after:duration-300 hover:after:w-full';

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 h-16 border-b border-primary/10 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoIcon} alt="Meal Tracker" className="w-7 h-7" />
            <span className="font-semibold text-gray-900">Meal Tracker</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#fitur" className={navLinkClass}>Fitur</a>
            <a href="#cara-kerja" className={navLinkClass}>Cara Kerja</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="secondary">Masuk</Button>
            </Link>
            <Link to="/register">
              <Button>Daftar Gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block bg-primary-light text-primary text-xs font-medium px-3 py-1 rounded-full mb-4">
            Gratis untuk semua pengguna
          </span>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            Hidup Sehat<br /><span className="text-primary">Dimulai dari Piring</span>
          </h1>
          <p className="text-gray-500 mt-6 text-lg">
            Lacak nutrisi, hitung kalori, dan rencanakan diet sehat dengan bantuan AI - semua dalam satu platform yang simpel dan personal.
          </p>
          <div className="flex gap-3 mt-8">
            <Link to="/register">
              <Button className="px-6">Daftar Gratis</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="px-6">Masuk ke Akun</Button>
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">Tidak perlu kartu kredit - Mulai dalam 30 detik</p>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80"
            alt="Makanan sehat"
            className="w-full h-96 object-cover"
          />
        </div>
      </section>

      <section id="fitur" className="bg-primary-light py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-medium">FITUR LENGKAP</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Semua yang kamu butuhkan, dalam satu tempat</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {fitur.map((f) => (
              <div key={f.judul} className="bg-white rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                <f.icon size={22} className="text-primary mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">{f.judul}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cara-kerja" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-medium">CARA KERJA</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">Mulai dalam 3 langkah</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {langkah.map((l, i) => (
            <div
              key={l.judul}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary">
                <l.icon size={22} />
              </div>
              <p className="mb-2 text-xs font-semibold text-primary">Langkah {i + 1}</p>
              <h3 className="font-semibold text-gray-900 mb-1">{l.judul}</h3>
              <p className="text-sm text-gray-500">{l.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="relative overflow-hidden rounded-2xl p-10 text-center text-white shadow-xl">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${salad})` }}
          />
          <div className="absolute inset-0 bg-primary-dark/75" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Siap memulai perjalanan hidup sehat Anda?</h2>
            <p className="text-white/80 mb-6">Bergabung sekarang - gratis selamanya.</p>
            <Link to="/register">
              <Button variant="secondary" className="px-6">Daftar Gratis Sekarang</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src={logoIcon} alt="Meal Tracker" className="w-6 h-6" />
              <span className="font-semibold">Meal Tracker</span>
            </div>
            <p className="text-white/60">© 2026 Meal Tracker and Planner.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Produk</h4>
            <a href="#fitur" className="block text-white/70 transition-colors hover:text-white mb-1">Fitur</a>
            <a href="#cara-kerja" className="block text-white/70 transition-colors hover:text-white">Cara Kerja</a>
          </div>
          <div>
            <h4 className="font-medium mb-2">Akun</h4>
            <Link to="/login" className="block text-white/70 transition-colors hover:text-white mb-1">Masuk</Link>
            <Link to="/register" className="block text-white/70 transition-colors hover:text-white">Daftar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
