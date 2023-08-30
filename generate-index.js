/* eslint-disable */
import * as fs from "fs";
import path from "path";

function* indexGenerator(dirPath = "") {
  const filesPath = fs.readdirSync(dirPath, {
    recursive: true,
    encoding: "utf8",
  });
  for (const filePath of filesPath) {
    if (filePath === "index.ts") {
      continue;
    }
    const ext = path.extname(filePath);
    const name = path.basename(filePath, ext);
    const exportPath = "./" +
      path.posix.normalize(filePath.slice(0, -ext.length));
    const fileText = fs.readFileSync(path.join(dirPath, filePath), "utf8");
    if (fileText.includes("export default")) {
      yield `export { default as ${name} } from "${String
        .raw`${exportPath}`}";`;
    }
    yield `export * from "${String.raw`${exportPath}`}";`;
  }
  return;
}

function generateIndex(dirPath = "") {
  fs.writeFileSync(
    path.join(dirPath, "index.ts"),
    [...indexGenerator(dirPath)].join("\n"),
  );
}

generateIndex("src/GraphDrawer");
generateIndex("src/utils");
