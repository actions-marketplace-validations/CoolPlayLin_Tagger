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
permission:
  pull_request: write
  issue: write
  context: read
```

> Note: If you don't specify a path, then it will automatically generate a configuration file, and the key and keyword of the configuration file are all tags

## Inputs

| Arguments  | Description                                    | Default                | Require | Limit                     |
| ---------- | ---------------------------------------------- | ---------------------- | ------- | ------------------------- |
| repo-token | The GitHub token used to manage labels         | `secrets.GITHUB_TOKEN` | No      |                           |
| type       | Determine whether to tag pull_request or issue |                        | Yes     | `pull_request` or `issue` |
| path       | The path to the configuration file             |                        | No      |                           |
