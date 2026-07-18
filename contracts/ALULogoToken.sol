// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ALULogoToken
 * @dev ERC-20 token representing fractional ownership shares of the ALU logo.
 */
contract ALULogoToken is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10 ** 18;

    constructor(address logoOwner)
        ERC20("ALU Logo Token", "ALUT")
        Ownable(logoOwner)
    {
        require(logoOwner != address(0), "Invalid owner address");
        _mint(logoOwner, INITIAL_SUPPLY);
    }

    /**
     * @notice Distributes ALUT ownership shares from the owner to a recipient.
     * @dev Amount must be supplied in the smallest ERC-20 unit.
     */
    function distributeShares(address recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than zero");
        require(balanceOf(owner()) >= amount, "Insufficient owner balance");
        _transfer(owner(), recipient, amount);
    }

    /**
     * @notice Returns whole-number ownership percentage based on current balance.
     */
    function ownershipPercentage(address holder) external view returns (uint256) {
        return (balanceOf(holder) * 100) / totalSupply();
    }
}
