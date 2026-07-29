const theoretical = {};
for(let i=3; i<=18; i++) theoretical[`TOTAL_${i}`] = 0;
theoretical.TRIPLE = 0;
theoretical.SMALL = 0;
theoretical.BIG = 0;
theoretical.ODD = 0;
theoretical.EVEN = 0;

for (let d1=1; d1<=6; d1++) {
    for (let d2=1; d2<=6; d2++) {
        for (let d3=1; d3<=6; d3++) {
            let total = d1 + d2 + d3;
            let isTriple = (d1 === d2 && d2 === d3);
            if (isTriple) theoretical.TRIPLE++;
            if (!isTriple && total >= 4 && total <= 10) theoretical.SMALL++;
            if (!isTriple && total >= 11 && total <= 17) theoretical.BIG++;
            if (!isTriple && total % 2 !== 0) theoretical.ODD++;
            if (!isTriple && total % 2 === 0) theoretical.EVEN++;
            theoretical[`TOTAL_${total}`]++;
        }
    }
}

for (let k in theoretical) {
    theoretical[k] = theoretical[k] / 216;
}

const NEW_PAYOUTS = {
    SMALL: 2, BIG: 2, ODD: 2, EVEN: 2, TRIPLE: 34,
    TOTAL_4: 65, TOTAL_5: 34, TOTAL_6: 20, TOTAL_7: 14, TOTAL_8: 10, TOTAL_9: 8, TOTAL_10: 7,
    TOTAL_11: 7, TOTAL_12: 8, TOTAL_13: 10, TOTAL_14: 14, TOTAL_15: 20, TOTAL_16: 34, TOTAL_17: 65
};

for (let k in NEW_PAYOUTS) {
    console.log(`${k} : multiplier x${NEW_PAYOUTS[k]}, RTP: ${(theoretical[k] * NEW_PAYOUTS[k] * 100).toFixed(2)}%`);
}
