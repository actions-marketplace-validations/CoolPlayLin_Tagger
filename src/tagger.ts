import { context } from "@actions/github";
import * as core from "@actions/core";
import { Octokit } from "@octokit/rest";
import * as t from "./typing";
import * as fs from "fs";

var run = ["issue", "pull_request"];

var github = new Octokit({
  auth: core.getInput("repo-token"),
});

function get_inputs() {
  let data: t.inputs = {
    type: core.getInput("type"),
    path: core.getInput("path"),
    default_tag: core.getInput("indeterminate-tag"),
  };

  return data;
}

function tags(title: string, templates: t.templates): Array<string> {
  const tagsToAdd: Array<string> = [];
  // Add tags based on conditions
  for (const { tag, keywords } of templates.tags) {
    for (const keyword of keywords) {
      if (title.includes(keyword)) {
        tagsToAdd.push(tag);
        break;
      }
    }
  }

  if (tagsToAdd.length == 0) {
    tagsToAdd.push("triage-needed");
  }
  return tagsToAdd;
}

async function get_template(
  type: string,
  path: string,
  default_tag: string
): Promise<t.templates> {
  // Get tag data
  if (Boolean(path)) {
    fetch(path)
      .then((Response) => Response.json())
      .then((tag_data) => {
        return {
          tags: tag_data,
          type: type,
          default_tag: default_tag,
        };
      });
  } else {
    await github.rest.issues
      .listLabelsForRepo({
        owner: context.repo.owner,
        repo: context.repo.repo,
      })
      .then((data) => {
        let tags = data.data.map(function (obj) {
          return obj.name;
        });

        let tag_data: t.tags[] = [];
        for (let tag of tags) {
          tag_data.push({
            tag: tag,
            keywords: [tag],
          });
        }

        return {
          tags: tag_data,
          type: type,
          default_tag: default_tag,
        };
      });
  }

  return {
    tags: [],
    type: "",
    default_tag: "",
  };
}

export function main() {
  let data = get_inputs();
  get_template(data.type, data.path, data.default_tag).then((obj) => {
    switch (obj.type) {
      case run[0]: 
      const {issue} = context.payload
      if (typeof issue?.number == "number"){
        github.rest.issues.addLabels({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: issue.number,
          labels: tags(issue.title, obj),
        });
      } else {
        let error = TypeError("context.payload.issue?.number is undefined")
        throw error
      }
      break
      case run[1]:
        const {pull_request} = context.payload
        if (typeof pull_request?.number == "number"){
          github.rest.issues.addLabels({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: pull_request?.number,
            labels: tags(pull_request.title, obj),
          });
        } else {
          let error = TypeError("context.payload.pull_request?.number is undefined")
          throw error
        }
        break
    }
  });
}
