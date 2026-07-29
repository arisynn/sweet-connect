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

const targetRTP = 0.95; // 95% RTP
const suggestedPayouts = {};

for (let k in theoretical) {
    if (theoretical[k] > 0) {
        // payout * prob = RTP
        // payout = RTP / prob
        suggestedPayouts[k] = targetRTP / theoretical[k];
    }
}

console.log("Theoretical Probabilities:");
console.log(theoretical);
console.log("\nSuggested Payouts (RTP = ~0.95):");
console.log(suggestedPayouts);

