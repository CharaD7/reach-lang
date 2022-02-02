'reach 0.1';
'use strict';

export const main = Reach.App(() => {
  const A = Participant('Alice', {
    token           : Token,
    requestMoney    : Fun([Address], Null),
    requestClawback : Fun([Address, UInt], Null),
    checkBal        : Fun([Address], Null)
  });
  init();

  A.only(() => {
    const token = declassify(interact.token);
  });
  A.publish(token);
  commit();

  const addr = getAddress();
  A.interact.requestMoney(addr);
  A.interact.checkBal(addr);

  A.publish();
  commit();

  const funds = getUntrackedFunds(token);
  A.interact.requestClawback(addr, funds);
  A.interact.checkBal(addr);

  A.publish();
  commit();

  A.interact.checkBal(addr);

  A.publish();
  transfer(funds, token).to(A);
  commit();

});
