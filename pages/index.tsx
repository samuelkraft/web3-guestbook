import { Button } from "@chakra-ui/button";
import {
  FormControl,
  FormHelperText,
  FormLabel,
} from "@chakra-ui/form-control";
import { Box, Container, Heading, Text } from "@chakra-ui/layout";
import { Textarea } from "@chakra-ui/textarea";
import type { NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
  const isConnected = true;
  return (
    <Container>
      <Head>
        <title>Web3 guestbook</title>
        <meta name="description" content="My web3 guestbook" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box py={6}>
        <Box mb={6}>
          <Heading>Welcome to my web3 guestbook</Heading>
          <Text>
            Login with your Ethereum wallet to leave a message. This smart
            contract is deployed on the Rinkeby testnet, so you can test without
            spending any (real) gas.
          </Text>
        </Box>
        <Box p={3} background="gray.100" borderRadius={12}>
          {isConnected ? (
            <>
              <FormControl id="message" mb={3}>
                <FormLabel>Message</FormLabel>
                <Textarea background="white" />
              </FormControl>
              <Button type="submit" background="green.300" isFullWidth>
                Submit
              </Button>
            </>
          ) : (
            <Button background="blue.300">Connect Wallet</Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
