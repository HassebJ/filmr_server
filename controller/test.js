/**
 * Created by mac on 4/30/15.
 */
var str = "abcdfghijklmnopqrstuvwxyz".split("");
var charPairs = [];
for (var i = 0; i<str.length; i++) {
    for (var j = 0; j < str.length; j++) {
        charPairs.push(str[i] + str[j]);
    }
}
console.log(charPairs);