import { FindingType, FindingSeverity, Finding, HandleTransaction } from "forta-agent";
import { provideHandleTransaction } from "./agent";
import { UNISWAP_FACTORY, SWAP_EVENT, POOL_INIT_HASH, UNIPOOLABI } from "./utils";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import { createAddress } from "forta-agent-tools";

const MOCK_SENDER = createAddress("0x123");
const MOCK_RECEIVER = createAddress("0x456");
const MOCK_POOL = createAddress("0xabc");
const MOCK_UNIPOOL = "0xfc17b4eadC81799ED5aB37b5402Ac57B0E6E8879";

const MOCK_METADATA = {
  pool: "0xfc17b4eadC81799ED5aB37b5402Ac57B0E6E8879".toLowerCase(),
  sender: MOCK_SENDER,
  recipient: MOCK_RECEIVER,
  token0: "0x839e71613f9aa06e5701cf6de63e303616b0dde3",
  token1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  amount0: "10",
  amount1: "10",
};

const MOCK_METADATA_2 = {
  pool: "0xfc17b4eadC81799ED5aB37b5402Ac57B0E6E8879".toLowerCase(),
  sender: MOCK_SENDER,
  recipient: MOCK_RECEIVER,
  token0: "0x839e71613f9aa06e5701cf6de63e303616b0dde3",
  token1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  amount0: "20",
  amount1: "20",
};

const MOCK_FINDING = (
  poolAddress: string,
  sender: string,
  recipient: string,
  tokenA: string,
  tokenB: string,
  amount0: string,
  amount1: string
): Finding => {
  return Finding.fromObject({
    name: "Swap occurred",
    description: "Swap took place on uniswap",
    alertId: "UNISWAP-1",
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    protocol: "Uniswap",
    metadata: {
      pool: poolAddress,
      sender: sender.toString(),
      recipient: recipient.toString(),
      token0: tokenA.toString(),
      token1: tokenB.toString(),
      amount0: amount0.toString(),
      amount1: amount1.toString(),
    },
  });
};

describe("Swap on UniSwap V3", () => {
  let handleTransaction: HandleTransaction;
  let findings: Finding[];
  let txEvent: TestTransactionEvent;

  beforeAll(() => {
    handleTransaction = provideHandleTransaction(UNISWAP_FACTORY, SWAP_EVENT, UNIPOOLABI, POOL_INIT_HASH);
  });

  it("returns empty findings if there are no swap events", async () => {
    txEvent = new TestTransactionEvent();
    findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns empty finding if the swap does not occur on Uniswap V3", async () => {
    txEvent = new TestTransactionEvent().addEventLog(SWAP_EVENT, MOCK_POOL, [
      MOCK_SENDER,
      MOCK_RECEIVER,
      10,
      10,
      10,
      10,
      10,
    ]);
    findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns a finding if a swap occurs on Uniswap V3", async () => {
    txEvent = new TestTransactionEvent().addEventLog(SWAP_EVENT, MOCK_UNIPOOL, [
      MOCK_SENDER,
      MOCK_RECEIVER,
      10,
      10,
      10,
      10,
      10,
    ]);
    findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([
      MOCK_FINDING(
        MOCK_METADATA.pool,
        MOCK_METADATA.sender,
        MOCK_METADATA.recipient,
        MOCK_METADATA.token0,
        MOCK_METADATA.token1,
        MOCK_METADATA.amount0,
        MOCK_METADATA.amount1
      ),
    ]);
  });

  it("returns multiple findings when multiple swap occurs on Uniswap V3", async () => {
    txEvent = new TestTransactionEvent()
      .addEventLog(SWAP_EVENT, MOCK_UNIPOOL, [MOCK_SENDER, MOCK_RECEIVER, 10, 10, 10, 10, 10])
      .addEventLog(SWAP_EVENT, MOCK_UNIPOOL, [MOCK_SENDER, MOCK_RECEIVER, 20, 20, 20, 20, 20]);
    findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([
      MOCK_FINDING(
        MOCK_METADATA.pool,
        MOCK_METADATA.sender,
        MOCK_METADATA.recipient,
        MOCK_METADATA.token0,
        MOCK_METADATA.token1,
        MOCK_METADATA.amount0,
        MOCK_METADATA.amount1
      ),
      MOCK_FINDING(
        MOCK_METADATA_2.pool,
        MOCK_METADATA_2.sender,
        MOCK_METADATA_2.recipient,
        MOCK_METADATA_2.token0,
        MOCK_METADATA_2.token1,
        MOCK_METADATA_2.amount0,
        MOCK_METADATA_2.amount1
      ),
    ]);
  });
});
