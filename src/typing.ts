export interface inputs {
  type: string;
  path: string;
  default_tag: string;
}

export interface tags {
  tag: string;
  keywords: Array<string>;
}

export interface templates {
  tags: tags[];
  type: string;
  default_tag: string;
}
