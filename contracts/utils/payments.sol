// create payment spltter contract to split the payment between the freelancer and the platform

// using payment splitter >> https://www.youtube.com/watch?v=b5sQt4F8voA

// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/finance/PaymentSplitter.sol";

contract payments is PaymentSplitter {
    constructor(address[] memory payees, uint256[] memory shares)
        payable
        PaymentSplitter(payees, shares)
    {}
}
