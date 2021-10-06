import "isomorphic-fetch";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import { AppProvider } from "@shopify/polaris";
import { Provider, useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import translations from "@shopify/polaris/locales/en.json";
import '@shopify/polaris/build/esm/styles.css'
import { AppWrapper } from "../appContext/state";
import { ClientApplication } from "@shopify/app-bridge";
import { PropsWithChildren } from "react";

function logUserInFetch(app: ClientApplication<any>) {
  const fetchFunction = authenticatedFetch(app);

  return async (uri: string, options: any) => {
    const response = await fetchFunction(uri, options);

    if (
      response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1"
    ) {
      const authUrlHeader = response.headers.get(
        "X-Shopify-API-Request-Failure-Reauthorize-Url"
      );

      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`);
      return response;
    }

    return response;
  };
}

function MyProvider(props: PropsWithChildren<any>) {
  const app = useAppBridge();
  const client = new ApolloClient({
    fetch: logUserInFetch(app),
    fetchOptions: {
      credentials: "include",
    },
  });

  const Component = props.Component;

  return (
    <ApolloProvider client={client}>
      <AppWrapper>
        <Component {...props} />
      </AppWrapper>
    </ApolloProvider>
  );
}

interface MyAppType {
  host: string;
  pageProps: any;
  Component: any;
}
const MyApp = ({Component, pageProps, host}: MyAppType) => {
  return (
    <AppProvider i18n={translations}>
        <Provider
          config={{
            apiKey: API_KEY || "",
            host: host,
            forceRedirect: true,
          }}
        >
          <MyProvider Component={Component} {...pageProps} />
        </Provider>
      </AppProvider>
  )
}

MyApp.getInitialProps = async ({ ctx }: any) => {
  return {
    host: ctx.query.host,
  };
};

export default MyApp;
