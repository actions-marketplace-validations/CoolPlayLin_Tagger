# Tagger

A useful tool for tagging issues and pull_request

## Configure

- Example Configuration File

```json
[
  {
    "tag": "bug",
    "keyword": ["bug"]
  },
  {
    "tag": "enhancement",
    "keyword": ["documentation"]
  },
  {
    "tag": "help wanted",
    "keywords": ["help wanted"]
  }
]
```

- Permission

```yml
permissions:
  pull-requests: write
  issues: write
  contents: read
```

> Note: If you don't specify a path, then it will automatically generate a configuration file, and the key and keyword of the configuration file are all tags

## Inputs

| Arguments         | Description                                    | Default                | Require | Limit                     |
| ----------------- | ---------------------------------------------- | ---------------------- | ------- | ------------------------- |
| repo-token        | The GitHub token used to manage labels         | ` github.token` | No      |                           |
| type              | Determine whether to tag pull_request or issue |                        | Yes     | `pull_request` or `issue` |
| path              | The path to the configuration file             |                        | No      |                           |
| indeterminate-tag | The label used when all labels do not match    | `triage-needed`        | No      |                           |
