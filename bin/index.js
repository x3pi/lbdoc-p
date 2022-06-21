#! /usr/bin/env node
const { Command } = require("commander");
const program = new Command();
const fs = require("fs").promises;
const path = require("path");
const json2md = require("json2md");
const shell = require("shelljs");


const PATH_CWD = process.cwd();
async function main() {
  program
    .name("string-util")
    .description("CLI to lbdoc-p")
    .version("1.0.0");

  program
    .command("create")
    .description(
      "vuepress lbdoc-p create"
    )
    .option("-d, --dir <string>", "separator character", "./common/models")
    .action(create);
  
  program
    .command("dev")
    .description("vuepress lbdoc-p dev")
    .action(dev);

  program
    .command("build")
    .description("vuepress lbdoc-p build")
    .action(build);
  await program.parseAsync(process.argv);
}
async function create(options) {
  try {
    var obj = JSON.parse(await fs.readFile(PATH_CWD + "/lbdoc-p.json", "utf8"));
    await fs.mkdir(PATH_CWD + "/lbdoc-p/docs/.vuepress", { recursive: true });
    await fs.writeFile(
      PATH_CWD + "/lbdoc-p/docs/.vuepress/config.js",
      `
const getConfig = require("vuepress-bar");
const { nav, sidebar } = getConfig();

module.exports = { themeConfig: { nav, sidebar } };
module.exports = {
  lang: '${obj.info.lang}',
  title: '${obj.info.title}',
  description: '${obj.info.description}',
  themeConfig: { nav, sidebar }
}
   `
    );

    await fs.writeFile(
      PATH_CWD + "/lbdoc-p/docs/README.md",
      `
# ${obj.info.title}

${obj.info.description}
`
    );
    const inDir = await fs.readdir(options.dir);
    const jsonsInDir = inDir.filter((file) => path.extname(file) === ".json");
    renderings(options.dir, jsonsInDir);
  } catch (error) {
    console.error(error);
  }
}

function dev(){
  shell.exec("npx vuepress dev ./lbdoc-p/docs");
}

function build(){
  shell.exec("npx vuepress build ./lbdoc-p/docs");
}



const renderings = (dir, jsonsInDir) => {
  return Promise.all(
    jsonsInDir.map(async (item) => {
      var obj = JSON.parse(await fs.readFile(dir + "/" + item, "utf8"));
      if (
        !(
          Object.keys(obj.methods).length === 0 &&
          obj.methods.constructor === Object
        )
      ) {
        let jsonobj = [];
        jsonobj.push({ h1: obj.name });
        for (const property in obj.methods) {
          jsonobj.push({ h2: property });
          jsonobj.push({ p: obj.methods[property].description });
          jsonobj.push({ h3: "Request" });
          jsonobj.push({
            p:
              "`" +
              `${obj.methods[property].http[0].verb.toUpperCase()}   ${
                obj.methods[property].http[0].path
              }` +
              "`",
          });
          jsonobj.push({ h3: "Parameters" });
          param = {
            table: {
              headers: ["Arg", "Type", "Required", "Description"],
              rows: [],
            },
          };
          if (
            obj.methods[property].accepts &&
            obj.methods[property].accepts.length > 0
          ) {
            obj.methods[property].accepts.forEach((value, index, array) => {
              param.table.rows.push([
                value.arg,
                value.type,
                String(value.required),
                value.description,
              ]);
            });
            jsonobj.push(param);
          }
          jsonobj.push({ h3: "Response" });
          jsonobj.push({h4:
            `
    {
      arg: ${obj.methods[property].returns[0].arg},
      type: ${obj.methods[property].returns[0].type},
      root: ${String(obj.methods[property].returns[0].root)},
      description: ${obj.methods[property].returns[0].description}
    }
            `
          })
        }
        try {
          await fs.writeFile(
            PATH_CWD + "/lbdoc-p/docs/" + obj.name + ".md",
            json2md(jsonobj)
          );
        } catch (error) {
          console.error(error);
        }
      }
    })
  ).then(() => {
    console.log("Items processed");
  });
};

main();
