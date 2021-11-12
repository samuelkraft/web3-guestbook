declare let window: any;

import { Button } from "@chakra-ui/button";
import { FormControl } from "@chakra-ui/form-control";
import { TimeIcon } from "@chakra-ui/icons";
import {
  Box,
  Container,
  Flex,
  Heading,
  Link,
  Spacer,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/layout";
import { Textarea } from "@chakra-ui/textarea";
import { ethers } from "ethers";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import Image from "next/image";
import TimeAgo from "javascript-time-ago";
import ReactTimeAgo from "react-time-ago";
import en from "javascript-time-ago/locale/en.json";
import abi from "../utils/GuestbookPortal.json";
import avatar from "../public/avatar.jpeg";

TimeAgo.addDefaultLocale(en);

type Write = { message: string; address: string; timestamp: any };

const Home: NextPage = () => {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const contractABI = abi.abi;
  const [allWrites, setAllWrites] = useState<Array<Write>>();
  const [currentAccount, setCurrentAccount] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /*
   * Create a method that gets all writes from your contract
   */
  const getAllWrites = async () => {
    const { ethereum } = window;

    try {
      if (ethereum && contractAddress) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const guestbookPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const writes = await guestbookPortalContract.getAllWrites();

        const writesCleaned = writes.map((write: any) => {
          return {
            address: write.writer,
            timestamp: new Date(write.timestamp * 1000),
            message: write.message,
          };
        });

        setAllWrites(writesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Listen in for emitter events!
   */
  useEffect(() => {
    let guestbookPortalContract: ethers.Contract;

    const onNewWrite = (from: string, timestamp: any, message: string) => {
      setAllWrites((prevState) => [
        ...(prevState as any),
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum && contractAddress) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      guestbookPortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      guestbookPortalContract.on("NewWrite", onNewWrite);
    }

    return () => {
      if (guestbookPortalContract) {
        guestbookPortalContract.off("NewWrite", onNewWrite);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWrites();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      getAllWrites();
    } catch (error) {
      console.log(error);
    }
  };

  const write = async () => {
    try {
      const { ethereum } = window;

      if (ethereum && contractAddress) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const guestbookPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await guestbookPortalContract.getTotalWrites();
        console.log("Retrieved total writes count...", count.toNumber());

        /*
         * Execute the actual wave from your smart contract
         */
        const waveTxn = await guestbookPortalContract.write(message, {
          gasLimit: 300000,
        });
        console.log("Mining...", waveTxn.hash);
        setIsLoading(true);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        setMessage("");

        count = await guestbookPortalContract.getTotalWrites();
        console.log("Retrieved total writes count...", count.toNumber());
        setIsLoading(false);
      } else {
        console.log("Ethereum object or contractAddress doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container maxW="container.md">
      <Head>
        <title>Web3 guestbook</title>
        <meta name="description" content="My web3 guestbook" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box py={6}>
        <VStack mb={6} spacing={4} pt={[20, 32]} pb={8} align="center">
          <Box borderRadius="full" overflow="hidden" fontSize={0}>
            <Image
              src={avatar}
              width={90}
              height={90}
              alt="Samuel Kraft avatar"
            />
          </Box>
          <Heading textAlign="center">
            Welcome to Samuels web3 guestbook
          </Heading>
          <Text align="center" opacity={0.75}>
            Connect your{" "}
            <Link
              href="https://metamask.io/"
              isExternal
              textDecoration="underline"
            >
              Metamask wallet
            </Link>{" "}
            to see the guestbook and leave a message. This contract is deployed
            on the Rinkeby testnet, so you can gm me without spending any real
            gas.
          </Text>
        </VStack>
        <Box p={6} background="gray.900" borderRadius={12} mb={16}>
          {currentAccount ? (
            <>
              <Flex mb={4} align="center">
                <Box
                  w="10px"
                  h="10px"
                  bg="green.300"
                  borderRadius="full"
                  mr={2}
                  flexShrink={0}
                />
                <Text
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  MetaMask Connected: {currentAccount}
                </Text>
              </Flex>
              <FormControl id="message" mb={4} isRequired>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isLoading}
                  placeholder="Message"
                  background="#040505"
                  border="gray.600"
                  _focus={{ outline: "2px solid #DD6B20" }}
                />
              </FormControl>
              <Button
                onClick={write}
                isFullWidth
                isLoading={isLoading}
                loadingText="Mining…"
                disabled={!message || isLoading}
                colorScheme="orange"
              >
                Post Message
              </Button>
            </>
          ) : (
            <Box
              p={12}
              alignItems="center"
              justifyContent="center"
              textAlign="center"
            >
              <Button colorScheme="orange" onClick={connectWallet}>
                Connect Wallet
              </Button>
            </Box>
          )}
        </Box>
        <Box mb={12}>
          {allWrites && (
            <VStack spacing={10}>
              {allWrites
                .filter((write) => write.message)
                .sort(
                  (a, b) =>
                    new Date(b.timestamp).valueOf() -
                    new Date(a.timestamp).valueOf()
                )
                .map(({ message, timestamp, address }) => {
                  return (
                    <Box key={message} w="100%">
                      <Flex align="center" fontSize={14} opacity={0.75} mb={3}>
                        <Text
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                          maxW={["150px", "280px", "none"]}
                        >
                          From: {address}
                        </Text>
                        <Box px={2}>·</Box>
                        <Flex
                          align="center"
                          overflow="hidden"
                          whiteSpace="nowrap"
                        >
                          <TimeIcon mr={1.5} />
                          <ReactTimeAgo
                            date={new Date(timestamp.toString())}
                            locale="en-US"
                          />
                        </Flex>
                      </Flex>
                      <Box
                        bg="#0b93f6"
                        p={[4, 5]}
                        borderRadius={25}
                        borderTopLeftRadius={1}
                        display="inline-flex"
                      >
                        <Text fontSize={[16, 20]}>{message}</Text>
                      </Box>
                    </Box>
                  );
                })}
            </VStack>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
