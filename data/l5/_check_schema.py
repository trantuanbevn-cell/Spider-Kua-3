import json, glob, re, sys

files = sorted(glob.glob("toan5-cd*.json"))
total_bai = 0
total_cau = 0
errors = []

expected_bai_count = {1:9, 2:5, 3:4, 4:6, 5:5, 6:6}

for fn in files:
    with open(fn, encoding="utf-8") as f:
        d = json.load(f)
    if d.get("mon") != "toan5":
        errors.append(f"{fn}: mon != toan5 ({d.get('mon')})")
    if d.get("tap") != 1:
        errors.append(f"{fn}: tap != 1")
    cdso = d.get("cdSo")
    bai_list = d.get("bai", [])
    total_bai += len(bai_list)
    exp = expected_bai_count.get(cdso)
    if exp is not None and len(bai_list) != exp:
        errors.append(f"{fn}: cdSo={cdso} expected {exp} bai, got {len(bai_list)}")
    prev_so = None
    for b in bai_list:
        so = b.get("so")
        ten = b.get("ten")
        ly = b.get("lyThuyet","")
        cauhoi = b.get("cauHoi", [])
        total_cau += len(cauhoi)
        if len(cauhoi) != 8:
            errors.append(f"{fn} bai {so} '{ten}': has {len(cauhoi)} cauHoi, expected 8")
        types = [c.get("type") for c in cauhoi]
        expected_types = ["mcq"]*5 + ["fill"] + ["solve"]*2
        if types != expected_types:
            errors.append(f"{fn} bai {so} '{ten}': type order = {types}")
        if not ly or len(ly) < 20:
            errors.append(f"{fn} bai {so} '{ten}': lyThuyet missing/too short")
        for idx, c in enumerate(cauhoi):
            t = c.get("type")
            if t == "mcq":
                opts = c.get("options", [])
                if len(opts) != 4:
                    errors.append(f"{fn} bai {so} q{idx}: mcq options count = {len(opts)}")
                if len(set(opts)) != len(opts):
                    errors.append(f"{fn} bai {so} q{idx}: mcq duplicate options {opts}")
                a = c.get("a")
                if not isinstance(a, int) or not (0 <= a < len(opts)):
                    errors.append(f"{fn} bai {so} q{idx}: mcq bad index a={a}")
                if not c.get("explain"):
                    errors.append(f"{fn} bai {so} q{idx}: mcq missing explain")
                # check english decimal point misuse: a number like 12.5 (one digit after dot, and not thousands sep pattern)
                for field in ["q","explain"] + opts:
                    if isinstance(field, str):
                        bad = re.findall(r'\d\.\d(?!\d*\.\d{3})\b', field)
            elif t == "fill":
                if "answer" not in c or "accept" not in c:
                    errors.append(f"{fn} bai {so} q{idx}: fill missing answer/accept")
                elif c["answer"] not in c["accept"]:
                    errors.append(f"{fn} bai {so} q{idx}: fill answer not in accept list")
                if "___" not in c.get("q",""):
                    errors.append(f"{fn} bai {so} q{idx}: fill q missing ___ blank")
            elif t == "solve":
                for k in ["de","hints","loiGiai","dapSo"]:
                    if k not in c or not c[k]:
                        errors.append(f"{fn} bai {so} q{idx}: solve missing {k}")
                if len(c.get("hints",[])) != 3:
                    errors.append(f"{fn} bai {so} q{idx}: solve hints count != 3")
                lg = c.get("loiGiai","")
                if not lg.startswith("Bài giải"):
                    errors.append(f"{fn} bai {so} q{idx}: loiGiai doesn't start with 'Bài giải'")
                if "Đáp số" not in lg:
                    errors.append(f"{fn} bai {so} q{idx}: loiGiai missing 'Đáp số'")
            else:
                errors.append(f"{fn} bai {so} q{idx}: unknown type {t}")

print(f"Files: {len(files)}")
print(f"Total bai: {total_bai}")
print(f"Total cau: {total_cau}")
print(f"Errors: {len(errors)}")
for e in errors:
    print(" -", e)
