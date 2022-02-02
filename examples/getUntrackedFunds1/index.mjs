import {loadStdlib} from '@reach-sh/stdlib';
import * as backendNet from './build/index.mainNet.mjs';
import * as backendTok from './build/index.mainTok.mjs';
const stdlib = loadStdlib(process.env);
const startingBalance = stdlib.parseCurrency(100);

const approx = (x, n) => x > (n - 3) && x < n;

const run = async (backend, useToken) => {

  const [ accAlice, accBob, accCreator] =
    await stdlib.newTestAccounts(3, startingBalance);

  let tokenId = undefined;
  if (useToken) {
    const token = await stdlib.launchToken(accCreator, "Zorkmid", "ZMD");
    tokenId = token.id.toNumber();
    await accBob.tokenAccept(tokenId);
    await accAlice.tokenAccept(tokenId);
    await stdlib.transfer(accCreator, accAlice, stdlib.parseCurrency(100), tokenId);
    await stdlib.transfer(accCreator, accBob, stdlib.parseCurrency(100), tokenId);
  }

  const fmt = (x) => stdlib.formatCurrency(x, 4);
  const getBalance = async (who) => fmt(await stdlib.balanceOf(who, tokenId));
  const logBalances = async (address) => {
    console.log(`   Alice balance:`, await getBalance(accAlice));
    console.log(`   Bobby balance:`, await getBalance(accBob));
    if (address) {
      console.log(`Contract balance:`, await getBalance(address));
    }
  }

  console.log(`Launching program:`);
  await logBalances();

  const ctcAlice = accAlice.contract(backend);
  const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

  await Promise.all([
    backend.Alice(ctcAlice, {
      tokenId,
    }),
    backend.Bob(ctcBob, {
      gimmeSomeDough: async (addr) => {
        const address = stdlib.formatAddress(addr);
        await stdlib.transfer(accAlice, address, stdlib.parseCurrency(50), tokenId);
        console.log(`Sent some dough to:`, address);
        await logBalances(address);
      }
    }),
  ]);

  console.log('Program finished:');
  await logBalances();
  const aliceBal = await getBalance(accAlice);
  const bobBal   = await getBalance(accBob);
  stdlib.assert(approx(aliceBal, 50));
  stdlib.assert(approx(bobBal, 151));
};

(async () => {
  await run(backendNet, false);
  await run(backendTok, true);
})();
