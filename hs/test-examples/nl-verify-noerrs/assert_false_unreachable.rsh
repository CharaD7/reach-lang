'reach 0.1';

export const main = Reach.App(
  {}, [["A", {x: UInt256}]], (A) => {
    A.only(() => {
      const _x = interact.x;
      if (_x >= 0) {
        if (_x < 0) {
          // XXX Known failing test case
          // Uncomment the following assert
          // assert(false);
        } else {
          // nothing
        }
      } else {
        // nothing
      }
    });
  }
);
