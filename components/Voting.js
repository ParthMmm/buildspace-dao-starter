import React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Flex,
  Box,
  Heading,
  Button,
  Text,
  RadioGroup,
  Stack,
  Radio,
} from "@chakra-ui/react";
import "regenerator-runtime/runtime";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { useWeb3 } from "@3rdweb/hooks";
import { ethers } from "ethers";
import MemberTable from "./MemberTable";
import { useForm } from "react-hook-form";

function Voting({ voteModule, address, hasClaimedNFT }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [value, setValue] = React.useState("1");

  // Retreive all our existing proposals from the contract.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    // A simple call to voteModule.getAll() to grab the proposals.
    voteModule
      .getAll()
      .then((proposals) => {
        // Set state!
        setProposals(proposals);
        console.log("🌈 Proposals:", proposals);
      })
      .catch((err) => {
        console.error("failed to get proposals", err);
      });
  }, [hasClaimedNFT]);

  // We also need to check if the user already voted.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // If we haven't finished retreieving the proposals from the useEffect above
    // then we can't check if the user voted yet!
    if (!proposals.length) {
      return;
    }

    // Check if the user has already voted on the first proposal.
    voteModule
      .hasVoted(proposals[0].proposalId, address)
      .then((hasVoted) => {
        setHasVoted(hasVoted);

        if (hasVoted) {
          console.log("🥵 User has already voted");
        }
      })
      .catch((err) => {
        console.error("failed to check if wallet has voted", err);
      });
  }, [hasClaimedNFT, proposals, address]);

  const onSubmit = async (data) => {
    const votes = proposals.map((proposal) => {
      let voteResult = {
        proposalId: proposal.proposalId,
        //abstain by default
        vote: 2,
      };

      voteResult.vote = data[proposal.proposalId];
      console.log(data[proposal.proposalId]);
      return voteResult;
    });

    console.log(votes);

    //before we do async things, we want to disable the button to prevent double clicks
    setIsVoting(true);

    // first we need to make sure the user delegates their token to vote
    try {
      //we'll check if the wallet still needs to delegate their tokens before they can vote
      console.log(tokenModule.getDelegationOf(address));
      const delegation = await tokenModule.getDelegationOf(address);
      // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
      if (delegation === ethers.constants.AddressZero) {
        //if they haven't delegated their tokens yet, we'll have them delegate them before voting
        await tokenModule.delegateTo(address);
      }
      // then we need to vote on the proposals
      try {
        await Promise.all(
          votes.map(async (vote) => {
            // before voting we first need to check whether the proposal is open for voting
            // we first need to get the latest state of the proposal
            const proposal = await voteModule.get(vote.proposalId);
            // then we check if the proposal is open for voting (state === 1 means it is open)
            if (proposal.state === 1) {
              // if it is open for voting, we'll vote on it
              return voteModule.vote(vote.proposalId, vote.vote);
            }
            // if the proposal is not open for voting we just return nothing, letting us continue
            return;
          })
        );
        try {
          // if any of the propsals are ready to be executed we'll need to execute them
          // a proposal is ready to be executed if it is in state 4
          await Promise.all(
            votes.map(async (vote) => {
              // we'll first get the latest state of the proposal again, since we may have just voted before
              const proposal = await voteModule.get(vote.proposalId);

              //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
              if (proposal.state === 4) {
                return voteModule.execute(vote.proposalId);
              }
            })
          );
          // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
          setHasVoted(true);
          // and log out a success message
          console.log("successfully voted");
        } catch (err) {
          console.error("failed to execute votes", err);
        }
      } catch (err) {
        console.error("failed to vote", err);
      }
    } catch (err) {
      console.error("failed to delegate tokens");
    } finally {
      // in *either* case we need to set the isVoting state to false to enable the button again
      setIsVoting(false);
    }
  };

  return (
    <Flex>
      <form onSubmit={handleSubmit(onSubmit)}>
        {proposals.map((proposal, index) => {
          return (
            <Flex
              key={index}
              flexDir={"column"}
              alignItems={"center"}
              justifyContent={"center"}
              border={"8px solid orange"}
              rounded="2xl"
            >
              <Heading fontSize={"md"}>{proposal.description}</Heading>
              <Flex>
                {proposal.votes.map((vote) => (
                  <Flex key={vote.type}>
                    <Radio
                      id={proposal.proposalId + "-" + vote.type}
                      name={proposal.proposalId}
                      colorScheme="orange"
                      value={vote.type}
                      {...register(`${proposal.proposalId}`)}
                    >
                      {vote.label}
                    </Radio>
                  </Flex>
                ))}
              </Flex>
            </Flex>
          );
        })}
        <Button disabled={isVoting || hasVoted} type="submit">
          {isVoting
            ? "Voting..."
            : hasVoted
            ? "You Already Voted"
            : "Submit Votes"}
        </Button>
      </form>
    </Flex>
  );
}

export default Voting;
