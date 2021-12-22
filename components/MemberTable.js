import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  Flex,
  Box,
  Heading,
  Button,
  Text,
} from "@chakra-ui/react";
function MemberTable({ memberList }) {
  // A fancy function to shorten someones wallet address, no need to show the whole thing.
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };
  return (
    <Flex border="8px solid orange" rounded="2xl">
      <Table>
        <Thead>
          <Tr>
            <Th>Address</Th>
            <Th>Token Amount</Th>
          </Tr>
        </Thead>
        <Tbody>
          {memberList.map((member) => {
            return (
              <Tr key={member.address}>
                <Td>{shortenAddress(member.address)}</Td>
                <Td>{member.tokenAmount}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Flex>
  );
}

export default MemberTable;
