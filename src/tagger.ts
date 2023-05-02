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

function get_input(input: t.inputs) {
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
  return input;
}

function get_config(type: string, path: string) {
  const inputs: t.inputs = {
    type: type,
    path: path,
  };
  var input = get_input(inputs);
  // Automatically generate configuration file (path not specified)
  if (!input.path) {
    github.rest.issues
      .listLabelsForRepo({
        owner: context.repo.owner,
        repo: context.repo.repo,
      })
      .then((labels) => {
        const tags = labels.data.map(function (obj) {
          return obj.name;
        });
        var template: t.template[] = [];
        for (let label of tags) {
          template.push({
            tag: label,
            keyword: [label],
          });
        }
      });
  } else if (typeof input.path == "string") {
    // Read configuration file
    var template = JSON.parse(fs.readFileSync(input.path, "utf-8"));
  }

  let config: t.config = {
    templates: template,
    type: input.type,
  };

  return config;
}

function get_labels(owner: string, repo: string, issue_number: number | undefined) {
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
    let error = TypeError
    throw error
  }
}
export function main() {
  let cfg = get_config(
    core.getInput("type").toLowerCase(),
    core.getInput("path")
  );
  let labels = get_labels(
    context.repo.owner,
    context.repo.repo,
    context.payload.issue?.number
  );
}
