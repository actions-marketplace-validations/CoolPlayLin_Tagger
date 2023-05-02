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

function get_input() {
  // Get Value
  const input: t.inputs = {
    type: core.getInput("type").toLowerCase(),
    path: core.getInput("path"),
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
  return input;
}

function get_config() {
  var input = get_input();
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
    var template = JSON.parse(fs.readFileSync(input.path, 'utf-8'))
  }

  let config:t.config = {
    templates: template,
    type: input.type
  }

  return config
}

export function main() {
    var cfg = get_config()
}
