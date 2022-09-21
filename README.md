# Uniswap Swap Detector

## Description

This bot alerts every time when a swap occurs on Uniswap V3

## Supported Chains

- Ethereum

## Alerts

- UNISWAP-1
  - Fired when a swap occurs on Uniswap V3
  - Severity is always set to "info" 
  - Type is always set to "info" 
  - Metadata contains:
    - pool : address of UniswapV3 pool on which swap occurs
    - sender : address which initiates swap
    - recipient : address which recieves swappped token
    - token0 : address of first token in the pool
    - token1 : address of second token in the pool
    - amount0 : amount of first token to be swapped
    - amount1 : amount of second token recieved after swap

## Test Data

The bot behaviour can be verified with the following transactions:

- [0x31f97505fe917eb5da8fe9628c97a01d3e7f966c9cfd29f16019547c9911370d](https://etherscan.io/tx/0x31f97505fe917eb5da8fe9628c97a01d3e7f966c9cfd29f16019547c9911370d)
