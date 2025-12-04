import { Article } from "../models/article";
const { DateTime } = require("luxon");
const currentDate = DateTime.now().toObject();
var resetTime: boolean = false;
console.log(currentDate);

/* Write a monthly checker that resets viewsmonthly */

/* possible logic issue for later on is that it might continue to reset the views the whole day or when articles are fetched. Possibly */
function monthCheck() {
  const currentDay = currentDate.day;
  const resetDay = 1;
  if (currentDay === resetDay) {
    resetTime = true;
    return resetTime;
  } else {
    resetTime = false;
    return resetTime;
  }
}

/* Somehow get this to apply to all articles when called */
function resetMonthlyViews() {
  monthCheck();
  if (resetTime === true) {
    console.log("for me to see");
  } else {
    null;
  }
}
