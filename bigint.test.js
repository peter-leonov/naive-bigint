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

function norm(xs) {
  let zeroes = 0;
  // j > 0 to leave the last zero
  for (let j = xs.length - 1; j > 0; j--) {
    if (xs[j] == 0) {
      zeroes++;
      continue;
    }
    break;
  }
  const res = xs.slice(0, xs.length - zeroes);

  // turn -0 to +0
  if (res.length == 1 && res[0] == 0) {
    return res;
  }
  res.isNegative = xs.isNegative;
  return res;
}

describe("norm", () => {
  it("explicit", () => {
    expect(str(norm([0]))).toBe("0");
    expect(str(norm([1]))).toBe("1");
    expect(str(norm([1, 0, 0, 0]))).toBe("1");
  });
  it("implicit", () => {
    // int() calls norm() inside
    expect(str(int("-0"))).toBe("0");
    expect(str(int("0"))).toBe("0");
    expect(str(int("1"))).toBe("1");
    expect(str(int("001"))).toBe("1");
    expect(str(int("0001"))).toBe("1");
    expect(str(int("00000001"))).toBe("1");
  });
});

function neg(xs) {
  const res = xs.slice();
  res.isNegative = !xs.isNegative;
  return res;
}

function int(str) {
  if (str[0] == "-") {
    const res = str.split("").reverse();
    res.pop();
    const neg = res.map(Number);
    neg.isNegative = true;
    return norm(neg);
  } else {
    return norm(
      str
        .split("")
        .reverse()
        .map(Number)
    );
  }
}

const ZERO = [0];

function str(a) {
  return (a.isNegative ? "-" : "") + a.reverse().join("");
}

describe("int+str", () => {
  it("positive", () => {
    expect(str(int("0"))).toBe("0");
    expect(str(int("1"))).toBe("1");
    expect(str(int("1234"))).toBe("1234");
  });
  it("negative", () => {
    expect(str(int("-0"))).toBe("0");
    expect(str(int("-1"))).toBe("-1");
    expect(str(int("-1234"))).toBe("-1234");
  });
});

function absCmp(xs, ys) {
  // expect xs and ys are normalised
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
    expect(absCmp(int("-11"), int("1"))).toBe(1);
    expect(absCmp(int("11"), int("-1"))).toBe(1);
    expect(absCmp(int("-11"), int("-1"))).toBe(1);
    expect(absCmp(int("1"), int("11"))).toBe(-1);
    expect(absCmp(int("0"), int("0"))).toBe(0);
    expect(absCmp(int("1"), int("0"))).toBe(1);
    expect(absCmp(int("0"), int("1"))).toBe(-1);
    expect(absCmp(int("1111113"), int("1111112"))).toBe(1);
    expect(absCmp(int("1111112"), int("1111113"))).toBe(-1);
  });
});

