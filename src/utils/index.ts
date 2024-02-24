export function bankersRoundingTruncateToInt(num: number): number {
    return bankersRounding(num, 0);
}
export function bankersRounding(
    num: number,
    decimalPlaces: number = 2
): number {
    var d = decimalPlaces;
    var m = Math.pow(10, d);
    var n = +(d ? num * m : num).toFixed(8); // Avoid rounding errors
    var i = Math.floor(n),
        f = n - i;
    var e = 1e-8; // Allow for rounding errors in f
    var r =
        f > 0.5 - e && f < 0.5 + e ? (i % 2 == 0 ? i : i + 1) : Math.round(n);

    return d ? r / m : r;
}
