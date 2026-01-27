import { Article } from "../models/article";
const { DateTime } = require("luxon");
const currentDate = DateTime.now().toObject();
export let resetTime: boolean = false;
export let resetDone: boolean = false;
export let resetSorting: number = 0;
// resetsorting detrmines if  it neeeds to rank the prev month articles by views. if 0 then yes, if 1 then it auto updates by monthlyViews.
export const resetDay: number = 1;

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
    resetSorting = 0;
    return [resetTime, resetDone, resetSorting];
  } else {
    resetTime = false;
    return resetTime;
  }
}

export function resetSorted() {
  return (resetSorting += 1);
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

/* Only for use in the trending endpoint */
