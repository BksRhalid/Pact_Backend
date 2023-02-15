// create random number generator contract to generate random number for jury selection

// https://soliditydeveloper.com/prevrandao

// block.prevrandao

// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

abstract contract randomNumber {
    function random() public view returns (uint256) {
        return block.prevrandao;
    }
}
