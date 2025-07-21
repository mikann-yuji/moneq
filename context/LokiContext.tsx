'use client';

import React, { createContext, useContext, useRef } from 'react';
import Loki from 'lokijs';

type LokiContextType = {
  lokiDB: Loki;
};

const LokiContext = createContext<LokiContextType | undefined>(undefined);

export const LokiProvider = ({ children }: { children: React.ReactNode }) => {
  const lokiRef = useRef<Loki | undefined>(undefined);

  if (!lokiRef.current) {
    lokiRef.current = new Loki('client.db');
    // lokiRef.current.addCollection('items', { unique: ['id'] });
  }

  return (
    <LokiContext.Provider value={{ lokiDB: lokiRef.current }}>
      {children}
    </LokiContext.Provider>
  );
};

export const useLoki = () => {
  const context = useContext(LokiContext);
  if (!context) {
    throw new Error('useLoki must be used within a LokiProvider');
  }
  return context;
};
