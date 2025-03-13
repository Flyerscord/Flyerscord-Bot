import { promises as fs } from "node:fs";
import process from "node:process";
import path from "node:path";
import Module from "./common/models/Module";
import Stumper, { LOG_LEVEL } from "stumper";
import prettier from "prettier";

Stumper.setConfig({ logLevel: LOG_LEVEL.ALL });

interface IDefaultConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

function combineObjects(objList: object[]): object {
  return objList.reduce((acc, obj) => ({ ...acc, ...obj }), {});
}

async function getModulesFiles(): Promise<string[]> {
  const directory = `${__dirname}/modules`;
  const moduleFolders = await fs.readdir(directory, { withFileTypes: true });
  const moduleFiles: string[] = [];

  for (const folder of moduleFolders) {
    if (folder.isDirectory()) {
      const files = await fs.readdir(folder.path, { withFileTypes: true });
      moduleFiles.push(files.filter((file) => file.isFile())[0].path);
    }
  }

  return moduleFiles;
}

async function getDefaultModuleConfigs(): Promise<IDefaultConfig> {
  const moduleFiles = await getModulesFiles();

  const objects = [];

  // Get common module config
  const commonModule = await import("./common/CommonModule");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  objects.push((commonModule.default.getInstance({}) as unknown as Module<any>).getDefaultModuleConfig());

  for (const file of moduleFiles) {
    const module = await import(file);

    objects.push(module.default.getInstance({}).getDefaultModuleConfig());
  }

  Stumper.info(`Found ${objects.length} modules!`, "getModuleConfigs");

  return combineObjects(objects);
}

async function writeObjectToTsFile(filePath: string, data: object): Promise<void> {
  try {
    const tsContent = `export default ${JSON.stringify(data, null, 2)};\n`;
    const formatted = await prettier.format(tsContent, {
      parser: "babel",
      trailingComma: "all",
      tabWidth: 2,
      singleQuote: false,
    });

    await fs.writeFile(filePath, formatted, "utf-8");
    console.log(`Data written to ${filePath}`);
  } catch (error) {
    console.error("Error writing to file:", error);
  }
}

async function main(): Promise<void> {
  const environment = process.env.ENVIRONMENT || "";

  let fileLocation = path.join(__dirname, "/common/config/defaults.config.ts");
  if (environment === "docker") {
    fileLocation = "/config/defaults.config.ts";
  }

  Stumper.warning("It is safe to ignore all of the Config for module {module} not found errors. They are expected.", "main:main");
  const defaultConfig = await getDefaultModuleConfigs();
  await writeObjectToTsFile(fileLocation, defaultConfig);
}

main();
