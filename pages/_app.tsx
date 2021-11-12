import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";

// 2. Call `extendTheme` and pass your custom values
export const theme = extendTheme({
  fonts: {
    heading: "Inter",
    body: "Inter",
  },
  styles: {
    global: {
      body: {
        background: "#040505",
        color: "white",
      },
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
