import { ChakraProvider } from "@chakra-ui/react";
import { ThirdwebWeb3Provider } from "@3rdweb/hooks";

// Include what chains you wanna support.
// 4 = Rinkeby.
const supportedChainIds = [4];

// Include what type of wallet you want to support.
// In this case, we support Metamask which is an "injected wallet".
const connectors = {
  injected: {},
};

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <ThirdwebWeb3Provider
        connectors={connectors}
        supportedChainIds={supportedChainIds}
      >
        <Component {...pageProps} />
      </ThirdwebWeb3Provider>
    </ChakraProvider>
  );
}

export default MyApp;
