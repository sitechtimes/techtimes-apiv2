import { Article } from "../models/article";
const { DateTime } = require("luxon");
const currentDate = DateTime.now().toObject();
var resetTime: boolean = false;
var resetDone: boolean = false;
console.log(currentDate);

function monthCheck() {
  const currentDay = currentDate.day;
  const resetDay: number = 9;
  if (currentDay === resetDay && resetDone === false) {
    resetTime = true;
    console.log("1");
    return resetTime;
  } else if (currentDay === resetDay && resetDone === true) {
    resetTime = false;
    console.log("2");
    return resetTime;
  } else if (currentDay !== resetDay) {
    /* this whole function has to run every day then somewhere in order for the logic to work */
    resetDone = false;
    resetTime = false;
    console.log("3");
    return [resetTime, resetDone];
  } else {
    resetTime = false;
    console.log("4");
    return resetTime;
  }
}

export async function resetMonthlyViews() {
  monthCheck();
  if (resetTime === true && resetDone === false) {
    resetDone = true;
    await Article.updateMany({}, { $set: { viewCountMonthly: 0 } });
    console.log("TESTTTTTT");
    return resetDone;
  } else {
    console.log("HELLP");
    null;
  }
}
