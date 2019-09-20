function zip(xs, ys, fill) {
  const res = [];

  if (xs.length <= ys.length) {
    let i = 0;
    for (; i < xs.length; i++) {
      res[i] = [xs[i], ys[i]];
    }
    for (; i < ys.length; i++) {
      res[i] = [fill, ys[i]];
    }

    return res;
  } else {
    let i = 0;
    for (; i < ys.length; i++) {
      res[i] = [xs[i], ys[i]];
    }
    for (; i < xs.length; i++) {
      res[i] = [xs[i], fill];
    }

    return res;
  }
}

test("zip", () => {
  expect(zip([], [], 0)).toEqual([]);
  expect(zip([1, 2], [], 0)).toEqual([[1, 0], [2, 0]]);
  expect(zip([], [1, 2], 0)).toEqual([[0, 1], [0, 2]]);
  expect(zip([1], [2], 0)).toEqual([[1, 2]]);
  expect(zip([1, 2, 3], [4, 5, 6], 0)).toEqual([[1, 4], [2, 5], [3, 6]]);
});

function int(str) {
  return str
    .split("")
    .map(Number)
    .reverse();
}

function add(xs, ys) {
  const res = [];
  let overflow = 0;
  for (const [x, y] of zip(xs, ys, 0)) {
    const sum = overflow + x + y;
    if (sum >= 10) {
      overflow = 1;
      res.push(sum - 10);
    } else {
      overflow = 0;
      res.push(sum);
    }
  }
  if (overflow != 0) {
    res.push(overflow);
  }
  return res;
}

function str(a) {
  return a.reverse().join("");
}

describe("plus", () => {
  it("simple", () => {
    expect(str(add(int("123"), int("345")))).toBe("468");
    expect(str(add(int("2345"), int("111")))).toBe("2456");
  });

  it("overflow", () => {
    expect(str(add(int("9"), int("1")))).toBe("10");
    expect(str(add(int("99"), int("1")))).toBe("100");
  });
});
