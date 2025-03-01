import { promises as fs } from "node:fs";
import path from "node:path";
import { IDefaultConfig } from "./common/interfaces/IDefaultConfig";
import Module from "./common/models/Module";
import Stumper, { LOG_LEVEL } from "stumper";

Stumper.setConfig({ logLevel: LOG_LEVEL.ALL });

function combineObjects(objList: object[]): object {
  return objList.reduce((acc, obj) => ({ ...acc, ...obj }), {});
}

async function getModulesFiles(): Promise<string[]> {
  const directory = `${__dirname}/modules`;
  const entities = await fs.readdir(directory, { withFileTypes: true });

  return entities.filter((entity) => entity.isFile()).map((file) => path.join(directory, file.name));
}

async function getModuleConfigs(): Promise<IDefaultConfig> {
  const moduleFiles = await getModulesFiles();

  const objects = [];

  // Get common module config
  const commonModule = await import("./common/CommonModule");
  objects.push((commonModule as unknown as Module).getModuleConfig());

  for (const file of moduleFiles) {
    const module = await import(file);

    objects.push(module.default.getModuleConfig());
  }

  Stumper.info(`Found ${objects.length} modules!`, "getModuleConfigs");

  return combineObjects(objects);
}

async function writeObjectToTsFile(filePath: string, data: object): Promise<void> {
  try {
    const tsContent = `export default ${JSON.stringify(data, null, 2)};\n`;
    await fs.writeFile(filePath, tsContent, "utf-8");
    console.log(`Data written to ${filePath}`);
  } catch (error) {
    console.error("Error writing to file:", error);
  }
}

async function main(): Promise<void> {
  const defaultConfig = await getModuleConfigs();
  await writeObjectToTsFile(path.join(__dirname, "/common/config/defaults.config.ts"), defaultConfig);
}

main();
