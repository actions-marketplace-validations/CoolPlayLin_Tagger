export interface inputs {
  type: string;
  path: boolean | string;
}

export interface template {
  tag: string;
  keyword: Array<string>;
}

export interface config {
  templates: inputs[];
  type: string;
}

export interface label {
  id?: number;
  node_id?: string;
  url?: string;
  name?: string;
  description?: string | null;
  color?: string | null;
  default?: boolean;
}
