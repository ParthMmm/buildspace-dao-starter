import Head from "next/head";
import Image from "next/image";
import { Flex, Box, Heading } from "@chakra-ui/react";
export default function Home() {
  return (
    <>
      <Head>
        <title>pizzaDAO</title>
        <meta name="description" content="pizzaDAO for the people" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex w="100%" h="100vh" alignItems={"center"} justifyContent={"center"}>
        <Heading>welcome to pizzaDAO 🍕</Heading>
      </Flex>
    </>
  );
}
