// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract Vesting is ReentrancyGuard{
    ERC20 public token;
    uint256 amount;
    address payable recipient;
    uint public startTime;
    uint public cliffduration;
    uint public totalVestingDuration;
    uint256 private alreadyVested;
    
    address payable public owner;

    constructor(address token_,uint startTime_, uint cliffduration_, uint totalVestingDuration_, uint amount_, address recipient_) {
        require(totalVestingDuration_ > cliffduration_, "Total duration should be more that cliff period");
        token=ERC20(token_);
        startTime=startTime_;
        cliffduration=cliffduration_;
        totalVestingDuration=totalVestingDuration_;
        amount = amount_;
        recipient= payable(recipient_);
    }

    function release() external nonReentrant {
        require(msg.sender == recipient, "Can be called only by recipient");
        console.log("startTime+cliffduration< block.timestamp",startTime+cliffduration< block.timestamp);
        require(startTime+cliffduration< block.timestamp, "Cliff period not passed");
        console.log("--------------------");
        require(alreadyVested < amount, "Already vested all amount");
        console.log("block.timestamp    ",block.timestamp);
        console.log("startTime          ",(startTime+cliffduration));
        uint256 currentVestingTime = block.timestamp -(startTime+cliffduration);
        console.log("currentVestingTime    ",currentVestingTime);
        console.log("amount                ",amount);
        console.log("totalVestingDuration  ",totalVestingDuration);
        console.log("cliffduration         ", cliffduration);
        uint256 toSend;
        if(currentVestingTime > totalVestingDuration) {
           toSend = amount - alreadyVested;
        } else {
            uint256 currentVestingAmount;
            if(amount > (totalVestingDuration-cliffduration)) 
                currentVestingAmount = currentVestingTime * amount/(totalVestingDuration-cliffduration);
            else 
                currentVestingAmount = currentVestingTime *(totalVestingDuration-cliffduration)/ amount;
            toSend  = currentVestingAmount - alreadyVested;
        
        }
        alreadyVested += toSend;
        token.transfer(recipient, toSend); 
    }

}
