import { Rule } from "eslint";
import { types } from "@babel/core";
import { constantCase } from "change-case";

import { getModuleScope } from "../helpers";

const DEFAULT_TRANSLATION_HOOK_NAME = "useTranslation";

export const ERROR_MESSAGE = "Translation key must be in CONSTANT_CASE";

const traverseUpToFindTranslationHookSpecifierCall = (context) => {
  let scope = context.getScope();
  let result;
  while (scope.type !== "module") {
    const refs = scope.references;
    if (refs.length) {
      const callRef = refs.find(
        (r) => r.identifier.name === DEFAULT_TRANSLATION_HOOK_NAME
      );

      if (callRef) {
        result = callRef;
        break;
      }
    }

    scope = scope.upper;
  }

  return result;
};

const isConstantCase = (string) => {
  return constantCase(string) === string;
};

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    hasSuggestions: true,
    messages: {
      constantCase: ERROR_MESSAGE,
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const moduleScope = getModuleScope(context);

        if (!moduleScope) return;

        const translationHookSpecifier = moduleScope.set.get(
          DEFAULT_TRANSLATION_HOOK_NAME
        );
        if (!translationHookSpecifier) return;

        const translationHookSpecifierCall =
          traverseUpToFindTranslationHookSpecifierCall(context);

        // translation hook might be imported but not used;
        if (!translationHookSpecifierCall) return;
        if (
          !types.isCallExpression(
            translationHookSpecifierCall.identifier.parent
          )
        )
          return;

        const parentId =
          translationHookSpecifierCall.identifier?.parent?.parent?.id; // optch

        if (types.isObjectPattern(parentId)) {
          const nodeName = (node.callee as unknown as types.Identifier).name;
          const parentIdProps = parentId.properties;

          if (!parentIdProps.length) return;

          const translationFunctionProp = parentIdProps.find(
            // @ts-ignore
            (p) => types.isIdentifier(p.key) && p.key.name === nodeName
          );

          if (!translationFunctionProp) return;

          if (
            isConstantCase(
              (node.arguments?.[0] as unknown as types.StringLiteral).value
            )
          )
            return;
          context.report({
            node: node.arguments[0],
            message: ERROR_MESSAGE,
            suggest: [
              {
                messageId: "constantCase",
                fix: (fixer) => {
                  const fixed = constantCase(
                    (node.arguments?.[0] as unknown as types.StringLiteral)
                      ?.value
                  );
                  return fixer.replaceText(node.arguments[0], fixed);
                },
              },
            ],
          });
        } else if (types.isIdentifier(parentId)) {
          // TODO: handle this case
        }
      },
    };
  },
};

export default rule;
