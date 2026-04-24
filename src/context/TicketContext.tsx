import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { buildApiUrl } from "../utils/api";

export interface Ticket {
  id: string;
  source: string;
  destination: string;
  type: string;
  price: number;
  date: string;
  userId?: string;
  expiryTime?: string;
  status?: string;
  driver?: {
    id: string;
    name: string;
    vehicleName?: string;
    vehicleNumber?: string;
    profilePicture?: string;
  } | null;
}

export type DriverRoute = {
  id: string;
  driverId: string;
  source: string;
  destination: string;
  transportType: string;
  isActive: boolean;
  createdAt: string;
};

type RouteAvailabilityResult = {
  available: boolean;
  exactMatches: DriverRoute[];
  nearbyMatches: DriverRoute[];
};

interface TicketContextType {
  tickets: Ticket[];
  addTicket: (ticket: Omit<Ticket, "id">) => Promise<Ticket | undefined>;
  removeTicket: (id: string) => Promise<void>;
  loading: boolean;
  driverRoutes: DriverRoute[];
  addDriverRoute: (route: Omit<DriverRoute, "id" | "isActive" | "createdAt">) => void;
  getRouteAvailability: (params: {
    source: string;
    destination: string;
    transportType?: string;
  }) => RouteAvailabilityResult;
  removeDriverRoute: (id: string) => void;
}

const DRIVER_ROUTES_KEY = "goTicket.driverRoutes";

const normalize = (v: string) =>
  v.toLowerCase().trim().replace(/[^\w\s]/g, "").replace(/\s+/g, " ");

const tokenSet = (v: string) => new Set(normalize(v).split(" ").filter(Boolean));

const overlapScore = (a: string, b: string) => {
  const A = tokenSet(a);
  const B = tokenSet(b);
  let score = 0;
  A.forEach((t) => {
    if (B.has(t)) score++;
  });
  return score;
};

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [driverRoutes, setDriverRoutes] = useState<DriverRoute[]>(
    () => {
      const raw = localStorage.getItem(DRIVER_ROUTES_KEY);
      return raw ? JSON.parse(raw) : [];
    }
  );
  const { user } = useAuth();

  // Load tickets from backend when user changes
  useEffect(() => {
    const fetchTickets = async () => {
      if (user?._id) {
        setLoading(true);
        try {
          const response = await fetch(buildApiUrl(`/api/tickets/${user._id}`));
          if (response.ok) {
            const data = await response.json();
            // Map _id to id for frontend compatibility
            const mappedTickets = data.map((t: any) => ({
              ...t,
              id: t._id,
            }));
            setTickets(mappedTickets);
          }
        } catch (error) {
          console.error("Failed to fetch tickets", error);
        } finally {
          setLoading(false);
        }
      } else {
        setTickets([]);
      }
    };

    fetchTickets();
  }, [user]);

  const addTicket = async (ticketData: Omit<Ticket, "id">): Promise<Ticket | undefined> => {
    if (!user?._id) return;

    try {
      const response = await fetch(buildApiUrl("/api/tickets"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...ticketData,
          userId: user._id,
        }),
      });

      if (response.ok) {
        const newTicket = await response.json();
        const ticketWithId = { ...newTicket, id: newTicket._id };
        setTickets((prev) => [ticketWithId, ...prev]);
        return ticketWithId;
      }
    } catch (error) {
      console.error("Failed to add ticket", error);
      throw error;
    }
  };

  const removeTicket = async (id: string) => {
    try {
      const response = await fetch(buildApiUrl(`/api/tickets/${id}`), {
        method: "DELETE",
      });

      if (response.ok) {
        setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
      }
    } catch (error) {
      console.error("Failed to remove ticket", error);
      throw error;
    }
  };

  const persistRoutes = (next: DriverRoute[]) => {
    setDriverRoutes(next);
    localStorage.setItem(DRIVER_ROUTES_KEY, JSON.stringify(next));
  };

  const addDriverRoute: TicketContextType["addDriverRoute"] = (route) => {
    const nextRoute: DriverRoute = {
      ...route,
      id: crypto.randomUUID(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    persistRoutes([nextRoute, ...driverRoutes]);
  };

  const removeDriverRoute: TicketContextType["removeDriverRoute"] = (id) => {
    const next = driverRoutes.filter((r) => r.id !== id);
    persistRoutes(next);
  };

  const getRouteAvailability: TicketContextType["getRouteAvailability"] = ({
    source,
    destination,
    transportType,
  }) => {
    const s = normalize(source);
    const d = normalize(destination);
    const t = normalize(transportType || "");

    if (!s || !d) return { available: false, exactMatches: [], nearbyMatches: [] };

    const active = driverRoutes.filter((r) => r.isActive);

    const exactMatches = active.filter((r) => {
      const sourceOk = normalize(r.source) === s;
      const destOk = normalize(r.destination) === d;
      const transportOk = !t || normalize(r.transportType) === t;
      return sourceOk && destOk && transportOk;
    });

    if (exactMatches.length > 0) {
      return { available: true, exactMatches, nearbyMatches: [] };
    }

    const nearbyMatches = active
      .map((r) => ({
        route: r,
        score: overlapScore(source, r.source) + overlapScore(destination, r.destination),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.route);

    return { available: false, exactMatches: [], nearbyMatches };
  };

  const value = useMemo<TicketContextType>(
    () => ({
      tickets,
      addTicket,
      removeTicket,
      loading,
      driverRoutes,
      addDriverRoute,
      getRouteAvailability,
      removeDriverRoute,
    }),
    [tickets, loading, driverRoutes]
  );

  return (
    <TicketContext.Provider value={value}>{children}</TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error("useTickets must be used within a TicketProvider");
  }
  return context;
};

// optional compatibility alias (if any old files still use useTicket)
export const useTicket = useTickets;
