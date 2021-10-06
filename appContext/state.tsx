import React, { createContext, useContext } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { Toast } from "@shopify/app-bridge/actions";

interface AppContextInterface {
  sendAuthApi: (uri: RequestInfo, options?: RequestInit | undefined) => Promise<any>;
  toastNoti: (options?: {
    message: string;
    duration: number;
  }) => void;
}
const AppContext = createContext<AppContextInterface | null>(null);

export const AppWrapper: React.FC = ({ children }) => {
  const app = useAppBridge();

  const defaultToastOptions = {
    message: "Success",
    duration: 3000,
  };
  let sharedState = {
    sendAuthApi: authenticatedFetch(app),
    toastNoti: (options = defaultToastOptions) => {
      const toastNotice = Toast.create(app, options);
      toastNotice.dispatch(Toast.Action.SHOW);
    },
  };

  return (
    <AppContext.Provider value={sharedState}>{children}</AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
