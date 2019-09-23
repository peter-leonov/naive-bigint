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

function str(a) {
  return (a.isNegative ? "-" : "") + a.reverse().join("");
}

function add(xs, ys) {
  const res = [];
  let overflow = 0;
  for (const [x, y] of zip(xs, ys, 0)) {
    const sum = x + y + overflow;
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

function sub(xs, ys) {
  const res = [];
  let overflow = 0;
  for (const [x, y] of zip(xs, ys, 0)) {
    const dif = x - y - overflow;
    if (dif < 0) {
      overflow = 1;
      res.push(10 + dif);
    } else {
      overflow = 0;
      res.push(dif);
    }
  }

  let zeroes = 0;
  // j > 0 to leave the last zero
  for (let j = res.length - 1; j > 0; j--) {
    if (res[j] == 0) {
      zeroes++;
    }
    break;
  }
  res.length -= zeroes;

  if (overflow != 0) {
    res.isNegative = true;
  }

  return res;
}

function absCmp(xs, ys) {
  if (xs.length > ys.length) return 1;
  if (xs.length < ys.length) return -1;

  for (const [x, y] of zip(xs, ys)) {
    if (x > y) return 1;
    if (x < y) return -1;
  }

  return 0;
}

describe("absCmp", () => {
  it("simple", () => {
    expect(absCmp(int("11"), int("1"))).toBe(1);
    expect(absCmp(int("1"), int("11"))).toBe(-1);
    expect(absCmp(int("0"), int("0"))).toBe(0);
    expect(absCmp(int("1"), int("0"))).toBe(1);
    expect(absCmp(int("0"), int("1"))).toBe(-1);
    expect(absCmp(int("1111113"), int("1111112"))).toBe(1);
    expect(absCmp(int("1111112"), int("1111113"))).toBe(-1);
  });
});

describe("minus", () => {
  it("simple", () => {
    expect(str(sub(int("11"), int("1")))).toBe("10");
    expect(str(sub(int("345"), int("123")))).toBe("222");
    expect(str(sub(int("3456"), int("123")))).toBe("3333");
  });

  it("overflow", () => {
    expect(str(sub(int("10"), int("1")))).toBe("9");
    expect(str(sub(int("100"), int("3")))).toBe("97");
  });

  it("negative", () => {
    // expect(str(sub(int("1"), int("2")))).toBe("-1");
  });
});

describe("plus", () => {
  it("simple", () => {
    expect(str(add(int("123"), int("345")))).toBe("468");
    expect(str(add(int("2345"), int("111")))).toBe("2456");
  });

  it("overflow", () => {
    expect(str(add(int("9"), int("1")))).toBe("10");
    expect(str(add(int("99"), int("1")))).toBe("100");
    expect(str(add(int("99999"), int("1")))).toBe("100000");
    expect(str(add(int("99"), int("99")))).toBe("198");
  });
});
