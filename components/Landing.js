import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Flex, Box, Heading, Button, Text } from "@chakra-ui/react";
import "regenerator-runtime/runtime";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { useWeb3 } from "@3rdweb/hooks";

// We instatiate the sdk on Rinkeby.
const sdk = new ThirdwebSDK("rinkeby");

// We can grab a reference to our ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(
  "0x98Aaf21aEE124CBff65e8fFc84a1d474CdDdB9Aa"
);
function Landing() {
  // Use the connectWallet hook thirdweb gives us.
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("👋 Address:", address);

  // The signer is required to sign transactions on the blockchain.
  // Without it we can only read data, not write.
  const signer = provider ? provider.getSigner() : undefined;

  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // isClaiming lets us easily keep a loading state while the NFT is minting.
  const [isClaiming, setIsClaiming] = useState(false);

  // Another useEffect!
  useEffect(() => {
    // We pass the signer to the sdk, which enables us to interact with
    // our deployed contract!
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  useEffect(() => {
    // If they don't have an connected wallet, exit!
    if (!address) {
      return;
    }

    // Check if the user has the NFT by using bundleDropModule.balanceOf
    return bundleDropModule
      .balanceOf(address, "0")
      .then((balance) => {
        // If balance is greater than 0, they have our NFT!
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!");
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.");
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("failed to nft balance", error);
      });
  }, [address]);

  // This is the case where the user hasn't connected their wallet
  // to your web app. Let them call connectWallet.
  if (!address) {
    return (
      <Flex flexDir="column" alignItems={"center"} justifyContent={"center"}>
        <Heading>welcome to pizzaDAO 🍕</Heading>

        <Button onClick={() => connectWallet("injected")} mt={2}>
          connect your wallet
        </Button>
      </Flex>
    );
  }

  if (hasClaimedNFT) {
    return (
      <Flex flexDir={"column"} alignItems={"center"} justifyContent={"center"}>
        <Heading> 🍕 pizzaDAO member page</Heading>

        <Text>congrats on owning a slice</Text>
      </Flex>
    );
  }

  const mintNFT = () => {
    setIsClaiming(true);
    // Call bundleDropModule.claim("0", 1) to mint nft to user's wallet.
    bundleDropModule
      .claim("0", 1)
      .catch((err) => {
        console.error("failed to claim", err);
        setIsClaiming(false);
      })
      .finally(() => {
        // Stop loading state.
        setIsClaiming(false);
        // Set claim state.
        setHasClaimedNFT(true);
        // Show user their fancy new NFT!
        console.log(
          `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
        );
      });
  };

  // This is the case where we have the user's address
  // which means they've connected their wallet to our site!
  return (
    <Flex flexDir={"column"} alignItems={"center"} justifyContent={"center"}>
      <Heading>mint your free 🍕 pizzaDAO membership nft</Heading>
      <Button isDisabled={isClaiming} onClick={() => mintNFT()} mt={2}>
        {isClaiming ? "minting..." : "mint your nft (free)"}
      </Button>
    </Flex>
  );
}

export default Landing;
