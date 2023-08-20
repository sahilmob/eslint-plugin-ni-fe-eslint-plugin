/**
 * @fileoverview This rule enforces constant case for translation keys.
 * @author Sahil H. Mubaideen
 */
import { types } from "@babel/core";
import { Rule, Scope } from "eslint";
import { constantCase } from "change-case";

import { getModuleScope } from "../helpers";

const MESSAGE_ID = "constantCase";
const DEFAULT_TRANSLATION_HOOK_NAME = "useTranslation";
export const ERROR_MESSAGE = "Translation key must be in CONSTANT_CASE";

const traverseUpToFindTranslationHookSpecifierCall = (
  context: Rule.RuleContext,
  hookName: string
) => {
  let scope: Scope.Scope | null = context.getScope();
  let result;
  while (scope?.type !== "module") {
    const refs = scope?.references;
    if (refs?.length) {
      const callRef = refs.find((r) => r.identifier.name === hookName);

      if (callRef) {
        result = callRef;
        break;
      }
    }

    scope = scope?.upper || null;
  }

  return result;
};

const isConstantCase = (string: any) => {
  if (!(typeof string === "string")) return true;

  return string.split(".").every((s) => constantCase(s) === s);
};

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    hasSuggestions: true,
    messages: {
      [MESSAGE_ID]: ERROR_MESSAGE,
    },
    schema: [
      {
        type: "object",
        properties: {
          translationHookName: { type: "string" },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const hookName =
      context.options[0]?.translationHookName || DEFAULT_TRANSLATION_HOOK_NAME;
    return {
      CallExpression(node) {
        const moduleScope = getModuleScope(context);

        if (!moduleScope) return;

        const translationHookSpecifier = moduleScope.set.get(hookName);
        if (!translationHookSpecifier) return;

        const translationHookSpecifierCall =
          traverseUpToFindTranslationHookSpecifierCall(context, hookName);

        // translation hook might be imported but not used;
        if (!translationHookSpecifierCall) return;
        if (
          !types.isCallExpression(
            translationHookSpecifierCall.identifier.parent
          )
        )
          return;

        const parentId =
          translationHookSpecifierCall.identifier?.parent?.parent?.id;

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
                messageId: MESSAGE_ID,
                fix: (fixer) => {
                  const fixed = (
                    node.arguments?.[0] as unknown as types.StringLiteral
                  )?.value
                    .split(".")
                    .map((v) => constantCase(v))
                    .join(".");
                  return fixer.replaceText(node.arguments[0], fixed);
                },
              },
            ],
          });
        } else if (types.isIdentifier(parentId)) {
          // @ts-ignore
          if (!types.isMemberExpression(node.callee)) return;
          if (
            !types.isIdentifier(
              (node.callee as unknown as types.MemberExpression).object
            ) ||
            // @ts-ignore
            (node.callee as unknown as types.MemberExpression).object.name !==
              parentId.name
          )
            return;
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
                messageId: MESSAGE_ID,
                fix: (fixer) => {
                  const fixed = (
                    node.arguments?.[0] as unknown as types.StringLiteral
                  )?.value
                    .split(".")
                    .map((v) => constantCase(v))
                    .join(".");
                  return fixer.replaceText(node.arguments[0], fixed);
                },
              },
            ],
          });
        }
      },
    };
  },
};

export default rule;
