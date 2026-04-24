declare module "react-twemoji" {
  import { ReactNode } from "react";

  export interface TwemojiOptions {
    ext?: string;
    className?: string;
    size?: string | number;
    base?: string;
    folder?: string;
  }

  export interface TwemojiProps {
    children?: ReactNode;
    options?: TwemojiOptions;
    noWrapper?: boolean;
    tag?: string;
  }

  export default function Twemoji(props: TwemojiProps): JSX.Element;
}
