import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthData } from '../auth/AuthWrapper';
import logo from '../assets/logo.png';

const Footer = () => {
  const { user, logout } = AuthData();
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const guestLinks = [
    { to: '/login', label: 'Logowanie' },
    { to: '/register', label: 'Rejestracja' },
    { to: '/about', label: 'O nas' },
    { to: '/contact', label: 'Kontakt' },
    { to: '/market', label: 'Marketplace' },
  ];

  const authLinks = [
    { to: '/account', label: 'Konto' },
    { to: '/addOffer', label: 'Dodaj ofertę' },
    { to: '/chat', label: 'Czaty' },
    { to: '/market', label: 'Marketplace' },
  ];

  const legalLinks = [
    { to: '#', label: 'Regulamin' },
    { to: '#', label: 'Polityka prywatności' },
    { to: '/contact', label: 'Wsparcie' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <footer className="border-t border-gray-300 dark:border-[#3a3b3c] bg-gray-100 dark:bg-[#18191a] text-gray-700 dark:text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Stylify logo" className="w-12 h-12 object-contain" />
              <span className="text-xl font-semibold text-gray-900 dark:text-white">Stylify</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">Platforma do kupna, sprzedaży i wymiany ubrań. Budujemy zaufanie i wygodę w modzie społecznościowej.</p>
            {user?.isAuthenticated && (
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">Zalogowany jako: <span className="font-medium text-gray-800 dark:text-gray-200">{user.username}</span></p>
            )}
          </div>

          {/* Nawigacja główna */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Nawigacja</h4>
            <ul className="space-y-2 text-sm">
              {(user?.isAuthenticated ? authLinks : guestLinks).map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-[#D47C24] transition-colors">{l.label}</Link>
                </li>
              ))}
              {user?.isAuthenticated && (
                <li>
                  <button onClick={handleLogout} className="hover:text-[#D47C24] transition-colors">Wyloguj</button>
                </li>
              )}
            </ul>
          </div>

          {/* Informacje / zasoby */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Informacje</h4>
              <ul className="space-y-2 text-sm">
                {legalLinks.map(l => (
                  <li key={l.label}>
                    <Link to={l.to} className="hover:text-[#D47C24] transition-colors">{l.label}</Link>
                  </li>
                ))}
                <li>
                  <a href="https://github.com/1SHIGERU" target="_blank" rel="noreferrer" className="hover:text-[#D47C24] transition-colors">GitHub</a>
                </li>
              </ul>
            </div>

          {/* Newsletter / social */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Bądź na bieżąco</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Dołącz do newslettera aby otrzymywać najnowsze oferty.</p>
            <form onSubmit={(e) => { e.preventDefault(); }} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Twój email"
                className="w-full px-3 py-2 rounded-md bg-gray-200 dark:bg-[#242526] text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#D47C24]"
                aria-label="Email"
              />
              <button
                type="submit"
                className="inline-flex justify-center items-center px-3 py-2 rounded-md bg-[#D47C24] text-white text-sm font-medium hover:bg-[#bf6e1f] transition-colors"
              >Subskrybuj</button>
            </form>
            <div className="flex gap-4 mt-5 text-lg">
              <a href="#" aria-label="Facebook" className="hover:text-[#D47C24] transition-colors">𝔣</a>
              <a href="#" aria-label="Instagram" className="hover:text-[#D47C24] transition-colors">◎</a>
              <a href="#" aria-label="Twitter" className="hover:text-[#D47C24] transition-colors">✦</a>
            </div>
          </div>
        </div>

        {/* Dolny pasek */}
        <div className="mt-12 pt-6 border-t border-gray-300 dark:border-[#3a3b3c] flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-gray-600 dark:text-gray-400">© {year} Stylify. Wszelkie prawa zastrzeżone.</p>
          <p className="text-gray-500 dark:text-gray-500">Wersja interfejsu: v1.0 • Środowisko: {process.env.NODE_ENV}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;