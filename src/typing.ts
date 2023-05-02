export interface inputs {
  type: string;
  path: boolean | string;
  indeterminate_tag: string;
}

export interface template {
  tag: string;
  keywords: Array<string>;
}

export interface config {
  templates: template[];
  type: string;
  indeterminate_tag: string;
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
