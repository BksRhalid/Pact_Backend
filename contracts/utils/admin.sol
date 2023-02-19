// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

//natspec
/// @title Administration using Ownable from OpenZeppelin
/// @author deployer
/// @notice This contract is used to manage the admin role and manage setProtocolFee, setJuryFee, setJuryLenght

import "@openzeppelin/contracts/access/Ownable.sol";

contract admin is Ownable {
    uint8 public protocolFee;
    uint8 public juryFee;
    uint24 public juryLength;

    constructor(
        uint8 _protocolFee,
        uint8 _juryFee,
        uint24 _juryLength
    ) {
        protocolFee = _protocolFee;
        juryFee = _juryFee;
        juryLength = _juryLength;
    }

    function setProtocolFee(uint8 _protocolFee) public onlyOwner {
        protocolFee = _protocolFee;
    }

    function setJuryFee(uint8 _juryFee) public onlyOwner {
        juryFee = _juryFee;
    }

    function setJuryLength(uint8 _juryLength) public onlyOwner {
        juryLength = _juryLength;
    }
}
