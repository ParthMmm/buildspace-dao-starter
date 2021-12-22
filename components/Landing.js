import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Flex, Box, Heading, Button, Text } from "@chakra-ui/react";
import "regenerator-runtime/runtime";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { useWeb3 } from "@3rdweb/hooks";
import { ethers } from "ethers";
import MemberTable from "./MemberTable";
import Voting from "./Voting";

// We instatiate the sdk on Rinkeby.
const sdk = new ThirdwebSDK("rinkeby");

// We can grab a reference to our ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(
  "0x98Aaf21aEE124CBff65e8fFc84a1d474CdDdB9Aa"
);

const tokenModule = sdk.getTokenModule(
  "0xb1e570a274FCE997Ca6C6400cd3845883DaD51b3"
);

const voteModule = sdk.getVoteModule(
  "0x5aF8846A5691B4F67dd5615Dcf9375e381788dEb"
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

  // Holds the amount of token each member has in state.
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  // The array holding all of our members addresses.
  const [memberAddresses, setMemberAddresses] = useState([]);

  // This useEffect grabs all our the addresses of our members holding our NFT.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // Just like we did in the 7-airdrop-token.js file! Grab the users who hold our NFT
    // with tokenId 0.
    bundleDropModule
      .getAllClaimerAddresses("0")
      .then((addresess) => {
        console.log("🚀 Members addresses", addresess);
        setMemberAddresses(addresess);
      })
      .catch((err) => {
        console.error("failed to get member list", err);
      });
  }, [hasClaimedNFT]);

  // This useEffect grabs the # of token each member holds.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // Grab all the balances.
    tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        console.log("👜 Amounts", amounts);
        setMemberTokenAmounts(amounts);
      })
      .catch((err) => {
        console.error("failed to get token amounts", err);
      });
  }, [hasClaimedNFT]);

  // Now, we combine the memberAddresses and memberTokenAmounts into a single array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          // If the address isn't in memberTokenAmounts, it means they don't
          // hold any of our token.
          memberTokenAmounts[address] || 0,
          18
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

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

        <Text mb={2}>congrats on owning a slice</Text>
        <Flex
          flexDir={"row"}
          w="80%"
          justifyContent={"space-evenly"}
          alignItems={"center"}
        >
          <MemberTable memberList={memberList} />
          <Voting
            voteModule={voteModule}
            address={address}
            hasClaimedNFT={hasClaimedNFT}
          />
        </Flex>
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
