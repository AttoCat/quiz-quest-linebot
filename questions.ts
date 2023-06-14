type milliseconds = number;
type isoDatetime = string;
export const isQuestionsAvailable = (
  currentTime: isoDatetime,
  hintOpenTime: isoDatetime,
) => {
  return Date.parse(currentTime) >= Date.parse(hintOpenTime);
};
