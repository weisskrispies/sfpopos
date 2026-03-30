"use client";

import { useState, useMemo } from "react";
import { poposData, POPOS } from "@/data/popos";
import { useSavedPopos, useUserLocation, useSearch, useAuth } from "@/lib/hooks";
import { filterPopos } from "@/lib/utils";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import POPOSCard from "@/components/POPOSCard";
import POPOSDetail from "@/components/POPOSDetail";
import LoginModal from "@/components/LoginModal";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <p className="text-[var(--muted)]">Loading map...</p>
    </div>
  ),
});

export default function Home() {
  const [activeView, setActiveView] = useState<"list" | "map">("list");
  const [selectedPopos, setSelectedPopos] = useState<POPOS | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  const { saved, visited, toggleSaved, toggleVisited } = useSavedPopos();
  const { location } = useUserLocation();
  const { user, loginWithGoogle, loginWithEmail, logout, googleAvailable } = useAuth();
  const search = useSearch();

  const handleToggleSaved = (id: string) => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    toggleSaved(id);
  };

  const handleToggleVisited = (id: string) => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    toggleVisited(id);
  };

  const filteredSpaces = useMemo(
    () =>
      filterPopos(
        poposData,
        search.query,
        search.selectedType,
        search.selectedNeighborhood,
        saved,
        visited,
        search.showSavedOnly,
        search.showVisitedOnly
      ),
    [
      search.query,
      search.selectedType,
      search.selectedNeighborhood,
      saved,
      visited,
      search.showSavedOnly,
      search.showVisitedOnly,
    ]
  );

  return (
    <div className="h-full flex flex-col">
      <Header
        user={user}
        onLoginClick={() => setShowLogin(true)}
        onLogout={logout}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {activeView === "list" ? (
        <>
          <SearchBar
            query={search.query}
            onQueryChange={search.setQuery}
            selectedType={search.selectedType}
            onTypeChange={search.setSelectedType}
            selectedNeighborhood={search.selectedNeighborhood}
            onNeighborhoodChange={search.setSelectedNeighborhood}
            showSavedOnly={search.showSavedOnly}
            onShowSavedOnly={search.setShowSavedOnly}
            showVisitedOnly={search.showVisitedOnly}
            onShowVisitedOnly={search.setShowVisitedOnly}
            resultCount={filteredSpaces.length}
          />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              {filteredSpaces.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-5xl mb-4">🔍</p>
                  <p className="text-lg font-medium">No spaces found</p>
                  <p className="text-sm text-[var(--muted)] mt-1">
                    Try adjusting your search or filters
                  </p>
                  <button
                    onClick={search.reset}
                    className="mt-4 px-4 py-2 text-sm text-[var(--primary)] font-medium hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
                  {filteredSpaces.map((popos) => (
                    <POPOSCard
                      key={popos.id}
                      popos={popos}
                      isSaved={saved.has(popos.id)}
                      isVisited={visited.has(popos.id)}
                      onToggleSaved={() => handleToggleSaved(popos.id)}
                      onToggleVisited={() => handleToggleVisited(popos.id)}
                      onClick={() => setSelectedPopos(popos)}
                      userLocation={location}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </>
      ) : (
        <div className="flex-1 relative">
          <MapView
            spaces={filteredSpaces}
            saved={saved}
            visited={visited}
            userLocation={location}
            onSelectSpace={setSelectedPopos}
          />
        </div>
      )}

      {/* Detail modal */}
      {selectedPopos && (
        <POPOSDetail
          popos={selectedPopos}
          isSaved={saved.has(selectedPopos.id)}
          isVisited={visited.has(selectedPopos.id)}
          onToggleSaved={() => handleToggleSaved(selectedPopos.id)}
          onToggleVisited={() => handleToggleVisited(selectedPopos.id)}
          onClose={() => setSelectedPopos(null)}
          userLocation={location}
        />
      )}

      {/* Login modal */}
      {showLogin && (
        <LoginModal
          onLoginWithGoogle={loginWithGoogle}
          onLoginWithEmail={loginWithEmail}
          googleAvailable={googleAvailable}
          onClose={() => setShowLogin(false)}
        />
      )}
    </div>
  );
}
