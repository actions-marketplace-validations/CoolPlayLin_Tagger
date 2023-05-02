import { context } from "@actions/github";
import * as core from "@actions/core";
import * as t from "./typing";
import { Octokit } from "@octokit/rest";
import * as fs from "fs";

var __version__: string = "0.0.1";

var Tag: Array<string> = ["issue", "pull_request"];
var github = new Octokit({
  auth: core.getInput("repo-token"),
  baseUrl: "https://api.github.com",
  userAgent: `Tagger ${__version__}`,
});
declare global {
  let cfg: any
}


async function get_config(
  type: string,
  path: string,
  indeterminate_tag: string
) {
  const input: t.inputs = {
    type: type,
    path: path,
    indeterminate_tag: indeterminate_tag,
  };
  // Verify Value
  if (!Boolean(input.path)) {
    input.path = false;
  }
  if (input.type == "pr") {
    input.type = "pull_request";
  }
  if (!Tag.includes(input.type)) {
    let error = Error("type is neither an issue nor a pull_request");
    throw error;
  }
  // Automatically generate configuration file (path not specified)
  if (!input.path) {
    var labels = await github.rest.issues.listLabelsForRepo({
      owner: context.repo.owner,
      repo: context.repo.repo
    });
    var tags = labels.data.map(function (obj) {
      return obj.name;
    });
    var template = [];
    for (let tag of tags) {
      template.push({
        tag: tag,
        keywords: [tag],
      });
    }
    return {
      templates: template,
      type: input.type,
      indeterminate_tag: input.indeterminate_tag,
    };
  } else if (typeof input.path == "string") {
    // Read configuration file
    return {
      templates: JSON.parse(fs.readFileSync(input.path, "utf-8")),
      type: input.type,
      indeterminate_tag: input.indeterminate_tag,
    };

    return {
      templates: [],
      indeterminate_tag: "",
      type: ""
    }
}
}

function get_labels(
  owner: string,
  repo: string,
  issue_number: number | undefined
): Array<string> {
  if (typeof issue_number == "number") {
    github.rest.issues
      .get({
        owner: owner,
        repo: repo,
        issue_number: issue_number,
      })
      .then((obj) => {
        return obj.data.labels.map(function (tag) {
          if (typeof tag == "string") {
            return tag;
          } else {
            return tag.name;
          }
        });
      });
  } else {
    let error = TypeError;
    throw error;
  }
  return [];
}

class Tagger {
  private config;
  private labels;

  constructor(config: t.config, labels: Array<string>) {
    this.config = config;
    this.labels = labels;
  }
  pr = context.payload.pull_request;

  tag(title: string) {
    const labelsToAdd = [];
    const labelConditions = this.config.templates;

    // Add tags based on conditions
    for (const { tag, keywords } of labelConditions) {
      for (const keyword of keywords) {
        if (title.includes(keyword)) {
          labelsToAdd.push(tag);
          break;
        }
      }
    }

    if (labelsToAdd.length == 0) {
      labelsToAdd.push(this.config.indeterminate_tag);
    }

    return labelsToAdd;
  }
  issue_label() {
    let issue = context.payload.issue;

    // Add tags
    if (typeof issue?.number == "number") {
      github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issue?.number,
        labels: this.tag(issue.title),
      });
    }
  }
  pr_label() {
    let pr = context.payload.pull_request;

    // Add tags
    if (typeof pr?.number == "number") {
      github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: pr?.number,
        labels: this.tag(pr.title),
      });
    }
  }
}

export function main() {
  try {
    get_config(
      core.getInput("type").toLowerCase(),
      core.getInput("path"),
      core.getInput("indeterminate_tag")
    ).then((obj) => {
        cfg = obj
    });
    let labels = get_labels(
      context.repo.owner,
      context.repo.repo,
      context.payload.issue?.number
    );
    const tagger = new Tagger(cfg, labels);

    switch (cfg.type) {
      case "pull_request":
        tagger.pr_label();
        break;
      case "issue":
        tagger.issue_label();
        break;
    }
  } catch (error: any) {
    core.error(error);
    core.setFailed(error.message);
  }
}
