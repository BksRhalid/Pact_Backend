// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

// import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
// import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

// abstract contract randomNumber is VRFConsumerBaseV2 {
//     VRFCoordinatorV2Interface COORDINATOR;

//     // Goerli coordinator. For other networks,
//     // see https://docs.chain.link/docs/vrf-contracts/#configurations
//     address vrfCoordinator = 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed;

//     // The gas lane to use, which specifies the maximum gas price to bump to.
//     // For a list of available gas lanes on each network,
//     // see https://docs.chain.link/docs/vrf-contracts/#configurations
//     bytes32 keyHash =
//         0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;

//     // Depends on the number of requested values that you want sent to the
//     // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
//     // so 100,000 is a safe default for this example contract. Test and adjust
//     // this limit based on the network that you select, the size of the request,
//     // and the processing of the callback request in the fulfillRandomWords()
//     // function.
//     uint32 callbackGasLimit = 100000;

//     // The default is 3, but you can set this higher.
//     uint16 requestConfirmations = 3;

//     uint32 numWords = 1;

//     uint256[] public s_randomWords;
//     uint256 public s_requestId;

//     constructor(uint64 subscriptionId) VRFConsumerBaseV2(vrfCoordinator) {
//         subscriptionId = s_subscriptionId; // get from ChainLink
//         COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
//     }

//     function requestRandomWords() external {
//         s_requestId = COORDINATOR.requestRandomWords(
//             keyHash,
//             s_subscriptionId,
//             requestConfirmations,
//             callbackGasLimit,
//             numWords
//         );
//     }

//     function fulfillRandomWords(uint256, uint256[] memory randomWords)
//         internal
//         override
//     {
//         s_randomWords = randomWords;
//     }

//     function random() public view returns (uint256) {
//         return s_randomWords[0];
//     }
// }
