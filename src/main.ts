import * as core from "@actions/core";
import { quicktype, InputData, JSONSchemaInput } from "quicktype-core";

import * as fs from "fs";

async function quicktypeJSONSchema(name: string, lang: string, schema: string) {
  const schemaInput = new JSONSchemaInput(undefined);
  await schemaInput.addSource({ name, schema });

  const inputData = new InputData();
  inputData.addInput(schemaInput);

  return await quicktype({
    inputData,
    lang,
    rendererOptions: {
      justTypes: "true",
      acronymStyle: "original",
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

    const outputLangs = outLang.split(",");
    console.log("outputLangs: ", outputLangs);

    const content = fs.readFileSync(sourceFile, "utf-8");
    const name = sourceFile.split("/").pop()?.split(".")?.[0];
    if (!name) {
      // Handle errors and indicate failure
      throw "Invalid sourcefile";
    }

    for (const lang of outputLangs) {
      console.log("Generating types for", sourceFile, "using lang: ", lang);
      let data = await quicktypeJSONSchema(name, lang, content);
      console.log("Writing file: ", `${name}.${lang}`);
      fs.writeFileSync(`${name}.${lang}`, data.lines.join("\n"));
    }

    const time = new Date().toTimeString();
    core.setOutput("time", time);
  } catch (error: any) {
    // Handle errors and indicate failure
    core.setFailed(error.message);
  }
}
