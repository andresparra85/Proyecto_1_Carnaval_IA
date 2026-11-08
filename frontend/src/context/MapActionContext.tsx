import React, { createContext, useContext, useState, useCallback } from 'react';

export type MapActionType = 'FLY_TO' | 'SHOW_SENDA' | 'FILTER_POIS' | 'DRAW_ROUTE' | 'CLEAR';

export interface MapCommand {
  actionType: MapActionType;
  payload?: any;
  timestamp: number;
}

export interface MapActionContextType {
  mapCommand: MapCommand | null;
  dispatchMapCommand: (command: { actionType: MapActionType; payload?: any }) => void;
  clearMapCommand: () => void;
}

export const MapActionContext = createContext<MapActionContextType | undefined>(undefined);

export const MapActionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mapCommand, setMapCommand] = useState<MapCommand | null>(null);

  const dispatchMapCommand = useCallback((command: { actionType: MapActionType; payload?: any }) => {
    const fullCommand: MapCommand = {
      actionType: command.actionType,
      payload: command.payload,
      timestamp: Date.now(),
    };
    setMapCommand(fullCommand);

    // Emisión de evento global en window para sincronización omnicanal (Leaflet, GuaneñaBot, Modales)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('carnavalia-map-command', { detail: fullCommand }));
      window.dispatchEvent(new CustomEvent(command.actionType, { detail: command.payload }));
    }
  }, []);

  const clearMapCommand = useCallback(() => {
    setMapCommand(null);
  }, []);

  return (
    <MapActionContext.Provider value={{ mapCommand, dispatchMapCommand, clearMapCommand }}>
      {children}
    </MapActionContext.Provider>
  );
};

export const useMapAction = (): MapActionContextType => {
  const context = useContext(MapActionContext);
  if (!context) {
    // Retorno seguro y desacoplado si se utiliza fuera del Provider
    return {
      mapCommand: null,
      dispatchMapCommand: (command) => {
        if (typeof window !== 'undefined') {
          const fullCommand: MapCommand = {
            actionType: command.actionType,
            payload: command.payload,
            timestamp: Date.now(),
          };
          window.dispatchEvent(new CustomEvent('carnavalia-map-command', { detail: fullCommand }));
          window.dispatchEvent(new CustomEvent(command.actionType, { detail: command.payload }));
        }
      },
      clearMapCommand: () => {},
    };
  }
  return context;
};

export default MapActionContext;
