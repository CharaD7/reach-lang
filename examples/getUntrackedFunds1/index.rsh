'reach 0.1';

export const main = (aliceInterface, pubTok) => Reach.App(() => {
  const A = Participant('Alice', aliceInterface);
  const B = Participant('Bob', {
    gimmeSomeDough: Fun([Address], Null),
  });
  init();

  const [ getUntracked, pay, bal ] = pubTok(A);
  const x1 = getUntracked();

  transfer(pay(x1)).to(A);
  commit();

  B.only(() => {
    interact.gimmeSomeDough(getAddress());
  });
  B.publish();

  const x = getUntracked();

  transfer(pay(x)).to(B);
  transfer(bal()).to(B);
  commit();

  exit();
});

export const mainNet = main({ }, (A) => {
  A.publish();
  const pay = (x) => [x];
  return [ getUntrackedFunds, pay, balance ];
});

export const mainTok = main({ tokenId: Token }, (A) => {
  A.only(() => {
    const token = declassify(interact.tokenId);
  });
  A.publish(token);
  commit();
  A.pay([ [1, token] ]);
  commit();
  A.publish();

  const getUntracked = () => getUntrackedFunds(token);
  const pay = (x) => [0, [x, token]]
  const bal = () => [[balance(token), token]];
  return [ getUntracked, pay, bal ];
});
