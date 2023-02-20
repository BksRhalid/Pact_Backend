// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

abstract contract randomNumber {
    // function random() public view returns (uint256) {
    //     return block.prevrandao;
    // }

    function random(uint24 _seed) public view returns (uint256) {
        uint256 result = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, block.prevrandao, _seed)
            )
        );
        return result;
    }
}
