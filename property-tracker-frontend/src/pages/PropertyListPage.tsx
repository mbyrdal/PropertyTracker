import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import {
  Home,
  MapPin,
  List,
  Receipt,
  TrendingUp,
  Percent,
} from 'lucide-react';
import type { EnhancedProperty } from '../types/property';
import './PropertyListPage.css';            // keep your local tweaks
import '../components/EnhancedPropertyMap.css'; // ✔️ makes sure header styles exist

export default function PropertyListPage() {
  /* ───────────────────────────────────────── state ───────────────────────────────────────── */
  const [properties, setProperties] = useState<EnhancedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token }         = useAuth();
  const { currentView } = useNavigation();
  const navigate          = useNavigate();

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7188/api';

  /* ───────────────────────────────────────── fetch ───────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/property`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP status ${res.status}`);
        const data = await res.json();

        const transformed: EnhancedProperty[] = data.map((p: any) => ({
          id: p.id.toString(),
          name: p.name,
          address: p.address,
          status: p.status ?? 'Active',
          lat: p.latitude,
          lng: p.longitude,
          purchasePrice: p.purchasePrice,
          purchaseDate: p.purchaseDate,
          squareMeters: p.squareMeters,
          tenantCount: p.tenantCount,
          financials: {
            monthlyIncome: p.totalMonthlyRent,
            monthlyExpenses: Math.round(p.totalMonthlyRent * 0.3),
            cashFlow: p.totalMonthlyRent - Math.round(p.totalMonthlyRent * 0.3),
            yield: parseFloat(
              ((p.totalMonthlyRent * 12) / p.purchasePrice * 100).toFixed(1)
            ),
          },
          maintenance: {
            lastService: new Date(
              new Date(p.purchaseDate).setMonth(
                new Date(p.purchaseDate).getMonth() - 3
              )
            ).toISOString(),
            nextScheduled: new Date(
              new Date(p.purchaseDate).setMonth(
                new Date(p.purchaseDate).getMonth() + 3
              )
            ).toISOString(),
            urgentIssues: Math.min(p.tenantCount, 3),
          },
        }));

        setProperties(transformed);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ukendt fejl');
      } finally {
        setLoading(false);
      }
    })();
  }, [token, API_URL]);

  /* ───────────────────────────────────────── derived stats for header ────────────────────── */
  const totalProperties      = properties.length;
  const totalValue           = properties.reduce((s, p) => s + p.purchasePrice, 0);
  const avgYield             =
    properties.reduce((s, p) => s + p.financials.yield, 0) /
    (properties.length || 1);
  const totalMonthlyIncome   = properties.reduce(
    (s, p) => s + p.financials.monthlyIncome,
    0
  );
  const totalMonthlyExpenses = properties.reduce(
    (s, p) => s + p.financials.monthlyExpenses,
    0
  );
  const totalCashFlow        = totalMonthlyIncome - totalMonthlyExpenses;

  /* ───────────────────────────────────────── loading / error ─────────────────────────────── */
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Henter ejendomme…
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-red-800 font-semibold mb-2">Fejl ved hentning</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Prøv igen
          </button>
        </div>
      </div>
    );

  /* ───────────────────────────────────────── render ──────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ───────────── same “Ejendomsportefølje” header used in map view ───────────── */}
      <header className="portfolio-header">
        <div className="header-content">
          <div className="header-main">
            <h1 className="portfolio-title">Ejendomsportefølje</h1>

            <nav className="nav-links">
              <button
                onClick={() => navigate('/')}
                className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
              >
                <Home className="icon-sm" />
                Dashboard
              </button>
              <button
                onClick={() => navigate('/map')}
                className={`nav-link ${currentView === 'map' ? 'active' : ''}`}
              >
                <MapPin className="icon-sm" />
                Kortvisning
              </button>
              <button
                onClick={() => navigate('/properties')}
                className={`nav-link ${currentView === 'list' ? 'active' : ''}`}
              >
                <List className="icon-sm" />
                Ejendomsliste
              </button>
            </nav>
          </div>

          {/* stats cards */}
          <div className="portfolio-stats">
            <div className="stat-card">
              <span className="stat-label">Antal ejendomme</span>
              <span className="stat-value">{totalProperties}</span>
            </div>

            <div className="stat-card highlight-value">
              <span className="stat-label">Porteføljeværdi</span>
              <span className="stat-value">
                {(totalValue / 1_000_000).toLocaleString('da-DK', {
                  maximumFractionDigits: 1,
                })}{' '}
                mio. kr.
              </span>
            </div>

            <div className="stat-card highlight-yield">
              <span className="stat-label">Gns. afkast</span>
              <span className="stat-value">
                {avgYield.toLocaleString('da-DK', { maximumFractionDigits: 1 })}%
              </span>
            </div>

            <div className="stat-card highlight-cashflow">
              <span className="stat-label">Månedlig cash flow</span>
              <span className="stat-value">
                {totalCashFlow.toLocaleString('da-DK')} kr.
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ───────────── property list table ───────────── */}
      <main className="flex-1 p-6 lg:p-10">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th scope="col" className="px-4 py-3">Navn</th>
                <th scope="col" className="px-4 py-3">Adresse</th>
                <th scope="col" className="px-4 py-3">Pris (kr.)</th>
                <th scope="col" className="px-4 py-3">Areal (m²)</th>
                <th scope="col" className="px-4 py-3 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> Indtægt /md.
                </th>
                <th scope="col" className="px-4 py-3 flex items-center gap-1">
                  <Receipt className="w-4 h-4" /> Udgifter /md.
                </th>
                <th scope="col" className="px-4 py-3 flex items-center gap-1">
                  <Percent className="w-4 h-4" /> Afkast
                </th>
                <th scope="col" className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p, i) => (
                <tr
                  key={p.id}
                  className={
                    i % 2 === 0
                      ? 'bg-white'
                      : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                  }
                  onClick={() => navigate(`/property/${p.id}`)}
                >
                  <td className="px-4 py-2 font-medium whitespace-nowrap">{p.name}</td>
                  <td className="px-4 py-2">{p.address}</td>
                  <td className="px-4 py-2">
                    {p.purchasePrice.toLocaleString('da-DK')}
                  </td>
                  <td className="px-4 py-2">{p.squareMeters}</td>
                  <td className="px-4 py-2">
                    {p.financials.monthlyIncome.toLocaleString('da-DK')}
                  </td>
                  <td className="px-4 py-2">
                    {p.financials.monthlyExpenses.toLocaleString('da-DK')}
                  </td>
                  <td className="px-4 py-2">
                    {p.financials.yield.toLocaleString('da-DK', {
                      maximumFractionDigits: 1,
                    })}
                    %
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        p.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {p.status === 'Active' ? 'Aktiv' : 'Ledig'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}