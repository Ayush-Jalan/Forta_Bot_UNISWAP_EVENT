import { ethers } from "ethers";
export const SWAP_EVENT =
  "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)";
export const UNISWAP_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
export const UNIPOOLABI = [
  "function fee() public view returns (uint24)",
  "function token0() public view returns (address)",
  "function token1() public view returns (address)",
];
export const POOL_INIT_HASH = "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54";

export async function getUniswapAddress(
  tokenA: string,
  tokenB: string,
  fee: string,
  factory: string,
  initHash: string
) {
  const salt = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address", "address", "uint24"], [tokenA, tokenB, fee])
  );
  const uniswapAddress = ethers.utils.getCreate2Address(factory, salt, initHash);
  return uniswapAddress;
}
