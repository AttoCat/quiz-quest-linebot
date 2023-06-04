import { format } from "https://deno.land/std@0.187.0/datetime/format.ts";
import {
  FlexCarouselMessage,
  FlexMessageBubble,
  FlexMessageContent,
} from "./types.ts";

const HINT_LABELS = "ABCDEFGHIJKLMN".split("").concat([
  "文書X",
  "文書Y",
]);
const TEMPLATE_CAROUSEL: FlexCarouselMessage = JSON.parse(
  await Deno.readTextFile("./templates/message-template.json"),
);
const TEMPLATE_EXTRA_BUBBLE: FlexMessageBubble = JSON.parse(
  await Deno.readTextFile("./templates/bubble-template.json"),
);
type milliseconds = number;
type numberOfHints = number;

export const getAvailableHints = (
  currentTime: string,
  timeTable: string[],
): [numberOfHints, milliseconds | null] => {
  const UnixCurrentTime: milliseconds = Date.parse(currentTime);
  const UnixTimeTable: milliseconds[] = timeTable.map((time) =>
    Date.parse(time)
  );
  console.log(UnixTimeTable);
  console.log(UnixCurrentTime);
  for (const [index, time] of UnixTimeTable.entries()) {
    if (UnixCurrentTime < time) return [index, time];
  }
  return [timeTable.length, null];
};

export const composeHintMessage = (
  availableHints: number,
  nextMilliSeconds: milliseconds | null,
) => {
  const buttons: FlexMessageContent[] = [...Array(availableHints).keys()].map(
    (n) => {
      return {
        type: "button",
        action: {
          type: "message",
          label: `${HINT_LABELS[n]}のヒント`,
          text: `#ヒント${HINT_LABELS[n]}`,
        },
      };
    },
  );
  const carousel: FlexCarouselMessage = JSON.parse(
    JSON.stringify(TEMPLATE_CAROUSEL),
  );
  const currentHintsText = (availableHints === 16)
    ? "すべてのヒントが"
    : `現在${availableHints}個`;
  carousel.contents[0].body.contents.push({
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "text",
        text: `${currentHintsText}公開済です。`,
        size: "xs",
      },
    ],
    paddingBottom: "20px",
  });
  if (availableHints >= 0) {
    carousel.contents[0].body.contents.push({
      type: "box",
      layout: "vertical",
      contents: buttons.slice(0, 4),
    });
  }
  if (availableHints >= 5) {
    carousel.contents.push(JSON.parse(
      JSON.stringify(TEMPLATE_EXTRA_BUBBLE),
    ));
    carousel.contents[1].body.contents.push({
      type: "box",
      layout: "vertical",
      contents: buttons.slice(4, 10),
    });
  }
  if (availableHints >= 11) {
    carousel.contents.push(JSON.parse(
      JSON.stringify(TEMPLATE_EXTRA_BUBBLE),
    ));
    carousel.contents[2].body.contents.push({
      type: "box",
      layout: "vertical",
      contents: buttons.slice(10, 16),
    });
  }
  const nextTimeText = (nextMilliSeconds === null) ? " " : format(
    new Date(
      nextMilliSeconds +
        ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000),
    ),
    "次の更新: HH:mm(20分毎)",
  );
  const footer: FlexMessageContent = {
    type: "text",
    text: nextTimeText,
    size: "xxs",
  };
  carousel.contents[0].footer.contents.push(footer);
  return { type: "flex", altText: "ヒント一覧", contents: carousel };
};

export const replyHintsMessage = async (
  currentTime: Date,
  channelAccessToken: string,
  replyToken: string,
  hintTimeTable: string[],
) => {
  const [availableHints, nextMilliSeconds] = getAvailableHints(
    currentTime.toISOString(),
    hintTimeTable,
  );
  console.log(channelAccessToken, replyToken, hintTimeTable);
  const hintsMessage = composeHintMessage(availableHints, nextMilliSeconds);
  console.log(JSON.stringify(hintsMessage));
  const result = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    body: JSON.stringify({ replyToken: replyToken, messages: [hintsMessage] }),
    headers: {
      "Authorization": `Bearer ${channelAccessToken}`,
      "Content-Type": "application/json",
    },
  });
  console.log(JSON.stringify(await result.json()));
};
