(function (global, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory(require("decimal.js"));
  } else {
    global.OrdinalLib = factory(global.Decimal);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (Decimal) {
  Decimal.set({ precision: 40, rounding: 4 });

  var MAX_VALUE = new Decimal("1.79e308");

  function _tetrDecimal(base, height) {
    if (height === 0) return new Decimal(1);
    var result = base;
    for (var i = 1; i < height; i++) {
      result = Decimal.pow(base, result);
    }
    return result;
  }

  var SVO_TETRATED_MAX_VALUE = (function () {
    var acc = MAX_VALUE;
    for (var i = 0; i < 7; i++) {
      acc = Decimal.pow(10, acc);
    }
    return acc;
  })();

  function OrdinalNumError(msg) {
    this.name = "OrdinalNumError";
    this.message = msg || "OrdinalNum error";
    var tmp = new Error(this.message);
    this.stack = tmp.stack;
  }
  OrdinalNumError.prototype = Object.create(Error.prototype);
  OrdinalNumError.prototype.constructor = OrdinalNumError;

  function OrdinalNum(spec) {
    if (!(this instanceof OrdinalNum)) return new OrdinalNum(spec);
    if (spec === undefined || spec === null) {
      this.type = "finite";
      this.value = new Decimal(0);
    } else if (spec instanceof OrdinalNum) {
      this.type = spec.type;
      this.value = spec.value;
      this.terms = spec.terms;
      this.args = spec.args;
      this.nu = spec.nu;
      this.alpha = spec.alpha;
      this.tag = spec.tag;
    } else if (
      typeof spec === "number" ||
      typeof spec === "string" ||
      spec instanceof Decimal
    ) {
      this.type = "finite";
      this.value = new Decimal(spec);
    } else if (spec && typeof spec === "object" && spec.type) {
      this.type = spec.type;
      this.value = spec.value;
      this.terms = spec.terms;
      this.args = spec.args;
      this.nu = spec.nu;
      this.alpha = spec.alpha;
      this.tag = spec.tag;
    } else {
      this.type = "finite";
      this.value = new Decimal(0);
    }
  }

  OrdinalNum.ZERO = new OrdinalNum(0);
  OrdinalNum.ONE = new OrdinalNum(1);

  function _finite(n) {
    var o = new OrdinalNum();
    o.type = "finite";
    o.value = n instanceof Decimal ? n : new Decimal(n);
    return o;
  }

  function _cnf(terms) {
    var o = new OrdinalNum();
    o.type = "cnf";
    o.terms = terms;
    return o;
  }

  function _veblen2(a, b) {
    var o = new OrdinalNum();
    o.type = "veblen2";
    o.args = [a, b];
    return o;
  }

  function _veblenN(args) {
    var o = new OrdinalNum();
    o.type = "veblenN";
    o.args = args.slice();
    return o;
  }

  function _buchholzN(nu, alpha) {
    var o = new OrdinalNum();
    o.type = "buchholz";
    o.nu = nu;
    o.alpha = alpha;
    return o;
  }

  function _svo(tag) {
    var o = new OrdinalNum();
    o.type = "svo";
    o.tag = tag || "SVO";
    return o;
  }

  function isZero(a) {
    return a.type === "finite" && a.value.isZero();
  }

  function isOne(a) {
    return a.type === "finite" && a.value.equals(1);
  }

  function isFinite_(a) {
    return a.type === "finite";
  }

  function compareOrdinals(a, b) {
    if (a === b) return 0;
    if (a.type === "svo" && b.type === "svo") return 0;
    if (a.type === "svo") return 1;
    if (b.type === "svo") return -1;

    if (a.type === "buchholz" && b.type === "buchholz") {
      var nc = compareOrdinals(a.nu, b.nu);
      if (nc !== 0) return nc;
      return compareOrdinals(a.alpha, b.alpha);
    }
    if (a.type === "buchholz") return 1;
    if (b.type === "buchholz") return -1;

    if (a.type === "veblenN" && b.type === "veblenN") {
      var la = a.args.length;
      var lb = b.args.length;
      var lmin = la < lb ? la : lb;
      for (var i = 0; i < lmin; i++) {
        var c = compareOrdinals(a.args[i], b.args[i]);
        if (c !== 0) return c;
      }
      if (la !== lb) return la > lb ? 1 : -1;
      return 0;
    }
    if (a.type === "veblenN") return 1;
    if (b.type === "veblenN") return -1;

    if (a.type === "veblen2" && b.type === "veblen2") {
      var c0 = compareOrdinals(a.args[0], b.args[0]);
      if (c0 !== 0) return c0;
      return compareOrdinals(a.args[1], b.args[1]);
    }
    if (a.type === "veblen2") return 1;
    if (b.type === "veblen2") return -1;

    if (a.type === "cnf" && b.type === "cnf") {
      var ta = a.terms;
      var tb = b.terms;
      var n = ta.length < tb.length ? ta.length : tb.length;
      for (var j = 0; j < n; j++) {
        var ec = compareOrdinals(ta[j].exp, tb[j].exp);
        if (ec !== 0) return ec;
        var cc = compareOrdinals(ta[j].coeff, tb[j].coeff);
        if (cc !== 0) return cc;
      }
      if (ta.length !== tb.length) return ta.length > tb.length ? 1 : -1;
      return 0;
    }
    if (a.type === "cnf") return 1;
    if (b.type === "cnf") return -1;

    if (a.type === "finite" && b.type === "finite") {
      return a.value.comparedTo(b.value);
    }
    return 0;
  }

  function addOrdinals(a, b) {
    if (isZero(b)) return a;
    if (isZero(a)) return b;

    if (a.type === "finite" && b.type === "finite") {
      return _finite(a.value.plus(b.value));
    }

    if (b.type === "finite" && a.type === "cnf") {
      var newTerms = a.terms.slice(0, a.terms.length - 1);
      var lastTerm = a.terms[a.terms.length - 1];
      if (isZero(lastTerm.exp)) {
        var newCoeff = addOrdinals(lastTerm.coeff, b);
        newTerms.push({ exp: lastTerm.exp, coeff: newCoeff });
      } else {
        newTerms.push(lastTerm);
        newTerms.push({ exp: _finite(new Decimal(0)), coeff: b });
      }
      return _cnf(newTerms);
    }

    if (a.type === "finite" && b.type === "cnf") {
      return b;
    }

    if (a.type === "cnf" && b.type === "cnf") {
      var bFirst = b.terms[0];
      var filtered = [];
      for (var i = 0; i < a.terms.length; i++) {
        var cmp = compareOrdinals(a.terms[i].exp, bFirst.exp);
        if (cmp > 0) filtered.push(a.terms[i]);
        else break;
      }
      return _cnf(filtered.concat(b.terms));
    }

    var newT = [];
    if (a.type === "cnf") {
      newT = a.terms.slice();
    } else {
      newT = [{ exp: _ordinalExp(a), coeff: _finite(new Decimal(1)) }];
    }
    newT = newT.concat(_toCNFTerms(b));
    return _cnf(newT);
  }

  function _ordinalExp(o) {
    if (o.type === "finite") {
      if (o.value.isZero()) return _finite(new Decimal(0));
      return _finite(new Decimal(1));
    }
    if (o.type === "cnf") {
      return o.terms[0].exp;
    }
    return o;
  }

  function _toCNFTerms(o) {
    if (o.type === "cnf") return o.terms.slice();
    if (o.type === "finite") {
      if (o.value.isZero()) return [];
      return [{ exp: _finite(new Decimal(0)), coeff: o }];
    }
    return [{ exp: o, coeff: _finite(new Decimal(1)) }];
  }

  function mulOrdinals(a, b) {
    if (isZero(a) || isZero(b)) return OrdinalNum.ZERO;
    if (isOne(a)) return b;
    if (isOne(b)) return a;

    if (a.type === "finite" && b.type === "finite") {
      return _finite(a.value.times(b.value));
    }

    if (b.type === "finite") {
      if (a.type === "cnf") {
        var newTerms = a.terms.slice(0, a.terms.length - 1);
        var last = a.terms[a.terms.length - 1];
        newTerms.push({ exp: last.exp, coeff: mulOrdinals(last.coeff, b) });
        return _cnf(newTerms);
      }
      return _cnf([{ exp: _ordinalExp(a), coeff: b }]);
    }

    if (a.type === "finite") {
      return b;
    }

    var aTerms = _toCNFTerms(a);
    var bTerms = _toCNFTerms(b);
    var result = OrdinalNum.ZERO;
    for (var i = 0; i < bTerms.length; i++) {
      var bt = bTerms[i];
      var partial;
      if (isZero(bt.exp)) {
        partial = _cnf(aTerms.slice(0, aTerms.length - 1).concat([
          { exp: aTerms[aTerms.length - 1].exp, coeff: mulOrdinals(aTerms[aTerms.length - 1].coeff, bt.coeff) }
        ]));
      } else {
        var newExp = addOrdinals(_toCNFOrdinal(aTerms.slice(0, 1)[0].exp), bt.exp);
        partial = _cnf([{ exp: newExp, coeff: bt.coeff }]);
      }
      result = addOrdinals(result, partial);
    }
    return result;
  }

  function _toCNFOrdinal(exp) {
    return exp;
  }

  function powOrdinals(a, b) {
    if (isZero(b)) return OrdinalNum.ONE;
    if (isOne(b)) return a;
    if (isZero(a)) return OrdinalNum.ZERO;
    if (isOne(a)) return OrdinalNum.ONE;

    if (a.type === "finite" && b.type === "finite") {
      return _finite(Decimal.pow(a.value, b.value));
    }

    if (b.type === "finite") {
      var result = OrdinalNum.ONE;
      var n = b.value.toNumber();
      for (var i = 0; i < n; i++) result = mulOrdinals(result, a);
      return result;
    }

    return _cnf([{ exp: mulOrdinals(a, b), coeff: _finite(new Decimal(1)) }]);
  }

  function omega() {
    return _cnf([{ exp: _finite(new Decimal(1)), coeff: _finite(new Decimal(1)) }]);
  }

  function _isOmega(o) {
    return (
      o.type === "cnf" &&
      o.terms.length === 1 &&
      isOne(o.terms[0].exp) &&
      isOne(o.terms[0].coeff)
    );
  }

  function _omegaPow(exp) {
    if (isZero(exp)) return _finite(new Decimal(1));
    return _cnf([{ exp: exp, coeff: _finite(new Decimal(1)) }]);
  }

  function epsilon(subscript) {
    if (subscript === undefined || subscript === null) subscript = OrdinalNum.ZERO;
    if (!(subscript instanceof OrdinalNum)) subscript = new OrdinalNum(subscript);
    return _veblen2(_finite(new Decimal(1)), subscript);
  }

  function zeta(subscript) {
    if (subscript === undefined || subscript === null) subscript = OrdinalNum.ZERO;
    if (!(subscript instanceof OrdinalNum)) subscript = new OrdinalNum(subscript);
    return _veblen2(_finite(new Decimal(2)), subscript);
  }

  function gamma(subscript) {
    if (subscript === undefined || subscript === null) subscript = OrdinalNum.ZERO;
    if (!(subscript instanceof OrdinalNum)) subscript = new OrdinalNum(subscript);
    return _veblen2(_omegaPow(omega()), subscript);
  }

  function ph(alpha, beta) {
    if (!(alpha instanceof OrdinalNum)) alpha = new OrdinalNum(alpha);
    if (!(beta instanceof OrdinalNum)) beta = new OrdinalNum(beta);
    if (isZero(alpha)) return _omegaPow(beta);
    return _veblen2(alpha, beta);
  }

  function psi(nu, alpha) {
    if (alpha === undefined) {
      alpha = nu;
      nu = OrdinalNum.ZERO;
    }
    if (!(nu instanceof OrdinalNum)) nu = new OrdinalNum(nu);
    if (!(alpha instanceof OrdinalNum)) alpha = new OrdinalNum(alpha);
    return _buchholzN(nu, alpha);
  }

  function buccholzordinal(nu, alpha) {
    return psi(nu, alpha);
  }

  function svoOrdinal() {
    return _svo("SVO");
  }

  function tetrSVO(base, height) {
    if (base === undefined) base = 10;
    if (height === undefined) height = 7;
    var b = new Decimal(base instanceof OrdinalNum ? base.value : base);
    var result = MAX_VALUE;
    for (var i = 0; i < (height instanceof OrdinalNum ? height.value.toNumber() : height); i++) {
      result = Decimal.pow(b, result);
    }
    var o = new OrdinalNum();
    o.type = "svo_tetrated";
    o.value = result;
    o.base = b;
    o.height = height instanceof OrdinalNum ? height.value.toNumber() : height;
    return o;
  }

  function _ordToString(o) {
    if (!o) return "0";
    if (o.type === "svo") return "SVO";
    if (o.type === "svo_tetrated") {
      return "10↑↑" + (o.height + 1) + "(1.79e308)";
    }
    if (o.type === "buchholz") {
      return "ψ_" + _ordToString(o.nu) + "(" + _ordToString(o.alpha) + ")";
    }
    if (o.type === "veblenN") {
      return "φ(" + o.args.map(_ordToString).join(",") + ")";
    }
    if (o.type === "veblen2") {
      var aStr = _ordToString(o.args[0]);
      var bStr = _ordToString(o.args[1]);
      if (o.args[0].type === "finite") {
        var aVal = o.args[0].value.toNumber();
        if (aVal === 1) return "ε_" + bStr;
        if (aVal === 2) return "ζ_" + bStr;
      }
      return "φ(" + aStr + "," + bStr + ")";
    }
    if (o.type === "cnf") {
      if (o.terms.length === 0) return "0";
      var parts = [];
      for (var i = 0; i < o.terms.length; i++) {
        var t = o.terms[i];
        var exp = t.exp;
        var coeff = t.coeff;
        var expStr = _ordToString(exp);
        var coeffStr = _ordToString(coeff);
        if (isZero(exp)) {
          parts.push(coeffStr);
        } else if (isOne(exp)) {
          if (isOne(coeff)) parts.push("ω");
          else parts.push("ω·" + coeffStr);
        } else {
          if (isOne(coeff)) parts.push("ω^" + expStr);
          else parts.push("ω^" + expStr + "·" + coeffStr);
        }
      }
      return parts.join("+");
    }
    if (o.type === "finite") {
      return o.value.toFixed();
    }
    return "?";
  }

  OrdinalNum.prototype.toString = function () {
    return _ordToString(this);
  };

  OrdinalNum.prototype.add = function (b) {
    if (!(b instanceof OrdinalNum)) b = new OrdinalNum(b);
    return addOrdinals(this, b);
  };

  OrdinalNum.prototype.mul = function (b) {
    if (!(b instanceof OrdinalNum)) b = new OrdinalNum(b);
    return mulOrdinals(this, b);
  };

  OrdinalNum.prototype.pow = function (b) {
    if (!(b instanceof OrdinalNum)) b = new OrdinalNum(b);
    return powOrdinals(this, b);
  };

  OrdinalNum.prototype.compare = function (b) {
    if (!(b instanceof OrdinalNum)) b = new OrdinalNum(b);
    return compareOrdinals(this, b);
  };

  OrdinalNum.prototype.lessThan = function (b) { return this.compare(b) < 0; };
  OrdinalNum.prototype.greaterThan = function (b) { return this.compare(b) > 0; };
  OrdinalNum.prototype.equals = function (b) { return this.compare(b) === 0; };

  function toBuccholz(o) {
    if (!o || !(o instanceof OrdinalNum)) throw new OrdinalNumError("toBuccholz requires OrdinalNum");
    return _toBuccholzStr(o);
  }

  function _toBuccholzStr(o) {
    if (o.type === "finite") {
      if (o.value.isZero()) return "0";
      return o.value.toFixed();
    }
    if (o.type === "svo") return "SVO";
    if (o.type === "buchholz") {
      return "psi_" + _toBuccholzStr(o.nu) + "(" + _toBuccholzStr(o.alpha) + ")";
    }
    if (o.type === "cnf") {
      if (o.terms.length === 0) return "0";
      var parts = [];
      for (var i = 0; i < o.terms.length; i++) {
        var t = o.terms[i];
        if (isZero(t.exp)) {
          parts.push(_toBuccholzStr(t.coeff));
        } else {
          parts.push("psi_0(psi_0(" + _toBuccholzStr(t.exp) + ")^" + _toBuccholzStr(t.coeff) + ")");
        }
      }
      return parts.join("+");
    }
    if (o.type === "veblen2") {
      return "phi(" + _toBuccholzStr(o.args[0]) + "," + _toBuccholzStr(o.args[1]) + ")";
    }
    if (o.type === "veblenN") {
      return "phi(" + o.args.map(_toBuccholzStr).join(",") + ")";
    }
    return "0";
  }

  function fromBuccholz(str) {
    if (typeof str !== "string") throw new OrdinalNumError("fromBuccholz requires string");
    str = str.trim();
    return _parseBuccholz(str);
  }

  function _parseBuccholz(str) {
    str = str.trim();
    if (str === "0") return OrdinalNum.ZERO;
    if (str === "SVO") return svoOrdinal();

    var psiMatch = str.match(/^psi_(.+)\((.+)\)$/);
    if (psiMatch) {
      var nuStr = psiMatch[1];
      var alphaStr = psiMatch[2];
      var nu = _parseBuccholz(nuStr);
      var alpha = _parseBuccholz(alphaStr);
      return _buchholzN(nu, alpha);
    }

    var phiMatch = str.match(/^phi\((.+)\)$/);
    if (phiMatch) {
      var inner = phiMatch[1];
      var args = _splitArgs(inner);
      var parsed = args.map(_parseBuccholz);
      if (parsed.length === 2) return _veblen2(parsed[0], parsed[1]);
      return _veblenN(parsed);
    }

    var plusIdx = _findTopLevelPlus(str);
    if (plusIdx >= 0) {
      var left = _parseBuccholz(str.substring(0, plusIdx));
      var right = _parseBuccholz(str.substring(plusIdx + 1));
      return addOrdinals(left, right);
    }

    var n = parseFloat(str);
    if (!isNaN(n)) return _finite(new Decimal(n));

    return OrdinalNum.ZERO;
  }

  function _splitArgs(str) {
    var args = [];
    var depth = 0;
    var start = 0;
    for (var i = 0; i < str.length; i++) {
      if (str[i] === "(" || str[i] === "[") depth++;
      else if (str[i] === ")" || str[i] === "]") depth--;
      else if (str[i] === "," && depth === 0) {
        args.push(str.substring(start, i).trim());
        start = i + 1;
      }
    }
    args.push(str.substring(start).trim());
    return args;
  }

  function _findTopLevelPlus(str) {
    var depth = 0;
    for (var i = str.length - 1; i >= 0; i--) {
      if (str[i] === ")" || str[i] === "]") depth++;
      else if (str[i] === "(" || str[i] === "[") depth--;
      else if (str[i] === "+" && depth === 0) return i;
    }
    return -1;
  }

  OrdinalNum.MAX_VALUE = MAX_VALUE;
  OrdinalNum.SVO_TETRATED_MAX_VALUE = SVO_TETRATED_MAX_VALUE;
  OrdinalNum.omega = omega;
  OrdinalNum.epsilon = epsilon;
  OrdinalNum.zeta = zeta;
  OrdinalNum.gamma = gamma;
  OrdinalNum.ph = ph;
  OrdinalNum.psi = psi;
  OrdinalNum.buccholzordinal = buccholzordinal;
  OrdinalNum.toBuccholz = toBuccholz;
  OrdinalNum.fromBuccholz = fromBuccholz;
  OrdinalNum.svoOrdinal = svoOrdinal;
  OrdinalNum.tetrSVO = tetrSVO;
  OrdinalNum.OrdinalNumError = OrdinalNumError;
  OrdinalNum.compare = compareOrdinals;
  OrdinalNum.add = addOrdinals;
  OrdinalNum.mul = mulOrdinals;
  OrdinalNum.pow = powOrdinals;
  OrdinalNum.finite = _finite;
  OrdinalNum.omegaPow = _omegaPow;
  OrdinalNum.cnf = _cnf;

  return {
    OrdinalNum: OrdinalNum,
    OrdinalNumError: OrdinalNumError,
    MAX_VALUE: MAX_VALUE,
    SVO_TETRATED_MAX_VALUE: SVO_TETRATED_MAX_VALUE,
    omega: omega,
    epsilon: epsilon,
    zeta: zeta,
    gamma: gamma,
    ph: ph,
    psi: psi,
    buccholzordinal: buccholzordinal,
    toBuccholz: toBuccholz,
    fromBuccholz: fromBuccholz,
    svoOrdinal: svoOrdinal,
    tetrSVO: tetrSVO
  };
});
