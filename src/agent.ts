import {
  BlockEvent,
  Finding,
  HandleBlock,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  getJsonRpcUrl,
} from "forta-agent";
import { SWAP_EVENT, UNISWAP_FACTORY, UNIPOOLABI, POOL_INIT_HASH } from "./utils";
import { ethers } from "ethers";
import { createAddress } from "forta-agent-tools";
export const provideHandleTransaction = (
  factory: string,
  swapAbi: string,
  poolAbi: string[],
  initHash: string
): HandleTransaction => {
  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];

    const swapEvents = txEvent.filterLog(swapAbi);

    for (var swap of swapEvents) {
      const poolAddress = swap.address;
      const provider = new ethers.providers.JsonRpcProvider(getJsonRpcUrl());
      const poolContract = new ethers.Contract(poolAddress, poolAbi, provider);
      let tokenA;
      let tokenB;
      let fee;
      try{
        tokenA = await poolContract.token0();
        tokenB = await poolContract.token1();
        fee = await poolContract.fee();
      } catch (e) {
        tokenA = createAddress("0x00");
        tokenB = createAddress("0x00");
        fee = 0;
      }
      const salt = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(["address", "address", "uint24"], [tokenA, tokenB, fee])
      );
      const uniswapAddress = ethers.utils.getCreate2Address(factory, salt, initHash);
      if (uniswapAddress.toLowerCase() === poolAddress.toLowerCase()) {
        const { sender, recipient, amount0, amount1 } = swap.args;
        findings.push(
          Finding.fromObject({
            name: "Swap occurred",
            description: "Swap took place on uniswap",
            alertId: "UNISWAP-1",
            severity: FindingSeverity.Info,
            type: FindingType.Info,
            metadata: {
              pool: poolAddress.toLowerCase(),
              sender: sender.toString(),
              recipient: recipient.toString(),
              token0: tokenA.toString().toLowerCase(),
              token1: tokenB.toString().toLowerCase(),
              amount0: amount0.toString(),
              amount1: amount1.toString(),
            },
          })
        );
      }
    }
    return findings;
  };
};

export default {
  handleTransaction: provideHandleTransaction(UNISWAP_FACTORY, SWAP_EVENT, UNIPOOLABI, POOL_INIT_HASH),
};
