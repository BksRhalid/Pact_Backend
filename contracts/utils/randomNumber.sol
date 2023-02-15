// create random number generator contract to generate random number for jury selection

// https://soliditydeveloper.com/prevrandao

// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

contract randomNumber {
    uint256 public randomResult;

    function random(uint256 _upper) public virtual returns (uint256) {
        uint256 randomnumber = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        );
        randomResult = randomnumber % _upper;
        return randomResult;
    }
}
