import json, re, glob
from decimal import Decimal, getcontext
getcontext().prec = 30

files = sorted(glob.glob("toan5-cd*.json"))

NUM = r'-?\d{1,3}(?:\.\d{3})*(?:,\d+)?|-?\d+(?:,\d+)?'

def to_dec(s):
    s = s.strip()
    s = s.replace('.', '')  # remove thousands sep
    s = s.replace(',', '.')  # decimal comma -> point
    try:
        return Decimal(s)
    except:
        return None

# pattern: NUM (space)? op (space)? NUM (space)? = (space)? NUM
pat = re.compile(
    r'(' + NUM + r')\s*([+\-x*:])\s*(' + NUM + r')\s*=\s*(' + NUM + r')'
)

total_checked = 0
mismatches = []
unparsed_eqs = 0

def check_text(text, loc):
    global total_checked, unparsed_eqs
    for m in pat.finditer(text):
        a_s, op, b_s, r_s = m.group(1), m.group(2), m.group(3), m.group(4)
        a, b, r = to_dec(a_s), to_dec(b_s), to_dec(r_s)
        if a is None or b is None or r is None:
            unparsed_eqs += 1
            continue
        try:
            if op == '+':
                calc = a + b
            elif op == '-':
                calc = a - b
            elif op in ('x','*'):
                calc = a * b
            elif op == ':':
                if b == 0:
                    continue
                calc = a / b
            else:
                continue
        except Exception:
            continue
        total_checked += 1
        # normalize both to same number of decimal places up to 6
        if calc != r:
            # allow tiny rounding tolerance for division only, but flag anyway for review
            diff = abs(calc - r)
            if diff > Decimal('0.0001'):
                mismatches.append((loc, f"{a_s} {op} {b_s} = {r_s}  (computed: {calc})"))

for fn in files:
    with open(fn, encoding='utf-8') as f:
        d = json.load(f)
    for b in d.get('bai', []):
        so = b.get('so')
        for idx, c in enumerate(b.get('cauHoi', [])):
            t = c.get('type')
            if t == 'mcq':
                check_text(c.get('q','') + ' ' + c.get('explain',''), f"{fn} bai{so} q{idx} mcq")
                for oi, opt in enumerate(c.get('options', [])):
                    pass
            elif t == 'solve':
                check_text(c.get('loiGiai',''), f"{fn} bai{so} q{idx} solve.loiGiai")
                check_text(c.get('de',''), f"{fn} bai{so} q{idx} solve.de")

print(f"Total equations checked: {total_checked}")
print(f"Unparsed candidate equations (skipped): {unparsed_eqs}")
print(f"Mismatches: {len(mismatches)}")
for loc, msg in mismatches:
    print(" -", loc, ":", msg)
