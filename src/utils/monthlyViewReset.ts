import { Article } from "../models/article";
const { DateTime } = require("luxon");
const currentDate = DateTime.now().toObject();
export let resetTime: boolean = false;
export let resetDone: boolean = false;
export const resetDay: number = 7;

function monthCheck() {
  const currentDay = currentDate.day;
  if (currentDay === resetDay && resetDone === false) {
    resetTime = true;
    return resetTime;
  } else if (currentDay === resetDay && resetDone === true) {
    resetTime = false;
    return resetTime;
  } else if (currentDay !== resetDay) {
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
  if (resetTime === false) {
    return;
  } else if (resetTime === true) {
    try {
      const result = await Article.updateMany({}, { $set: { viewCountMonthly: 0 } }).exec();
      resetDone = true;
      return result;
    } catch (err) {
      throw err;
    }
  }
}

/* Only for use in the trending endpoint to reset the views at the start of the month */
