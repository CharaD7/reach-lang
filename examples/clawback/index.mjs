import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

const stdlib = loadStdlib(process.env);
const pc = stdlib.parseCurrency;
const b = pc(100);
const balOf = async (acc, tok) => stdlib.balanceOf(acc, tok);


const algo = async (accAlice, ctcA, token) => {
  const { algosdk } = stdlib;
  const tokenId = token.id.toNumber();

  const requestMoney = async (addr) => {
    const address = stdlib.formatAddress(addr);
    await stdlib.transfer(accAlice, address, pc(20), tokenId);
  }

  const requestClawback = async (addr, funds) => {
    console.log(`Clawback`);
    const address = stdlib.formatAddress(addr);
    const aliceAddr = accAlice.networkAccount.addr;
    try {
      const params = await stdlib.getTxnParams('');
      const rtxns = [await algosdk.makeAssetTransferTxnWithSuggestedParams(
        aliceAddr, aliceAddr,
        undefined, address,
        20000000,
        undefined,
        tokenId, params
      )];
      await algosdk.assignGroupID(rtxns);
      const wtxns = rtxns.map(stdlib.toWTxn);
      const res = await stdlib.signSendAndConfirm(accAlice.networkAccount, wtxns);
      console.log(res);
    } catch (e) {
      console.log(`err:`, e);
    }
  }

  const checkBal = async (addr) => {
    const address = stdlib.formatAddress(addr);
    const bal = await balOf(address, tokenId);
    console.log(`Balance:`, bal.toString());
  }

  await Promise.all([
    backend.Alice(ctcA, {
      token: tokenId,
      requestMoney,
      requestClawback,
      checkBal
    })
  ]);
}

const eth = async (accAlice, ctcA, token) => {
  const tokenId = token.id;

  const requestMoney = async (addr) => {
    console.log(`Request money`);
    const address = stdlib.formatAddress(addr);
    await stdlib.transfer(accAlice, address, pc(20), tokenId);
  }

  const requestClawback = async (addr, funds) => {
    console.log(`Clawback`);
  }

  const checkBal = async (addr) => {
    console.log(`checkBal`);
    // const bal = await balOf(addr, tokenId);
    const bal = pc(0);
    console.log(`Balance:`, bal.toString());
  }

  await Promise.all([
    backend.Alice(ctcA, {
      token: tokenId,
      requestMoney,
      requestClawback,
      checkBal
    })
  ]);
}

(async () => {

  const accAlice = await stdlib.newTestAccount(b);
  const ctcA = accAlice.contract(backend);

  const token = await stdlib.launchToken(accAlice, "Zorkmid", "ZMD", { clawback: accAlice });

  if (stdlib.connector == 'ALGO') {
    return;
    // Fails with:
    //    logic eval error: invalid Asset reference 18233"
    // I believe token needs to be specified as an offset in the foreign assets array.
    // See: https://forum.algorand.org/t/asset-holding-get-doesnt-recognize-asset-id/3790
    await algo(accAlice, ctcA, token);
  } else {
    await eth(accAlice, ctcA, token);
  }
})();
