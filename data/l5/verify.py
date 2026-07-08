import json
from decimal import Decimal as D

with open("toan5-cd4.json", encoding="utf-8") as f:
    data = json.load(f)

def vn2d(s):
    # convert Vietnamese number string like "1.234,56" or "3,45" to Decimal
    s = s.strip()
    s = s.replace(".", "")  # remove thousands separator
    s = s.replace(",", ".")  # decimal comma -> dot
    return D(s)

errors = []

checks = [
    # (bai_so, index, a_str, op, b_str, expected_str)
    (19,0,"3,5","+","2,4","5,9"),
    (19,1,"12,7","+","5,8","18,5"),
    (19,2,"4,25","+","3,6","7,85"),
    (19,3,"15,08","+","6,7","21,78"),
    (19,4,"23,45","+","8,79","32,24"),
    (19,'fill',"8,4","+","1,6","10"),
    (19,'s1',"2,4","+","1,75","4,15"),
    (19,'s2a',"15,6","+","4,25","19,85"),
    (19,'s2b',"15,6","+","19,85","35,45"),

    (20,0,"8,7","-","3,2","5,5"),
    (20,1,"15,6","-","4,8","10,8"),
    (20,2,"9,25","-","3,4","5,85"),
    (20,3,"20,5","-","12,75","7,75"),
    (20,4,"34,08","-","15,69","18,39"),
    (20,'fill',"12,5","-","5","7,5"),
    (20,'s1',"4,5","-","1,25","3,25"),
    (20,'s2a',"25,8","-","8,3","17,5"),
    (20,'s2b',"17,5","-","6,5","11"),

    (21,0,"2,5","*","3","7,5"),
    (21,1,"1,4","*","2,5","3,5"),
    (21,2,"3,2","*","1,5","4,8"),
    (21,3,"0,4","*","0,6","0,24"),
    (21,4,"2,05","*","4","8,2"),
    (21,'fill',"1,2","*","3","3,6"),
    (21,'s1',"1,5","*","4","6"),
    (21,'s2a',"12,5","*","4","50"),
    (21,'s2b',"50","*","0,5","25"),

    (22,0,"8,4","/","2","4,2"),
    (22,1,"12,6","/","3","4,2"),
    (22,2,"7,2","/","0,4","18"),
    (22,3,"9,6","/","2,4","4"),
    (22,4,"15,75","/","5","3,15"),
    (22,'fill',"9,6","/","4","2,4"),
    (22,'s1',"8,4","/","4","2,1"),
    (22,'s2a',"25,5","/","1,5","17"),
    (22,'s2b',"17","-","6","11"),

    (23,0,"3,45","*","10","34,5"),
    (23,1,"3,45","*","100","345"),
    (23,2,"128,6","/","100","1,286"),
    (23,3,"7,2","*","0,1","0,72"),
    (23,4,"56","/","1000","0,056"),
    (23,'fill',"4,7","*","1000","4.700"),
    (23,'s1',"2,35","*","10","23,5"),
    (23,'s2a',"25,4","/","100","0,254"),
    (23,'s2b',"0,254","*","5","1,27"),

    (24,0,"5,6","+","3,4","9"),
    (24,1,"12,5","-","4,8","7,7"),
    (24,2,"2,4","*","5","12"),
    (24,3,"14,4","/","4","3,6"),
    (24,4,None,None,None,"8,5"),  # 3,5*2+1,5
    (24,'fill',"25,6","/","10","2,56"),
    (24,'s1',"2,5","*","32","80"),
    (24,'s2a',"12,4","*","2","24,8"),
    (24,'s2b',"12,4","+","24,8","37,2"),
    (24,'s2c',"45,6","-","37,2","8,4"),
]

for bai, idx, a,op,b,exp in checks:
    if a is None:
        # special case bai24 mcq4: 3,5*2+1,5
        val = vn2d("3,5")*vn2d("2") + vn2d("1,5")
    else:
        av, bv = vn2d(a), vn2d(b)
        if op=="+": val = av+bv
        elif op=="-": val = av-bv
        elif op=="*": val = av*bv
        elif op=="/": val = av/bv
    expv = vn2d(exp)
    if val != expv:
        errors.append(f"Bai {bai} idx {idx}: computed {val} but expected {expv} (a={a} op={op} b={b})")

if errors:
    print("ERRORS FOUND:")
    for e in errors:
        print(" -", e)
else:
    print("ALL ARITHMETIC CHECKS PASSED")

# Structural checks
assert len(data["bai"])==6, f"so bai = {len(data['bai'])}"
for b in data["bai"]:
    assert len(b["cauHoi"])==8, f"bai {b['so']} co {len(b['cauHoi'])} cau"
    types = [c["type"] for c in b["cauHoi"]]
    assert types == ["mcq"]*5+["fill"]+["solve"]*2, f"bai {b['so']} sai thu tu: {types}"
    for c in b["cauHoi"]:
        if c["type"]=="mcq":
            assert len(c["options"])==4, f"bai {b['so']} mcq thieu options"
            assert len(set(c["options"]))==4, f"bai {b['so']} mcq trung options: {c['options']}"
            assert 0<=c["a"]<=3, f"bai {b['so']} mcq a invalid"
print("STRUCTURE CHECKS PASSED")
