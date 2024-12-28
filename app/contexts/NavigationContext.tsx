"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type BreadcrumbItem = {
  label: string;
  path: string;
};

type NavigationContextType = {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
  clearBreadcrumbs: () => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  const clearBreadcrumbs = () => {
    setBreadcrumbs([]);
  };

  return (
    <NavigationContext.Provider
      value={{ breadcrumbs, setBreadcrumbs, clearBreadcrumbs }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};
