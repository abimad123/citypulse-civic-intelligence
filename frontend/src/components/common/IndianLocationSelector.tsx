import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LocateFixed,
  MapPin,
  CheckCircle2,
  Loader2,
  Building2,
  Compass,
  X,
} from 'lucide-react';
import {
  getIndianStates,
  findStateByCodeOrName,
  getDistrictsAndCitiesByState,
  lookupIndianPincode,
  reverseGeocodeCoords,
  deriveMunicipalBody,
  type PincodeLookupResult,
} from '../../services/indiaLocationService';

export interface IndianLocationValue {
  state: string;
  stateIso?: string;
  district: string;
  city: string;
  ward: string;
  pincode: string;
  landmark?: string;
  lat?: number;
  lng?: number;
}

export interface IndianLocationSelectorProps {
  value: IndianLocationValue;
  onChange: (newValue: IndianLocationValue) => void;
  showLiveGps?: boolean;
  showLandmark?: boolean;
  className?: string;
  disabled?: boolean;
}

// Known municipal wards for Ludhiana pilot deployment
const LUDHIANA_DEFAULT_WARDS = [
  'Model Town',
  'Sarabha Nagar',
  'Dugri',
  'Gill Road',
  'Focal Point',
  'Civil Lines',
];

export const IndianLocationSelector: React.FC<IndianLocationSelectorProps> = ({
  value,
  onChange,
  showLiveGps = true,
  showLandmark = true,
  className = '',
  disabled = false,
}) => {
  const [locatingGps, setLocatingGps] = useState(false);
  const [lookingUpPin, setLookingUpPin] = useState(false);
  const [pinVerification, setPinVerification] = useState<PincodeLookupResult | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  // Cached states list
  const allStates = useMemo(() => getIndianStates(), []);

  // Determine current active State ISO
  const currentStateIso = useMemo(() => {
    if (value.stateIso) return value.stateIso;
    const match = findStateByCodeOrName(value.state);
    return match?.isoCode || 'PB';
  }, [value.state, value.stateIso]);

  // Available districts for the selected state
  const availableDistricts = useMemo(() => {
    return getDistrictsAndCitiesByState(currentStateIso);
  }, [currentStateIso]);

  // Keep track of the last looked-up PIN to prevent duplicate API calls
  const lastLookedUpPinRef = useRef<string>('');

  // Auto-verify PIN code on 6 valid digits
  useEffect(() => {
    const cleanPin = (value.pincode || '').trim();
    if (/^[1-9][0-9]{5}$/.test(cleanPin)) {
      if (lastLookedUpPinRef.current === cleanPin) return;
      lastLookedUpPinRef.current = cleanPin;

      let isCurrent = true;
      setLookingUpPin(true);

      lookupIndianPincode(cleanPin).then((res) => {
        if (!isCurrent) return;
        setLookingUpPin(false);
        if (res) {
          setPinVerification(res);

          const matchedState = findStateByCodeOrName(res.stateName);
          const newState = matchedState?.name || res.stateName || value.state;
          const newIso = matchedState?.isoCode || value.stateIso;

          // Resolve accurate municipal corporation / body from PIN result
          const resolvedCity = deriveMunicipalBody(res.district, res.block || res.taluk);

          // Select first post office if available, otherwise clear stale ward
          const updatedWard = res.postOffices.length > 0 ? res.postOffices[0] : '';

          onChange({
            ...value,
            state: newState,
            stateIso: newIso,
            district: res.district,
            city: resolvedCity,
            ward: updatedWard,
            pincode: cleanPin,
          });
        } else {
          setPinVerification(null);
        }
      });

      return () => {
        isCurrent = false;
      };
    } else {
      setPinVerification(null);
      lastLookedUpPinRef.current = '';
    }
  }, [value.pincode]);

  // Handle State selection change - reset stale district, city, ward, and pincode
  const handleStateChange = (newIso: string) => {
    const selected = allStates.find((s) => s.isoCode === newIso);
    if (!selected) return;

    const newLat = selected.latitude ? parseFloat(selected.latitude) : value.lat;
    const newLng = selected.longitude ? parseFloat(selected.longitude) : value.lng;

    setPinVerification(null);
    lastLookedUpPinRef.current = '';

    onChange({
      ...value,
      state: selected.name,
      stateIso: selected.isoCode,
      district: '',
      city: '',
      ward: '',
      pincode: '',
      lat: newLat,
      lng: newLng,
    });
  };

  // Handle District change - automatically derive municipal body and clear previous ward
  const handleDistrictChange = (newDistrict: string) => {
    const resolvedCity = newDistrict ? deriveMunicipalBody(newDistrict) : '';
    onChange({
      ...value,
      district: newDistrict,
      city: resolvedCity,
      ward: '',
    });
  };

  // Handle GPS location capture
  const handleCaptureLiveGps = () => {
    if (!navigator.geolocation) {
      alert('Browser geolocation is not supported on this device.');
      return;
    }

    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy || 5.0;
        setGpsAccuracy(accuracy);

        try {
          const rev = await reverseGeocodeCoords(lat, lng);
          setLocatingGps(false);

          if (rev) {
            const matchedState = findStateByCodeOrName(rev.state || value.state);
            const newState = matchedState?.name || value.state;
            const newIso = matchedState?.isoCode || value.stateIso;

            onChange({
              ...value,
              state: newState,
              stateIso: newIso,
              district: rev.district || value.district,
              city: rev.city || deriveMunicipalBody(rev.district || value.district),
              ward: rev.ward || value.ward,
              pincode: rev.pincode || value.pincode,
              lat,
              lng,
            });
          } else {
            onChange({
              ...value,
              lat,
              lng,
            });
          }
        } catch {
          setLocatingGps(false);
          onChange({
            ...value,
            lat,
            lng,
          });
        }
      },
      () => {
        setLocatingGps(false);
        // Fallback default coordinates (Ludhiana center)
        onChange({
          ...value,
          lat: value.lat || 30.901,
          lng: value.lng || 75.8573,
        });
        setGpsAccuracy(10.0);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Quick suggestion list for Ward / Locality
  const localitySuggestions = useMemo(() => {
    const list: string[] = [];
    if (pinVerification?.postOffices) {
      list.push(...pinVerification.postOffices);
    }
    if (value.district.toLowerCase().includes('ludhiana')) {
      for (const w of LUDHIANA_DEFAULT_WARDS) {
        if (!list.includes(w)) list.push(w);
      }
    }
    return list;
  }, [pinVerification, value.district]);

  return (
    <div className={`space-y-4 antialiased text-[#0F1B2A] ${className}`}>
      {/* Top GPS Action & Coordinate Readout Bar */}
      {showLiveGps && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-[#DDE3EA] bg-[#F5F7FA]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCaptureLiveGps}
              disabled={disabled || locatingGps}
              className="flex items-center gap-2 rounded-lg bg-[#1F4FE0] hover:bg-[#1840B8] active:bg-[#14338F] px-3.5 py-2 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {locatingGps ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" strokeWidth={2} />
              ) : (
                <LocateFixed className="w-4 h-4 text-white" strokeWidth={2} />
              )}
              <span>{locatingGps ? 'Locating GPS Satellite...' : 'Share Live GPS Location'}</span>
            </button>
            <span className="text-[11px] text-[#5B6B7C] hidden sm:inline">
              Auto-fills State, District & PIN Code
            </span>
          </div>

          {/* Coordinate Readout */}
          <div className="flex items-center gap-2 text-xs">
            <Compass className="w-3.5 h-3.5 text-[#5B6B7C]" strokeWidth={1.75} />
            <span className="cp-mono tabular-nums font-semibold text-[#0F1B2A]">
              {value.lat !== undefined && value.lng !== undefined
                ? `${Math.abs(value.lat).toFixed(4)}° ${value.lat >= 0 ? 'N' : 'S'}, ${Math.abs(
                    value.lng
                  ).toFixed(4)}° ${value.lng >= 0 ? 'E' : 'W'}`
                : '30.9010° N, 75.8573° E'}
            </span>
            {gpsAccuracy !== null && (
              <span className="inline-flex items-center rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 cp-mono">
                ± {gpsAccuracy.toFixed(1)}m
              </span>
            )}
          </div>
        </div>
      )}

      {/* Grid: PIN Code & Verified Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
        <div className="sm:col-span-5">
          <label className="block text-xs font-bold text-[#0F1B2A] mb-1.5">
            6-Digit Postal PIN Code
          </label>
          <div className="relative">
            <input
              type="text"
              maxLength={6}
              inputMode="numeric"
              value={value.pincode || ''}
              onChange={(e) =>
                onChange({ ...value, pincode: e.target.value.replace(/\D/g, '') })
              }
              placeholder="e.g. 141002"
              disabled={disabled}
              className="w-full rounded-xl border border-[#CBD3DD] px-3.5 py-2 text-xs cp-mono tabular-nums font-medium text-[#0F1B2A] bg-white focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0] focus:outline-none transition-all placeholder:text-[#7A8999]"
            />
            {lookingUpPin && (
              <div className="absolute right-3 top-2.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1F4FE0]" />
              </div>
            )}
          </div>
        </div>

        {/* India Post Verification Banner */}
        <div className="sm:col-span-7 flex items-end">
          {pinVerification ? (
            <div className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-[#1E9E6A] shrink-0" strokeWidth={2} />
              <div className="truncate">
                <span className="font-bold">India Post Verified</span> •{' '}
                <span className="font-mono">{pinVerification.district}</span>,{' '}
                <span>{pinVerification.stateName}</span>
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F5F7FA] border border-[#E3E8EE] text-[11px] text-[#5B6B7C]">
              <MapPin className="w-3.5 h-3.5 text-[#7A8999] shrink-0" strokeWidth={1.75} />
              <span>Enter 6 digits for instant India Post postal verification</span>
            </div>
          )}
        </div>
      </div>

      {/* Row 1: State / UT and District Cascading Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-bold text-[#0F1B2A] mb-1.5">
            State / Union Territory
          </label>
          <select
            value={currentStateIso}
            onChange={(e) => handleStateChange(e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border border-[#CBD3DD] px-3.5 py-2 text-xs text-[#0F1B2A] bg-white focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0] focus:outline-none transition-all cursor-pointer"
          >
            {allStates.map((st) => (
              <option key={st.isoCode} value={st.isoCode}>
                {st.name} ({st.isoCode})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0F1B2A] mb-1.5">
            District / Division
          </label>
          <select
            value={value.district || ''}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border border-[#CBD3DD] px-3.5 py-2 text-xs text-[#0F1B2A] bg-white focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0] focus:outline-none transition-all cursor-pointer"
          >
            {availableDistricts.length === 0 ? (
              <option value="">Select District</option>
            ) : (
              availableDistricts.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Row 2: City / Municipal Area and Ward / Locality */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-bold text-[#0F1B2A] mb-1.5">
            City / Municipal Corporation
          </label>
          <div className="relative">
            <input
              type="text"
              list="city-corporation-options"
              value={value.city || ''}
              onChange={(e) => onChange({ ...value, city: e.target.value })}
              placeholder="e.g. Kollam Municipal Corporation"
              disabled={disabled}
              className="w-full rounded-xl border border-[#CBD3DD] pl-3.5 pr-8 py-2 text-xs text-[#0F1B2A] bg-white focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0] focus:outline-none transition-all"
            />
            {value.city && !disabled ? (
              <button
                type="button"
                onClick={() => onChange({ ...value, city: '' })}
                title="Clear city"
                className="absolute right-2.5 top-2 p-0.5 text-[#7A8999] hover:text-[#0F1B2A] transition-colors cursor-pointer rounded"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            ) : (
              <Building2 className="w-3.5 h-3.5 text-[#7A8999] absolute right-3 top-2.5 pointer-events-none" />
            )}
          </div>
          <datalist id="city-corporation-options">
            {availableDistricts.map((d) => (
              <option key={d.name} value={`${d.name} Municipal Corporation`} />
            ))}
            {availableDistricts.map((d) => (
              <option key={`city-${d.name}`} value={d.name} />
            ))}
          </datalist>

          {/* Quick city fill pill if available */}
          {value.district && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="text-[10px] text-[#7A8999]">Quick fill:</span>
              <button
                type="button"
                onClick={() => onChange({ ...value, city: deriveMunicipalBody(value.district) })}
                className="text-[10px] px-2 py-0.5 rounded-md border border-[#E3E8EE] bg-[#F5F7FA] text-[#5B6B7C] hover:text-[#0F1B2A] transition-colors cursor-pointer"
              >
                {deriveMunicipalBody(value.district)}
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0F1B2A] mb-1.5">
            Ward / Locality / Post Office
          </label>
          <input
            type="text"
            list="ward-locality-options"
            value={value.ward || ''}
            onChange={(e) => onChange({ ...value, ward: e.target.value })}
            placeholder="e.g. Model Town, Ward 34"
            disabled={disabled}
            className="w-full rounded-xl border border-[#CBD3DD] px-3.5 py-2 text-xs text-[#0F1B2A] bg-white focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0] focus:outline-none transition-all"
          />
          <datalist id="ward-locality-options">
            {localitySuggestions.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>

          {/* Quick Locality Suggestion Pills */}
          {localitySuggestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="text-[10px] text-[#7A8999]">Suggestions:</span>
              {localitySuggestions.slice(0, 4).map((loc) => (
                <button
                  type="button"
                  key={loc}
                  onClick={() => onChange({ ...value, ward: loc })}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    value.ward === loc
                      ? 'bg-[#1F4FE0]/10 text-[#1F4FE0] border-[#1F4FE0]/30 font-semibold'
                      : 'bg-[#F5F7FA] text-[#5B6B7C] border-[#E3E8EE] hover:text-[#0F1B2A]'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Nearby Landmark / Street (Optional) */}
      {showLandmark && (
        <div>
          <label className="block text-xs font-bold text-[#0F1B2A] mb-1.5">
            Street Address & Landmark Detail
          </label>
          <input
            type="text"
            value={value.landmark || ''}
            onChange={(e) => onChange({ ...value, landmark: e.target.value })}
            placeholder="e.g. Near Gol Market Chowk, opposite SBI Branch, Gate 2"
            disabled={disabled}
            className="w-full rounded-xl border border-[#CBD3DD] px-3.5 py-2 text-xs text-[#0F1B2A] bg-white focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0] focus:outline-none transition-all placeholder:text-[#7A8999]"
          />
        </div>
      )}
    </div>
  );
};
