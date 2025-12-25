import Link from "next/link"

const Header = () => {
  const navItems = [
    { name: "Beranda", href: "/" },
    { name: "Profil Masjid", href: "/profil" },
    { name: "Jadwal Sholat", href: "/jadwal-sholat" },
    { name: "Kegiatan", href: "/kegiatan" },
    { name: "Donasi", href: "/donasi" },
    { name: "Kontak", href: "/kontak" },
  ]

  return (
    <header className="bg-gray-100 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Masjid Al-Ikhlas
        </Link>
        <nav>
          <ul className="flex space-x-6">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link href={item.href} className="hover:text-gray-500">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
