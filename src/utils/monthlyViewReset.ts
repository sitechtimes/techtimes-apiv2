import { Article } from "../models/article";
const { DateTime } = require("luxon");
const currentDate = DateTime.now().toObject();
var resetTime: boolean = false;
var resetDone: boolean = false;
console.log(currentDate);

function monthCheck() {
  const currentDay = currentDate.day;
  const resetDay: number = 1;
  if (currentDay === resetDay && resetDone === false) {
    resetTime = true;
    return resetTime;
  } else if (currentDay === resetDay && resetDone === true) {
    resetTime = false;
    return resetTime;
  } else if (currentDay !== resetDay) {
    /* this whole function has to run every day then somewhere in order for the logic to work */
    resetDone = false;
    resetTime = false;
    return [resetTime, resetDone];
  } else {
    resetTime = false;
    return resetTime;
  }
}

export async function resetMonthlyViews() {
  monthCheck();
  if (resetTime === true && resetDone === false) {
    resetDone = true;
    return [resetDone, Article.updateMany({}, { viewCountMonthly: 0 })];
  } else {
    null;
  }
}
