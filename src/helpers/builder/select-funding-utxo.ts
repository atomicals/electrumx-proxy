/**
 * Gets a funding UTXO and also displays qr code for quick deposit
 * @param electrumxApi
 * @param address
 * @param amount
 * @returns
 */
export const getFundingUtxo = async (
  electrumxApi,
  address: string,
  amount: number,
  seconds = 5
) => {
  // If commit POW was requested, then we will use a UTXO from the funding wallet to generate it
  console.log(`...`);
  console.log(`...`);
  console.log(`WAITING UNTIL ${amount / 100000000} BTC RECEIVED AT ${address}`);
  console.log(`...`);
  console.log(`...`);
  let fundingUtxo = await electrumxApi.waitUntilUTXO(address, amount, seconds ? 5 : seconds, false);
  console.log(
    `Detected Funding UTXO (${fundingUtxo.txid}:${fundingUtxo.vout}) with value ${fundingUtxo.value} for funding...`
  );
  return fundingUtxo;
};
