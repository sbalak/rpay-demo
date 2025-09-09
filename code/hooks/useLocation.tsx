import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as Location from "expo-location";
import { useAuth } from "./useAuth";
import httpClient from "@/lib/httpClient";
import { log } from "@/utils/logger";

const initialState = {
  locationState: { locality: null, latitude: null, longitude: null },
  setLocality: async (_?: {
    latitude: string;
    longitude: string;
    city: string;
  }) => {},
};

type LocationContextType = {
  locationState: {
    locality: string | null;
    latitude: string | null;
    longitude: string | null;
  };
  setLocality: (data?: {
    latitude: string;
    longitude: string;
    city: string;
  }) => Promise<any>;
};

const LocationContext = createContext<LocationContextType>(initialState);

interface Props extends PropsWithChildren {}

const LocationProvider: React.FC<Props> = ({ children }) => {
  const { authState } = useAuth();
  const [locationState, setLocationState] = useState<{
    locality: string | null;
    latitude: string | null;
    longitude: string | null;
  }>({ locality: "Loading...", latitude: null, longitude: null });

  useEffect(() => {
    const loadLocality = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status != "granted") {
        // Please grant location permissions
        return;
      }

      log.debug(
        "useLocation.tsx/useEffect(): Location Permission Status: " + status
      );

      await setLocality();
    };
    loadLocality();
  }, []);

  const setLocality = useCallback(
    async (data?: { latitude: string; longitude: string; city: string }) => {
      try {
        if (data) {
          // Manually set from saved address
          setLocationState({
            locality: data.city,
            latitude: data.latitude,
            longitude: data.longitude,
          });

          // Only call SetCoordinates API if user is authenticated
          if (authState.authenticated && authState.userId) {
            const response = await httpClient.post(
              `/customer/SetCoordinates?customerId=${authState.userId}&latitude=${data.latitude}&longitude=${data.longitude}&city=${data.city}`
            );

            log.debug("useLocation.tsx/setLocality(): SetCoordinates API response: " + JSON.stringify(response));
            return response;
          }
          return;
        }

        let geocode = await Location.getLastKnownPositionAsync({
          maxAge: 60000, // Accept positions up to 1 minute old
        });

        if (!geocode) {
          geocode = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced, // Faster than High accuracy
            timeInterval: 5000, // Update every 5 seconds
            distanceInterval: 10, // Update every 10 meters
          });
        }

        log.debug(
          "useLocation.tsx/setLocality(): Geocode: " + JSON.stringify(geocode)
        );

        let address = await Location.reverseGeocodeAsync({
          longitude: geocode.coords.longitude,
          latitude: geocode.coords.latitude,
        });
        log.debug(
          "useLocation.tsx/setLocality(): Address: " + JSON.stringify(address)
        );

        // Set location state first (works for both authenticated and non-authenticated users)
        setLocationState({
          locality: address[0]?.district
            ? address[0]?.district
            : address[0]?.street,
          latitude: String(geocode.coords.latitude),
          longitude: String(geocode.coords.longitude),
        });

        // Only call SetCoordinates API if user is authenticated
        if (authState.authenticated && authState.userId) {
          const response = await httpClient.post(
            `/customer/SetCoordinates?customerId=${authState.userId}&latitude=${geocode.coords.latitude}&longitude=${geocode.coords.longitude}&city=${address[0].city}`
          );
          return response;
        }
      } 
      catch (error) {
        log.error("useLocation.tsx/setLocality(): Error setting location: " + error);
      }
    },
    [authState.authenticated, authState.userId]
  );

  return (
    <LocationContext.Provider value={{ locationState, setLocality }}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationProvider;

export const useLocation = () => {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error(
      "useLocation can be accessible only within the LocationProvider"
    );
  }

  return context;
};