function addAbs(xs, ys) {
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

function add(a, b) {
  if (a.isNegative) {
    if (b.isNegative) {
      // (-a) + (-b) -> -(a + b)
      return neg(addAbs(b, a));
    } else {
      // (-a) + (+b) -> b - a
      return subPositives(b, a);
    }
  } else {
    if (b.isNegative) {
      // (+a) + (-b) -> a - b
      return subPositives(a, b);
    } else {
      // (+a) + (+b) ->
      return addAbs(a, b);
    }
  }
}

describe("add", () => {
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

  it("equal + equal", () => {
    expect(str(add(int("1"), int("1")))).toBe("2");
    expect(str(add(int("123"), int("123")))).toBe("246");
  });

  it("bigger + smaller", () => {
    expect(str(add(int("11"), int("1")))).toBe("12");
    expect(str(add(int("345"), int("123")))).toBe("468");
    expect(str(add(int("3456"), int("123")))).toBe("3579");
    expect(str(add(int("888"), int("887")))).toBe("1775");
    expect(str(add(int("10"), int("1")))).toBe("11");
    expect(str(add(int("100"), int("3")))).toBe("103");
  });

  it("smaller + bigger", () => {
    expect(str(add(int("1"), int("2")))).toBe("3");
    expect(str(add(int("9"), int("11")))).toBe("20");
    expect(str(add(int("888"), int("898")))).toBe("1786");
  });

  it("bigger + (-smaller)", () => {
    expect(str(add(int("10"), int("-2")))).toBe("8");
    expect(str(add(int("102"), int("-101")))).toBe("1");
  });

  it("smaller + (-bigger)", () => {
    expect(str(add(int("1"), int("-9")))).toBe("-8");
    expect(str(add(int("99"), int("-101")))).toBe("-2");
  });

  it("(-equal) + (-equal)", () => {
    expect(str(add(int("-0"), int("-0")))).toBe("0");
    expect(str(add(int("-1"), int("-1")))).toBe("-2");
  });
});

// substracts smaller from bigger
function subAbs(xs, ys) {
  const res = [];
  let overflow = 0;

  for (const [x, y] of zip(xs, ys, 0)) {
    const diff = x - y - overflow;
    if (diff < 0) {
      overflow = 1;
      res.push(10 + diff);
    } else {
      overflow = 0;
      res.push(diff);
    }
  }

  return norm(res);
}

function subPositives(a, b) {
  switch (absCmp(a, b)) {
    case 0:
      // xs == ys
      return ZERO;
    case -1:
      // xs < yx
      return neg(subAbs(b, a));
    case 1:
    default:
      // xs > ys
      return subAbs(a, b);
  }
}

function sub(a, b) {
  if (a.isNegative) {
    if (b.isNegative) {
      // (-a) - (-b) -> b - a
      return subPositives(b, a);
    } else {
      // (-a) - (+b) -> -(a + b)
      return neg(addAbs(a, b));
    }
  } else {
    if (b.isNegative) {
      // (+a) - (-b) -> a + b
      return addAbs(a, b);
    } else {
      // (+a) - (+b) -> a - b
      return subPositives(a, b);
    }
  }
}

describe("sub", () => {
  it("equal - equal", () => {
    expect(str(sub(int("1"), int("1")))).toBe("0");
    expect(str(sub(int("123"), int("123")))).toBe("0");
  });

  it("bigger - smaller", () => {
    expect(str(sub(int("11"), int("1")))).toBe("10");
    expect(str(sub(int("345"), int("123")))).toBe("222");
    expect(str(sub(int("3456"), int("123")))).toBe("3333");
    expect(str(sub(int("888"), int("887")))).toBe("1");
    expect(str(sub(int("10"), int("1")))).toBe("9");
    expect(str(sub(int("100"), int("3")))).toBe("97");
  });

  it("smaller - bigger", () => {
    expect(str(sub(int("1"), int("2")))).toBe("-1");
    expect(str(sub(int("9"), int("11")))).toBe("-2");
    expect(str(sub(int("888"), int("898")))).toBe("-10");
  });

  it("bigger - (-smaller)", () => {
    expect(str(sub(int("10"), int("-2")))).toBe("12");
    expect(str(sub(int("102"), int("-101")))).toBe("203");
  });

  it("smaller - (-bigger)", () => {
    expect(str(sub(int("1"), int("-9")))).toBe("10");
    expect(str(sub(int("99"), int("-101")))).toBe("200");
  });

  it("(-equal) - (-equal)", () => {
    expect(str(sub(int("-0"), int("-0")))).toBe("0");
    expect(str(sub(int("-1"), int("-1")))).toBe("0");
  });
});

function multAbs(a, b) {
  return a;
}

function mult(a, b) {
  const res = multAbs(a, b);
  res.isNegative = a.isNegative ? !b.isNegative : b.isNegative;
  return res;
}

describe("mult", () => {
  it("sign", () => {
    expect(str(mult(int("1"), int("1")))).toBe("1");
    expect(str(mult(int("-1"), int("1")))).toBe("-1");
    expect(str(mult(int("1"), int("-1")))).toBe("-1");
    expect(str(mult(int("-1"), int("-1")))).toBe("1");
  });
});
