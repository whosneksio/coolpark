'use client';

import { useCallback, useEffect, useState } from 'react';

interface Spot {
  id: string;
  label: string;
  isAvailable: boolean;
}

interface ParkingMap {
  id: string;
  name: string;
  location: string;
  totalSpots: number;
  freeSpots: number;
  spots: Spot[];
}

export default function AdminPage() {
  const [maps, setMaps] = useState<ParkingMap[]>([]);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formularz nowego parkingu
  const [newMapName, setNewMapName] = useState('');
  const [newMapLocation, setNewMapLocation] = useState('');
  const [isCreatingMap, setIsCreatingMap] = useState(false);

  // Formularz dodawania miejsc
  const [spotLabels, setSpotLabels] = useState('');
  const [isAddingSpots, setIsAddingSpots] = useState(false);

  const loadMaps = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/parking-maps');
      const data = await res.json();
      if (res.ok && data.maps) {
        setMaps(data.maps);
        setSelectedMapId((prev) => prev ?? (data.maps.length > 0 ? data.maps[0].id : null));
      } else {
        setError(data.message || 'Nie udało się pobrać parkingów.');
      }
    } catch {
      setError('Błąd połączenia z serwerem.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch('/api/admin/parking-maps')
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return;
        if (data.maps) {
          setMaps(data.maps);
          setSelectedMapId((prev) => prev ?? (data.maps.length > 0 ? data.maps[0].id : null));
        } else {
          setError(data.message || 'Nie udało się pobrać parkingów.');
        }
      })
      .catch(() => {
        if (!ignore) setError('Błąd połączenia z serwerem.');
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function handleCreateMap(e: React.FormEvent) {
    e.preventDefault();
    if (!newMapName.trim() || !newMapLocation.trim()) return;

    setIsCreatingMap(true);
    try {
      const res = await fetch('/api/admin/parking-maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newMapName, location: newMapLocation }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewMapName('');
        setNewMapLocation('');
        await loadMaps();
        if (data.map?.id) setSelectedMapId(data.map.id);
      } else {
        alert(data.message || 'Błąd dodawania parkingu');
      }
    } finally {
      setIsCreatingMap(false);
    }
  }

  async function handleAddSpots(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMapId || !spotLabels.trim()) return;

    const labels = spotLabels
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (labels.length === 0) return;

    setIsAddingSpots(true);
    try {
      const res = await fetch('/api/admin/parking-spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parkingMapId: selectedMapId, labels }),
      });
      const data = await res.json();
      if (res.ok) {
        setSpotLabels('');
        await loadMaps();
      } else {
        alert(data.message || 'Błąd dodawania miejsc (np. etykieta już istnieje)');
      }
    } finally {
      setIsAddingSpots(false);
    }
  }

  async function toggleSpotAvailability(spotId: string, currentStatus: boolean) {
    try {
      const res = await fetch(`/api/admin/parking-spots/${spotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      });
      if (res.ok) {
        await loadMaps();
      } else {
        const data = await res.json();
        alert(data.message || 'Błąd aktualizacji statusu miejsca');
      }
    } catch {
      alert('Błąd połączenia');
    }
  }

  async function handleDeleteSpot(spotId: string) {
    if (!confirm('Czy na pewno chcesz usunąć to miejsce parkingowe?')) return;
    try {
      const res = await fetch(`/api/admin/parking-spots/${spotId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadMaps();
      } else {
        const data = await res.json();
        alert(data.message || 'Błąd usuwania miejsca');
      }
    } catch {
      alert('Błąd połączenia');
    }
  }

  const selectedMap = maps.find((m) => m.id === selectedMapId);

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Formularz dodawania nowego parkingu */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Dodaj nowy parking
        </h2>
        <form onSubmit={handleCreateMap} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Nazwa parkingu
            </label>
            <input
              type="text"
              required
              value={newMapName}
              onChange={(e) => setNewMapName(e.target.value)}
              placeholder="np. Galeria Centrum - Poziom -1"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Lokalizacja / Adres
            </label>
            <input
              type="text"
              required
              value={newMapLocation}
              onChange={(e) => setNewMapLocation(e.target.value)}
              placeholder="np. ul. Marszałkowska 10, Warszawa"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isCreatingMap}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {isCreatingMap ? 'Tworzenie...' : '+ Utwórz parking'}
            </button>
          </div>
        </form>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-zinc-500">Ładowanie parkingów...</div>
      ) : maps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          Brak parkingów w bazie. Utwórz pierwszy parking powyżej!
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista parkingów (lewa kolumna) */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
              Dostępne Parkingi ({maps.length})
            </h3>
            <div className="space-y-2">
              {maps.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMapId(m.id)}
                  className={`w-full text-left rounded-xl p-4 border transition-all ${
                    selectedMapId === m.id
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{m.name}</span>
                    <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {m.freeSpots}/{m.totalSpots} wolnych
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{m.location}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Szczegóły wybranego parkingu i miejsca (prawa kolumna) */}
          {selectedMap && (
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-800 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                      {selectedMap.name}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{selectedMap.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      Wolne: {selectedMap.freeSpots}
                    </span>
                    <span className="rounded-lg bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      Łącznie: {selectedMap.totalSpots}
                    </span>
                  </div>
                </div>

                {/* Formularz dodawania miejsc */}
                <form onSubmit={handleAddSpots} className="mt-6 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={spotLabels}
                      onChange={(e) => setSpotLabels(e.target.value)}
                      placeholder="Etykiety miejsc, np: A-01, A-02, A-03"
                      className="w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-sm text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                    />
                    <span className="text-[11px] text-zinc-400 mt-1 block">
                      Wpisz etykiety oddzielone przecinkami, aby dodać wiele miejsc naraz.
                    </span>
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={isAddingSpots || !spotLabels.trim()}
                      className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
                    >
                      {isAddingSpots ? 'Dodawanie...' : '+ Dodaj miejsca'}
                    </button>
                  </div>
                </form>

                {/* Siatka miejsc parkingowych */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Siatka miejsc ({selectedMap.spots?.length ?? 0})
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Dostępne
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Zablokowane
                      </span>
                    </div>
                  </div>

                  {!selectedMap.spots || selectedMap.spots.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-400 dark:border-zinc-800">
                      Ten parking nie ma jeszcze dodanych żadnych miejsc. Użyj pola powyżej.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {selectedMap.spots.map((spot) => (
                        <div
                          key={spot.id}
                          className={`relative group flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                            spot.isAvailable
                              ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-300'
                              : 'border-red-200 bg-red-50/40 text-red-950 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300'
                          }`}
                        >
                          <span className="font-bold text-sm tracking-wide">{spot.label}</span>
                          <span className="text-[10px] mt-0.5 opacity-75">
                            {spot.isAvailable ? 'Wolne' : 'Zajęte'}
                          </span>

                          {/* Akcje pod hoverem */}
                          <div className="mt-2 flex items-center gap-1.5">
                            <button
                              onClick={() => toggleSpotAvailability(spot.id, spot.isAvailable)}
                              title={spot.isAvailable ? 'Oznacz jako niedostępne' : 'Oznacz jako dostępne'}
                              className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-white/80 dark:bg-black/40 border border-zinc-200 dark:border-zinc-700 hover:scale-105 transition"
                            >
                              {spot.isAvailable ? 'Blokuj' : 'Odblokuj'}
                            </button>
                            <button
                              onClick={() => handleDeleteSpot(spot.id)}
                              title="Usuń miejsce"
                              className="rounded px-1 py-0.5 text-[10px] text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
