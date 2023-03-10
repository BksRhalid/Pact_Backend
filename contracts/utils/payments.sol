// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/finance/PaymentSplitter.sol";

contract payments is PaymentSplitter {
    constructor(address[] memory _payees, uint256[] memory _shares)
        payable
        PaymentSplitter(_payees, _shares)
    {}
}
