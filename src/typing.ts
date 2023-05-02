export interface inputs {
  type: string;
  path: boolean | string
}

export interface template {
  tag: string
  keyword: Array<string>
}

export interface config {
  templates: inputs[]
  type: string
}