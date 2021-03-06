// if (God forbid) you are reading this code to evaluate my skills
// then stop immediately and read something else: the only cool
// part is TDD which is invisible as all is over already :)

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
  expect(zip([3, 5, 0, 0], [5, 0, 0, 0], 0)).toEqual([
    [3, 5],
    [5, 0],
    [0, 0],
    [0, 0]
  ]);
});

const BASE = 10;

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
  str = String(str);
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
const ONE = [1];
const NEGATIVE_ONE = neg([1]);

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

function absCmp(a, b) {
  // expect xs and ys are normalised
  if (a.length > b.length) return 1;
  if (a.length < b.length) return -1;

  for (const [x, y] of zip(a, b, 0).reverse()) {
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
    expect(absCmp(int("3500"), int("5000"))).toBe(-1);
    expect(absCmp(int("21"), int("1200"))).toBe(-1);
  });
});

function addAbs(xs, ys) {
  const res = [];
  let overflow = 0;
  for (const [x, y] of zip(xs, ys, 0)) {
    const sum = x + y + overflow;
    if (sum >= BASE) {
      overflow = 1;
      res.push(sum - BASE);
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
      res.push(BASE + diff);
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
    expect(str(sub(int("3500"), int("500")))).toBe("3000");
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

function multBy(xs, a) {
  if (a == 0) return ZERO;
  if (a == 1) return xs;

  const res = [];
  let overflow = 0;
  for (const x of xs) {
    const product = x * a + overflow;
    const digit = product % BASE;
    overflow = (product - digit) / BASE;
    res.push(digit);
  }
  if (overflow > 0) res.push(overflow);

  return res;
}

function multAbs(xs, ys) {
  let sum = ZERO;
  let shifted = xs.slice();
  for (const y of ys) {
    sum = add(sum, multBy(shifted, y));

    shifted.unshift(0);
  }
  return sum;
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

  it("simple", () => {
    expect(str(mult(int("123"), int("0")))).toBe("0");
    expect(str(mult(int("2"), int("3")))).toBe("6");
    expect(str(mult(int("22"), int("3")))).toBe("66");
    expect(str(mult(int("123"), int("3")))).toBe("369");
  });

  it("overflow", () => {
    expect(str(mult(int("5"), int("2")))).toBe("10");
    expect(str(mult(int("55"), int("2")))).toBe("110");
  });

  it("multiple", () => {
    expect(str(mult(int("123"), int("321")))).toBe("39483");
    expect(str(mult(int("18234761"), int("98751265")))).toBe(
      String(18234761 * 98751265)
    );
    expect(str(mult(int("9274523659823746518234761"), int("98751265")))).toBe(
      String(9274523659823746518234761n * 98751265n)
    );
  });
});

function shift(a, n) {
  if (n <= 0) return a;
  return Array.from({ length: n }, () => 0).concat(a);
}

describe("shift", () => {
  it("simple", () => {
    expect(str(shift(int("1"), 0))).toBe("1");
    expect(str(shift(int("1"), 1))).toBe("10");
    expect(str(shift(int("1"), 2))).toBe("100");
    expect(str(shift(int("123"), 3))).toBe("123000");
  });
});

function eqZero(a) {
  return a.length == 1 && a[0] == 0;
}

describe("eqZero", () => {
  it("zero", () => {
    expect(eqZero(int("0"))).toBe(true);
  });

  it("non-zero", () => {
    expect(eqZero(int("1"))).toBe(false);
    expect(eqZero(int("10"))).toBe(false);
  });
});

function modExp(a, b) {
  for (let exp = a.length - b.length; exp >= 0; exp--) {
    const candidate = shift(b, exp);
    switch (absCmp(a, candidate)) {
      case -1:
        // candidate too big
        continue;
      case 0:
        // candidate fits perfectly
        return [shift(ONE, exp), ZERO];
      case 1:
      default:
        return [shift(ONE, exp), subAbs(a, candidate)];
    }
  }

  // a < b
  return false;
}

describe("modExp", () => {
  it("smaller", () => {
    expect(modExp(int("10"), int("50"))).toBe(false);
  });

  it("equal", () => {
    expect(modExp(int("10"), int("10"))).toEqual([int("1"), ZERO]);
  });

  it("mod zero", () => {
    expect(modExp(int("100"), int("1"))).toEqual([int("100"), ZERO]);
    expect(modExp(int("450"), int("45"))).toEqual([int("10"), ZERO]);
    expect(modExp(int("7000"), int("70"))).toEqual([int("100"), ZERO]);
  });

  it("with mod", () => {
    expect(modExp(int("101"), int("1"))).toEqual([int("100"), int("1")]);
    expect(modExp(int("467"), int("45"))).toEqual([int("10"), int("17")]);
    expect(modExp(int("9000"), int("70"))).toEqual([int("100"), int("2000")]);
    expect(modExp(int("4000"), int("5"))).toEqual([int("100"), int("3500")]);
    expect(modExp(int("3500"), int("5"))).toEqual([int("100"), int("3000")]);
  });
});

function divAbs(a, b) {
  let rest = a;
  let quotient = ZERO;
  for (;;) {
    const r = modExp(rest, b);
    if (!r) {
      // rest < b
      break;
    }
    const [mult, mod] = r;
    quotient = addAbs(quotient, mult);
    rest = mod;
  }
  // rest here = a % b
  return quotient;
}

function div(a, b) {
  if (eqZero(b)) throw "division by zero";

  const isNegative = a.isNegative ? !b.isNegative : b.isNegative;
  switch (absCmp(a, b)) {
    case -1:
      return ZERO;
    case 0:
      return isNegative ? NEGATIVE_ONE : ONE;
  }
  const res = divAbs(a, b);
  res.isNegative = a.isNegative ? !b.isNegative : b.isNegative;
  return res;
}

describe("div", () => {
  it("sign", () => {
    expect(str(div(int("1"), int("1")))).toBe("1");
    expect(str(div(int("-1"), int("1")))).toBe("-1");
    expect(str(div(int("1"), int("-1")))).toBe("-1");
    expect(str(div(int("-1"), int("-1")))).toBe("1");
  });

  it("simple", () => {
    expect(str(div(int("8"), int("2")))).toBe("4");
    expect(str(div(int("88"), int("2")))).toBe("44");
  });

  it("equal", () => {
    expect(str(div(int("8"), int("8")))).toBe("1");
    expect(str(div(int("123"), int("123")))).toBe("1");
    expect(str(div(int("123"), int("-123")))).toBe("-1");
  });

  it("zero / x", () => {
    expect(str(div(int("0"), int("8")))).toBe("0");
    expect(str(div(int("0"), int("123")))).toBe("0");
  });

  it("x / zero", () => {
    expect(() => str(div(int("8"), int("0")))).toThrow("zero");
    expect(() => str(div(int("123"), int("0")))).toThrow("zero");
  });

  it("smaller / bigger", () => {
    expect(str(div(int("5"), int("6")))).toBe("0");
    expect(str(div(int("2"), int("321")))).toBe("0");
  });

  it("overflow", () => {
    expect(str(div(int("5000"), int("5")))).toBe("1000");
    expect(str(div(int("4000"), int("5")))).toBe("800");
    expect(str(div(int("5500"), int("5")))).toBe("1100");
    expect(str(div(int("3528"), int("5")))).toBe("705");
  });

  it("big / big", () => {
    expect(str(div(int("2374918236873462341628346"), int("19238462345")))).toBe(
      String(2374918236873462341628346n / 19238462345n)
    );
    expect(
      str(
        div(
          int("8748523465826348957629834658273468957263845762834756"),
          int("29345682736598637465374656547657465728")
        )
      )
    ).toBe(
      String(
        8748523465826348957629834658273468957263845762834756n /
          29345682736598637465374656547657465728n
      )
    );
  });

  it("big / small", () => {
    expect(
      str(
        div(
          int("8748523465826348957629834658273468957263845762834756"),
          int("123")
        )
      )
    ).toBe(
      String(8748523465826348957629834658273468957263845762834756n / 123n)
    );
  });
});
