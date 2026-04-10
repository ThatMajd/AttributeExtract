import { useEffect, useMemo, useState } from 'react';
import { Eye, List, MapPinned, PackageCheck, Settings2, Star } from 'lucide-react';
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import { getMappedBranches, sortAvailabilityBranches } from '../../lib/traklin/branches';
import { getPreferredBranchId, setPreferredBranchId } from '../../lib/traklin/branchPreference';
import { fetchProductAvailability } from '../../lib/traklin/api';
import type { AvailabilityStatus, ProductBranchAvailability } from '../../lib/traklin/types';

type AvailabilityView = 'map' | 'list';

const ISRAEL_BOUNDS: LatLngBoundsExpression = [
  [29.35, 34.15],
  [33.45, 35.95]
];

export function ProductAvailabilitySection({ productId }: { productId: string }) {
  const [view, setView] = useState<AvailabilityView>('map');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<ProductBranchAvailability[]>([]);
  const [preferredBranchId, setPreferredBranchIdState] = useState<number | null>(() => getPreferredBranchId());

  useEffect(() => {
    let isCancelled = false;

    async function loadAvailability() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProductAvailability(productId);

        if (!isCancelled) {
          setBranches(data.branches);
        }
      } catch {
        if (!isCancelled) {
          setError('לא הצלחנו לטעון זמינות סניפים כרגע.');
          setBranches([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadAvailability();

    return () => {
      isCancelled = true;
    };
  }, [productId]);

  const sortedBranches = useMemo(
    () => sortAvailabilityBranches(branches, preferredBranchId),
    [branches, preferredBranchId]
  );

  const mappedBranches = useMemo(() => {
    const availabilityMap = new Map(branches.map(branch => [branch.branchId, branch]));

    return getMappedBranches().flatMap(branch => {
      const availability = availabilityMap.get(branch.id);

      if (!availability || branch.lat === undefined || branch.lng === undefined) {
        return [];
      }

      return [
        {
          ...branch,
          availability
        }
      ];
    });
  }, [branches]);

  const preferredBranch = preferredBranchId !== null
    ? branches.find(branch => branch.branchId === preferredBranchId) ?? null
    : null;

  const handleSetPreferredBranch = (branchId: number) => {
    setPreferredBranchId(branchId);
    setPreferredBranchIdState(branchId);
  };

  return (
    <section className="detail-card availability-section">
      <div className="section-heading section-heading-spread">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PackageCheck size={18} />
          <h2>זמינות בסניפים</h2>
        </div>
        <div className="availability-view-toggle" role="tablist" aria-label="תצוגת זמינות">
          <button
            type="button"
            className={view === 'map' ? 'is-active' : ''}
            onClick={() => setView('map')}
            aria-pressed={view === 'map'}
          >
            <MapPinned size={16} />
            מפה
          </button>
          <button
            type="button"
            className={view === 'list' ? 'is-active' : ''}
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
          >
            <List size={16} />
            רשימה
          </button>
        </div>
      </div>

      <div className="availability-toolbar">
        {preferredBranch ? (
          <div className="preferred-branch-pill">
            <Star size={14} />
            סניף מועדף: {preferredBranch.branchName} ({preferredBranch.branchId})
          </div>
        ) : (
          <div className="availability-note-inline">בחר סניף מועדף מהמפה או מהרשימה כדי להדגיש אותו בהמשך.</div>
        )}
      </div>

      <div className="availability-settings">
        <div className="availability-settings-title">
          <Settings2 size={16} />
          <span>הגדרות זמינות</span>
        </div>
        <label className="availability-settings-control">
          <span>סניף מועדף</span>
          <select
            value={preferredBranchId ?? ''}
            onChange={event => {
              const nextBranchId = Number(event.target.value);
              if (!Number.isNaN(nextBranchId) && nextBranchId > 0) {
                handleSetPreferredBranch(nextBranchId);
              }
            }}
          >
            <option value="" disabled>בחר סניף</option>
            {sortAvailabilityBranches(branches, null).map(branch => (
              <option key={branch.branchId} value={branch.branchId}>
                {branch.branchName} ({branch.branchId})
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <div className="availability-state">
          <div className="spinner" />
          <span>טוענים זמינות סניפים...</span>
        </div>
      ) : error ? (
        <div className="availability-state error">
          <span>{error}</span>
        </div>
      ) : branches.length === 0 ? (
        <div className="availability-state">
          <span>לא התקבלו נתוני זמינות עבור המוצר הזה.</span>
        </div>
      ) : view === 'map' ? (
        <div className="availability-map-shell">
          <MapLegend />
          <div className="availability-map-frame">
            <MapContainer
              bounds={ISRAEL_BOUNDS}
              scrollWheelZoom
              className="availability-leaflet-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
              />

              {mappedBranches.map(branch => {
                const isPreferred = preferredBranchId === branch.id;

                return (
                  <CircleMarker
                    key={branch.id}
                    center={[branch.lat!, branch.lng!]}
                    radius={isPreferred ? 10 : 7}
                    pathOptions={{
                      color: getDisplayStrokeColor(branch.availability.displayAvailable),
                      fillColor: getPickupFillColor(branch.availability.pickupImmediate),
                      fillOpacity: 0.92,
                      weight: isPreferred ? 4 : 2
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -12]} opacity={1}>
                      {branch.name}
                    </Tooltip>
                    <Popup offset={[0, -10]}>
                      <div className="map-popup">
                        <strong>{branch.name}</strong>
                        <span>מזהה סניף: {branch.id}</span>
                        <div className="map-popup-statuses">
                          <IconStatusBadge icon={<PackageCheck size={14} />} status={branch.availability.pickupImmediate} label="איסוף" />
                          <IconStatusBadge icon={<Eye size={14} />} status={branch.availability.displayAvailable} label="תצוגה" />
                        </div>
                        {isPreferred && <span className="map-popup-preferred">הסניף המועדף</span>}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      ) : (
        <div className="availability-list-shell">
          <ListLegend />
          <div className="availability-table-header">
            <span>מזהה</span>
            <span>סניף</span>
            <span aria-label="איסוף עצמי">
              <PackageCheck size={16} />
            </span>
            <span aria-label="תצוגה">
              <Eye size={16} />
            </span>
          </div>

          <div className="availability-list">
            {sortedBranches.map(branch => {
              return (
                <div
                  key={branch.branchId}
                  className={`availability-list-row ${branch.branchId === preferredBranchId ? 'is-preferred' : ''}`}
                >
                  <span className="availability-branch-id">{branch.branchId}</span>
                  <span className="availability-branch-name">{branch.branchName}</span>
                  <span className="availability-icon-cell">
                    <IconStatusBadge icon={<PackageCheck size={16} />} status={branch.pickupImmediate} label="איסוף עצמי" />
                  </span>
                  <span className="availability-icon-cell">
                    <IconStatusBadge icon={<Eye size={16} />} status={branch.displayAvailable} label="תצוגה" />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function MapLegend() {
  return (
    <div className="availability-legend">
      <div className="availability-legend-icons map-legend-grid">
        <MapLegendMarker
          fillStatus="available"
          strokeStatus="available"
          label="איסוף זמין + תצוגה זמינה"
        />
        <MapLegendMarker
          fillStatus="available"
          strokeStatus="unavailable"
          label="איסוף זמין + ללא תצוגה"
        />
        <MapLegendMarker
          fillStatus="unavailable"
          strokeStatus="available"
          label="ללא איסוף + תצוגה זמינה"
        />
        <MapLegendMarker
          fillStatus="unavailable"
          strokeStatus="unavailable"
          label="ללא איסוף + ללא תצוגה"
        />
      </div>
    </div>
  );
}

function ListLegend() {
  return (
    <div className="availability-legend">
      <div className="availability-legend-icons">
        <span className="availability-legend-item">
          <PackageCheck size={15} />
          איסוף עצמי
        </span>
        <span className="availability-legend-item">
          <Eye size={15} />
          תצוגה
        </span>
      </div>
    </div>
  );
}

function MapLegendMarker({
  fillStatus,
  strokeStatus,
  label
}: {
  fillStatus: AvailabilityStatus;
  strokeStatus: AvailabilityStatus;
  label: string;
}) {
  return (
    <span className="availability-legend-item">
      <span
        className="map-legend-marker"
        style={{
          backgroundColor: getPickupFillColor(fillStatus),
          borderColor: getDisplayStrokeColor(strokeStatus)
        }}
      />
      {label}
    </span>
  );
}

function IconStatusBadge({
  icon,
  status,
  label
}: {
  icon: React.ReactNode;
  status: AvailabilityStatus;
  label: string;
}) {
  return (
    <span className={`availability-icon-badge status-${status}`} title={`${label}: ${getAvailabilityLabel(status)}`}>
      {icon}
    </span>
  );
}

function getAvailabilityLabel(status: AvailabilityStatus) {
  if (status === 'available') return 'זמין';
  if (status === 'unavailable') return 'לא זמין';
  return 'לא ידוע';
}

function getPickupFillColor(status: AvailabilityStatus) {
  if (status === 'available') return '#8caf29';
  if (status === 'unavailable') return '#737880';
  return '#5672dd';
}

function getDisplayStrokeColor(status: AvailabilityStatus) {
  if (status === 'available') return '#0f9d7a';
  if (status === 'unavailable') return '#1b2340';
  return '#5672dd';
}
