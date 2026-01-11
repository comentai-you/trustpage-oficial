import { createContext, useContext, ReactNode } from "react";

interface PageOwnerContextType {
  ownerId: string | null;
}

const PageOwnerContext = createContext<PageOwnerContextType | undefined>(undefined);

export const usePageOwner = (): PageOwnerContextType => {
  const context = useContext(PageOwnerContext);
  // Return null if not in context (for preview/editor mode)
  if (!context) {
    return { ownerId: null };
  }
  return context;
};

interface PageOwnerProviderProps {
  ownerId: string | null;
  children: ReactNode;
}

export const PageOwnerProvider = ({ ownerId, children }: PageOwnerProviderProps) => {
  return (
    <PageOwnerContext.Provider value={{ ownerId }}>
      {children}
    </PageOwnerContext.Provider>
  );
};
