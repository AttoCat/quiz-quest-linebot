export interface FlexCarouselMessage {
  type: "carousel";
  contents: FlexMessageBubble[];
}

export interface FlexMessageBubble {
  type: "bubble";
  size: string;
  header: FlexMessageBox;
  body: FlexMessageBody;
  footer: FlexMessageBox;
}

type FlexMessageBody = FlexMessageBox;

export interface FlexMessageBox {
  type: "box";
  layout: string;
  contents: Array<FlexMessageBox | FlexMessageContent>;
  spacing?: string;
  paddingAll?: string;
  paddingTop?: string;
  paddingBottom?: string;
}

export interface FlexMessageContent {
  type: string;
  action?: Action;
  text?: string;
  weight?: string;
  size?: string;
  wrap?: boolean;
}

export interface Action {
  type: string;
  label: string;
  text: string;
}
