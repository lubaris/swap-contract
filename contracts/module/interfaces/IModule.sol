// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IModule {
    function getAmountSwap(address _from, address _to, uint256 _amount) external view returns(uint256 receivedAmount);
    
    function swap(address _from, address _to, uint256 _amount, uint256 _expectedAmount) external returns(uint256 receivedAmount);
}