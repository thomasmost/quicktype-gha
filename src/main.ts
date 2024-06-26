import * as core from "@actions/core";
import { quicktype, InputData, JSONSchemaInput } from "quicktype-core";

import * as fs from "fs";

async function quicktypeJSONSchema(name: string, lang: string, schema: string, noJsonSchema: boolean = false) {
  const schemaInput = new JSONSchemaInput(undefined);
  await schemaInput.addSource({ name, schema });

  const inputData = new InputData();
  inputData.addInput(schemaInput);

  return await quicktype({
    inputData,
    lang,
    rendererOptions: {
      "schema": noJsonSchema ? "true" : false,
      "just-types": "true",
      "acronym-style": "original",
    },
  });
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Fetch the value of the input 'who-to-greet' specified in action.yml
    const sourceFile = core.getInput("source-file");
    const outLang = core.getInput("out-langs");
    let outDir = core.getInput("out-dir");

    const noJsonSchema = core.getInput("no-json-schema") === "true";

    const outputLangs = outLang.split(",");
    console.log("outputLangs: ", outputLangs);

    const content = fs.readFileSync(sourceFile, "utf-8");
    const name = sourceFile.split("/").pop()?.split(".")?.[0];
    if (!name) {
      // Handle errors and indicate failure
      throw "Invalid sourcefile";
    }

    // if does not end with / add it
    if (!outDir.endsWith("/")) {
      outDir += "/";
    }

    for (const lang of outputLangs) {
      console.log("Generating types for", sourceFile, "using lang: ", lang);
      let data = await quicktypeJSONSchema(name, lang, content, noJsonSchema);
      console.log("Writing file: ", `${outDir}${name}.${lang}`);
      fs.writeFileSync(`${name}.${lang}`, data.lines.join("\n"));
    }

    const time = new Date().toTimeString();
    core.setOutput("time", time);
  } catch (error: any) {
    // Handle errors and indicate failure
    core.setFailed(error.message);
  }
}
