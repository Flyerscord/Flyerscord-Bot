import path from "node:path";

const STUMPER_METHODS = new Set(["error", "warning", "info", "success", "debug", "caughtError", "caughtWarning"]);

const stumperTagFormat = {
  meta: {
    type: "problem",
    docs: {
      description: 'Enforce Stumper tag format "module:File:function"',
    },
    messages: {
      wrongSegmentCount: 'Stumper tag "{{tag}}" must have exactly 3 colon-separated segments (module:File:function), got {{count}}.',
      wrongFileSegment: 'Stumper tag "{{tag}}" file segment "{{actual}}" does not match filename "{{expected}}".',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const { callee, arguments: args } = node;

        if (
          callee.type !== "MemberExpression" ||
          callee.object.type !== "Identifier" ||
          callee.object.name !== "Stumper" ||
          callee.property.type !== "Identifier" ||
          !STUMPER_METHODS.has(callee.property.name)
        ) {
          return;
        }

        const tagArg = args[1];
        if (!tagArg || tagArg.type !== "Literal" || typeof tagArg.value !== "string") {
          // Skip template literals and non-string args
          return;
        }

        const tag = tagArg.value;

        // Skip Discord internal tags (wrapped in [])
        if (tag.startsWith("[")) {
          return;
        }

        const parts = tag.split(":");

        if (parts.length !== 3) {
          context.report({
            node: tagArg,
            messageId: "wrongSegmentCount",
            data: { tag, count: parts.length },
          });
          return;
        }

        const filename = path.basename(context.filename ?? context.getFilename(), ".ts");
        const fileSegment = parts[1];

        if (fileSegment !== filename) {
          context.report({
            node: tagArg,
            messageId: "wrongFileSegment",
            data: { tag, actual: fileSegment, expected: filename },
          });
        }
      },
    };
  },
};

export const localRulesPlugin = {
  rules: {
    "stumper-tag-format": stumperTagFormat,
  },
};
